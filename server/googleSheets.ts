/**
 * Google Sheets Integration Module
 * 
 * Handles authentication and data operations for Google Sheets API.
 * Supports both OAuth2 credentials and platform-specific authentication.
 * 
 * @author Lindsey Stead
 * @module server/googleSheets
 */

import { google } from 'googleapis';

let connectionSettings: any;

/**
 * Retrieves a valid access token for Google Sheets API.
 * Checks token expiration and refreshes if necessary.
 * 
 * @returns {Promise<string>} A valid Google OAuth2 access token
 * @throws {Error} If authentication credentials are not properly configured
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (connectionSettings?.settings?.expires_at && 
      new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  // Check for platform-specific authentication (e.g., Replit connectors)
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const replitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (replitToken && hostname) {
    // Use platform-specific OAuth connector
    try {
      connectionSettings = await fetch(
        `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=google-sheet`,
        {
          headers: {
            'Accept': 'application/json',
            'X_REPLIT_TOKEN': replitToken
          }
        }
      ).then(res => res.json()).then(data => data.items?.[0]);

      const accessToken = connectionSettings?.settings?.access_token || 
                         connectionSettings?.settings?.oauth?.credentials?.access_token;

      if (accessToken) {
        return accessToken;
      }
    } catch (error) {
      console.warn('Platform-specific auth failed, falling back to standard OAuth');
    }
  }
  
  // Fallback to standard OAuth2 credentials
  // To use this method, set these environment variables:
  // - GOOGLE_CLIENT_ID
  // - GOOGLE_CLIENT_SECRET
  // - GOOGLE_REFRESH_TOKEN
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  
  if (clientId && clientSecret && refreshToken) {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost' // Redirect URI (not used for refresh token flow)
    );
    
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials.access_token!;
  }
  
  throw new Error(
    'Google Sheets authentication not configured. ' +
    'Please set up OAuth2 credentials or use a platform connector.'
  );
}

/**
 * Creates and returns an authenticated Google Sheets API client.
 * 
 * @returns {Promise<sheets_v4.Sheets>} Authenticated Google Sheets API client
 */
export async function getUncachableGoogleSheetClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

// In-memory cache for the spreadsheet ID (persists across requests in same process)
let cachedSpreadsheetId: string | null = null;

/**
 * Creates a new Google Spreadsheet or retrieves an existing one.
 * Uses the SPREADSHEET_ID environment variable if set, otherwise creates a new sheet.
 * 
 * @returns {Promise<string>} The Google Sheets spreadsheet ID
 * @throws {Error} If spreadsheet creation or retrieval fails
 */
export async function createOrGetSpreadsheet(): Promise<string> {
  const sheets = await getUncachableGoogleSheetClient();
  
  // Return cached ID if available
  if (cachedSpreadsheetId) {
    return cachedSpreadsheetId;
  }
  
  // Check if SPREADSHEET_ID is set in environment
  if (process.env.SPREADSHEET_ID) {
    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
      });
      cachedSpreadsheetId = response.data.spreadsheetId!;
      console.log(`📊 Using existing spreadsheet: ${cachedSpreadsheetId}`);
      return cachedSpreadsheetId;
    } catch (error) {
      console.warn('SPREADSHEET_ID in environment is invalid, creating new spreadsheet');
    }
  }
  
  // Create new spreadsheet with headers
  try {
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'Lifesaver Technology Services - Lead Submissions',
        },
        sheets: [
          {
            properties: {
              title: 'Leads',
            },
          },
        ],
      },
    });
    
    const spreadsheetId = response.data.spreadsheetId!;
    
    // Add headers to the new sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Leads!A1:E1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          ['Timestamp', 'Name', 'Email', 'Phone', 'Message'],
        ],
      },
    });
    
    cachedSpreadsheetId = spreadsheetId;
    console.log(`✅ Created new spreadsheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
    console.log(`💡 Set SPREADSHEET_ID=${spreadsheetId} to reuse this sheet`);
    
    return spreadsheetId;
  } catch (error) {
    throw new Error(`Failed to create spreadsheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Appends a new lead submission to the Google Sheets spreadsheet.
 * 
 * @param {string} name - Lead's full name
 * @param {string} email - Lead's email address
 * @param {string | undefined} phone - Lead's phone number (optional)
 * @param {string} message - Lead's message
 * @returns {Promise<{spreadsheetId: string, rowNumber: number}>} Result with spreadsheet ID and row number
 * @throws {Error} If the append operation fails
 */
export async function appendLeadToSheet(
  name: string,
  email: string,
  phone: string | undefined,
  message: string
): Promise<{ spreadsheetId: string; rowNumber: number }> {
  try {
    const sheets = await getUncachableGoogleSheetClient();
    const spreadsheetId = await createOrGetSpreadsheet();
    
    const timestamp = new Date().toISOString();
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Leads!A:E',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [timestamp, name, email, phone || '', message],
        ],
      },
    });

    const rowNumber = response.data.updates?.updatedRows || 0;
    console.log(`✅ Lead appended to row ${rowNumber} in spreadsheet ${spreadsheetId}`);

    return {
      spreadsheetId,
      rowNumber,
    };
  } catch (error) {
    throw new Error(`Failed to append lead to sheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
