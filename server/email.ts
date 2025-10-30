/**
 * Email Notification Module
 * 
 * Sends email notifications for new lead submissions.
 * Supports Gmail API with fallback to console logging.
 * 
 * @author Lindsey Stead
 * @module server/email
 */

import { google } from 'googleapis';

/**
 * Sends an email notification about a new lead submission.
 * Attempts to use Gmail API if credentials are available, falls back to console logging.
 * 
 * @param {string} recipientEmail - Email address to send notification to
 * @param {string} leadName - Name of the lead who submitted
 * @param {string} leadEmail - Email address of the lead
 * @param {string | undefined} leadPhone - Phone number of the lead (optional)
 * @param {string} leadMessage - Message from the lead
 * @param {string} spreadsheetId - Google Sheets spreadsheet ID containing the lead
 * @returns {Promise<{success: boolean, method: string}>} Result indicating success and delivery method
 */
export async function sendEmailNotification(
  recipientEmail: string,
  leadName: string,
  leadEmail: string,
  leadPhone: string | undefined,
  leadMessage: string,
  spreadsheetId: string
): Promise<{ success: boolean; method: string }> {
  const emailSubject = `New Lead Submission: ${leadName}`;
  const emailBody = `
New Lead Details:
-----------------
Name: ${leadName}
Email: ${leadEmail}
Phone: ${leadPhone || 'Not provided'}
Message: ${leadMessage}

View in Google Sheets: https://docs.google.com/spreadsheets/d/${spreadsheetId}

---
Sent from Lifesaver Technology Services Intake Form
  `.trim();
  
  // Always log to console for debugging
  console.log('📧 Email Notification:');
  console.log(`To: ${recipientEmail}`);
  console.log(`Subject: ${emailSubject}`);
  console.log(emailBody);
  
  // Try to send via Gmail API
  try {
    const accessToken = await getGmailAccessToken();
    
    if (!accessToken) {
      throw new Error('No Gmail access token available');
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Create RFC 2822 formatted email message
    const message = [
      `To: ${recipientEmail}`,
      `Subject: ${emailSubject}`,
      '',
      emailBody
    ].join('\n');
    
    // Encode message in base64url format
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    
    console.log('✅ Email sent successfully via Gmail API');
    return { success: true, method: 'gmail' };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`⚠️ Could not send email via Gmail API: ${errorMessage}`);
    console.log('💡 Email logged to console. Configure Gmail API credentials to enable email delivery.');
    return { success: true, method: 'console-only' };
  }
}

/**
 * Retrieves a Gmail API access token.
 * Supports both platform-specific connectors and standard OAuth2 credentials.
 * 
 * @returns {Promise<string | null>} Access token or null if unavailable
 * @throws {Error} If authentication fails
 */
async function getGmailAccessToken(): Promise<string | null> {
  // Try platform-specific authentication first
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const replitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (replitToken && hostname) {
    try {
      const connectionSettings = await fetch(
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
      // Fall through to standard OAuth
    }
  }
  
  // Standard OAuth2 flow (same credentials as Google Sheets)
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  
  if (clientId && clientSecret && refreshToken) {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost'
    );
    
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials.access_token || null;
  }
  
  return null;
}
