import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Sheet not connected');
  }
  return accessToken;
}

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

export async function createOrGetSpreadsheet() {
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
      return cachedSpreadsheetId;
    } catch (error) {
      console.warn(`SPREADSHEET_ID in env is invalid, creating new spreadsheet`);
    }
  }
  
  // Create new spreadsheet with headers
  const response = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: 'Lifesaver Tech - Lead Submissions',
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
  console.log(`💡 Set SPREADSHEET_ID=${spreadsheetId} in your environment to reuse this sheet`);
  
  return spreadsheetId;
}

export async function appendLeadToSheet(
  name: string,
  email: string,
  phone: string | undefined,
  message: string
) {
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

  return {
    spreadsheetId,
    rowNumber: response.data.updates?.updatedRows || 0,
  };
}
