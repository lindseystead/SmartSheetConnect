/**
 * Google Sheets Integration Module
 * 
 * Handles authentication and data operations for Google Sheets API.
 * Supports both OAuth2 credentials and platform-specific authentication.
 * 
 * @author Lindsey Stead
 * @module server/services/googleSheets
 */

import { google } from 'googleapis';
import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get project root directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

/**
 * Automatically adds SPREADSHEET_ID to .env file if it doesn't exist.
 * This ensures the spreadsheet is always reused, even after server restart.
 * 
 * @param {string} spreadsheetId - The spreadsheet ID to save
 * @returns {Promise<void>}
 */
async function saveSpreadsheetIdToEnv(spreadsheetId: string): Promise<void> {
  try {
    const envPath = resolve(projectRoot, '.env');
    
    // Check if .env file exists
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch (error) {
      // .env file doesn't exist, that's okay - we'll skip auto-save
      console.log('💡 .env file not found, skipping automatic SPREADSHEET_ID save');
      return;
    }
    
    // Check if SPREADSHEET_ID already exists
    if (envContent.includes('SPREADSHEET_ID=')) {
      // Already exists, don't overwrite (user may have set it manually)
      return;
    }
    
    // Add SPREADSHEET_ID to .env file
    // Add a newline if file doesn't end with one
    const newLine = envContent.endsWith('\n') ? '' : '\n';
    const newContent = `${envContent}${newLine}# Automatically added: Spreadsheet ID for persistent reuse\nSPREADSHEET_ID=${spreadsheetId}\n`;
    
    await fs.writeFile(envPath, newContent, 'utf-8');
    console.log(`✅ Automatically saved SPREADSHEET_ID to .env file`);
    console.log(`   This ensures the same spreadsheet is always reused, even after server restart.`);
    
  } catch (error) {
    // Don't throw error - this is a convenience feature, not critical
    // Log warning but don't break the application
    console.warn('⚠️ Could not automatically save SPREADSHEET_ID to .env file:', error instanceof Error ? error.message : 'Unknown error');
    console.warn('   You can manually add SPREADSHEET_ID to your .env file to prevent duplicate spreadsheets.');
  }
}

/**
 * Retrieves a valid Google OAuth2 access token.
 * 
 * Uses refresh token to obtain a new access token. Access tokens are short-lived
 * (typically 1 hour), so we refresh them each time we need to make an API call.
 * 
 * @returns {Promise<string>} Valid Google OAuth2 access token
 * @throws {Error} If credentials are not configured or token refresh fails
 * 
 * @private
 * @internal
 */
async function getAccessToken(): Promise<string> {
  // ============================================================================
  // GET OAUTH2 CREDENTIALS FROM ENVIRONMENT
  // ============================================================================
  
  // Read OAuth2 credentials from environment variables
  // These must be set in .env file before the application can use Google APIs
  // To use this method, set these environment variables:
  // - GOOGLE_CLIENT_ID: OAuth2 Client ID from Google Cloud Console
  // - GOOGLE_CLIENT_SECRET: OAuth2 Client Secret from Google Cloud Console
  // - GOOGLE_REFRESH_TOKEN: Long-lived refresh token from OAuth2 flow
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  
  // ============================================================================
  // VALIDATE CREDENTIALS
  // ============================================================================
  
  // Check if all required credentials are present
  // If any are missing, throw error with helpful message
  // Trim whitespace in case values have leading/trailing spaces
  if (!clientId?.trim() || !clientSecret?.trim() || !refreshToken?.trim()) {
    // In development, log which variables are missing for easier debugging
    const missing = [];
    if (!clientId?.trim()) missing.push('GOOGLE_CLIENT_ID');
    if (!clientSecret?.trim()) missing.push('GOOGLE_CLIENT_SECRET');
    if (!refreshToken?.trim()) missing.push('GOOGLE_REFRESH_TOKEN');
    
    const errorMessage = 
      'Google Sheets authentication not configured. ' +
      `Missing or empty variables: ${missing.join(', ')}. ` +
      'Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN environment variables in your .env file.';
    
    // Log details in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Google API Credentials Check:');
      console.error(`  GOOGLE_CLIENT_ID: ${clientId ? `Set (${clientId.length} chars)` : 'NOT SET'}`);
      console.error(`  GOOGLE_CLIENT_SECRET: ${clientSecret ? `Set (${clientSecret.length} chars)` : 'NOT SET'}`);
      console.error(`  GOOGLE_REFRESH_TOKEN: ${refreshToken ? `Set (${refreshToken.length} chars)` : 'NOT SET'}`);
      console.error('Make sure your .env file is in the project root and the server has been restarted after adding variables.');
    }
    
    throw new Error(errorMessage);
  }
  
  // ============================================================================
  // CREATE OAUTH2 CLIENT
  // ============================================================================
  
  // Create OAuth2 client instance for token refresh
  // Redirect URI is required by constructor but not used in refresh token flow
  const oauth2Client = new google.auth.OAuth2(
    clientId, // OAuth2 Client ID from Google Cloud Console
    clientSecret, // OAuth2 Client Secret from Google Cloud Console
    'http://localhost' // Redirect URI (not used for refresh token flow, but required)
  );
  
  // ============================================================================
  // SET CREDENTIALS AND REFRESH TOKEN
  // ============================================================================
  
  // Set credentials with refresh token
  // Refresh token is long-lived and used to get new access tokens
  oauth2Client.setCredentials({
    refresh_token: refreshToken // Long-lived refresh token from OAuth2 flow
  });
  
  // ============================================================================
  // EXCHANGE REFRESH TOKEN FOR ACCESS TOKEN
  // ============================================================================
  
  // Attempt to refresh access token
  // Access tokens are short-lived (typically 1 hour), so we refresh each time
  try {
    // Exchange refresh token for new access token
    // This validates the refresh token and returns a new access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Extract access token from credentials
    // Access token is required for making Google API calls
    const accessToken = credentials.access_token;
    
    // Validate that access token was obtained
    if (!accessToken) {
      throw new Error('Failed to obtain access token from refresh token');
    }
    
    // Return valid access token for API calls
    return accessToken;
    
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    
    // Extract error message safely (handles both Error objects and other types)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Throw error with descriptive message for upstream error handling
    // This error will be caught by routes.ts error handler
    throw new Error(
      `Failed to refresh Google OAuth2 access token: ${errorMessage}. ` +
      'Please verify your GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are correct.'
    );
  }
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
 * Gets the organization name from environment or uses a default.
 * 
 * @returns {string} Organization name for spreadsheet naming
 */
function getOrganizationName(): string {
  const orgName = process.env.ORGANIZATION_NAME || process.env.COMPANY_NAME || 'Your Organization';
  return orgName.trim();
}

/**
 * Gets the spreadsheet title based on organization name.
 * 
 * @returns {string} Formatted spreadsheet title
 */
function getSpreadsheetTitle(): string {
  const orgName = getOrganizationName();
  return `SmartSheetConnect - ${orgName} - Website Form Leads`;
}

/**
 * Searches for an existing spreadsheet by name using Drive API.
 * 
 * @param {string} title - Spreadsheet title to search for
 * @returns {Promise<string | null>} Spreadsheet ID if found, null otherwise
 */
/**
 * Searches for an existing spreadsheet by name using Drive API.
 * 
 * Uses Google Drive API to search for spreadsheets matching the given title.
 * Returns the most recently modified spreadsheet if multiple matches exist.
 * 
 * @param {string} title - Spreadsheet title to search for
 * @returns {Promise<string | null>} Spreadsheet ID if found, null otherwise
 * 
 * @throws Never throws - always returns null on error to allow creating new spreadsheet
 */
async function findExistingSpreadsheet(title: string): Promise<string | null> {
  try {
    // ========================================================================
    // AUTHENTICATION
    // ========================================================================
    
    // Get access token for Drive API
    // Uses same OAuth2 credentials as Google Sheets API
    const accessToken = await getAccessToken();
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    // ========================================================================
    // DRIVE API SEARCH
    // ========================================================================
    
    // Use Drive API to search for existing spreadsheet
    // Drive API allows searching files by name and MIME type
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Search query:
    // - name='[title]' - Exact name match (escaped for SQL-like query)
    // - mimeType='application/vnd.google-apps.spreadsheet' - Only Google Sheets
    // - trashed=false - Exclude deleted files
    const response = await drive.files.list({
      q: `name='${title.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id, name)', // Only return ID and name (optimize response)
      orderBy: 'modifiedTime desc', // Get most recently modified first
      pageSize: 1, // Only need first result
    });
    
    // ========================================================================
    // RESULT HANDLING
    // ========================================================================
    
    // If spreadsheet found, return its ID
    if (response.data.files && response.data.files.length > 0) {
      const spreadsheetId = response.data.files[0].id!;
      console.log(`📊 Found existing spreadsheet: ${title}`);
      console.log(`   URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
      return spreadsheetId;
    }
    
    // No spreadsheet found, return null
    return null;
    
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    
    // If Drive API search fails, just return null and create new spreadsheet
    // This is expected if:
    // - Drive API isn't enabled in Google Cloud Console
    // - Drive API permissions aren't granted
    // - Network error occurs
    // - API quota exceeded
    // 
    // We don't throw an error here because we can still create a new spreadsheet
    // This ensures the application continues to work even if Drive API is unavailable
    return null;
  }
}

/**
 * Creates a new Google Spreadsheet or retrieves an existing one.
 * Uses the SPREADSHEET_ID environment variable if set, otherwise searches for
 * existing spreadsheet by name, or creates a new one with organization-specific name.
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
  
  // ========================================================================
  // PRIORITY 1: CHECK ENVIRONMENT VARIABLE (SPREADSHEET_ID)
  // ========================================================================
  
  // Check if SPREADSHEET_ID is set in environment (highest priority)
  // If set, use this specific spreadsheet instead of searching by name
  if (process.env.SPREADSHEET_ID) {
    try {
      // Verify the spreadsheet exists and is accessible
      const response = await sheets.spreadsheets.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
      });
      cachedSpreadsheetId = response.data.spreadsheetId!;
      console.log(`📊 Using existing spreadsheet from SPREADSHEET_ID: ${cachedSpreadsheetId}`);
      return cachedSpreadsheetId;
    } catch (error) {
      // If SPREADSHEET_ID is invalid (doesn't exist or no access), log warning
      // Continue to next priority: search by name or create new
      console.warn('SPREADSHEET_ID in environment is invalid, will search or create new spreadsheet');
    }
  }
  
  // ========================================================================
  // PRIORITY 2: SEARCH FOR EXISTING SPREADSHEET BY NAME
  // ========================================================================
  
  // Try to find existing spreadsheet by name using Drive API
  // Spreadsheet name format: "SmartSheetConnect - [Organization Name] - Website Form Leads"
  const spreadsheetTitle = getSpreadsheetTitle();
  const existingId = await findExistingSpreadsheet(spreadsheetTitle);
  
  // If existing spreadsheet found, cache and return it
  if (existingId) {
    cachedSpreadsheetId = existingId;
    return existingId;
  }
  
  // ========================================================================
  // PRIORITY 3: CREATE NEW SPREADSHEET
  // ========================================================================
  
  // No existing spreadsheet found, create a new one with organization-specific name
  try {
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: spreadsheetTitle,
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
    console.log(`✅ Created new spreadsheet: ${spreadsheetTitle}`);
    console.log(`   URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
    
    // Automatically save spreadsheet ID to .env file for persistence
    // This ensures the same spreadsheet is always reused, even after server restart
    await saveSpreadsheetIdToEnv(spreadsheetId);
    
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
    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    
    // Get authenticated Google Sheets API client
    const sheets = await getUncachableGoogleSheetClient();
    
    // Get or create spreadsheet (cached after first call)
    const spreadsheetId = await createOrGetSpreadsheet();
    
    // ========================================================================
    // PREPARE DATA
    // ========================================================================
    
    // Create human-readable timestamp for lead submission
    // Format: "January 15, 2025 at 3:45 PM" (local timezone, easy to read)
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const timestamp = `${dateStr} at ${timeStr}`;
    
    // ========================================================================
    // APPEND LEAD TO SHEET
    // ========================================================================
    
    // Append lead data to Google Sheets spreadsheet
    // Range: 'Leads!A:E' - All columns in Leads sheet (A through E)
    // valueInputOption: 'RAW' - Insert values as-is (no formulas)
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Leads!A:E', // Append to Leads sheet, columns A through E
      valueInputOption: 'RAW', // Insert raw values (not formulas)
      requestBody: {
        values: [
          // Row data: Timestamp, Name, Email, Phone, Message
          [timestamp, name, email, phone || '', message],
        ],
      },
    });

    // ========================================================================
    // RESULT PROCESSING
    // ========================================================================
    
    // Extract row number from API response
    // updatedRows indicates how many rows were added (should be 1)
    const rowNumber = response.data.updates?.updatedRows || 0;
    console.log(`✅ Lead appended to row ${rowNumber} in spreadsheet ${spreadsheetId}`);

    // Return spreadsheet ID and row number for reference
    return {
      spreadsheetId,
      rowNumber,
    };
    
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    
    // Extract error message safely (handles both Error objects and other types)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Throw error with descriptive message for upstream error handling
    // This error will be caught by routes.ts error handler
    throw new Error(`Failed to append lead to sheet: ${errorMessage}`);
  }
}


