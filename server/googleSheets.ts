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

export async function createOrGetSpreadsheet() {
  const sheets = await getUncachableGoogleSheetClient();
  
  // Try to find existing spreadsheet
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID || '',
    });
    return response.data.spreadsheetId!;
  } catch (error) {
    // Create new spreadsheet if it doesn't exist
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
            data: [
              {
                rowData: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: 'Timestamp' } },
                      { userEnteredValue: { stringValue: 'Name' } },
                      { userEnteredValue: { stringValue: 'Email' } },
                      { userEnteredValue: { stringValue: 'Phone' } },
                      { userEnteredValue: { stringValue: 'Message' } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    
    const spreadsheetId = response.data.spreadsheetId!;
    console.log(`Created new spreadsheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
    return spreadsheetId;
  }
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
