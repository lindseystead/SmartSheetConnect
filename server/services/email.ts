/**
 * Email Notification Module
 * 
 * Sends email notifications for new lead submissions.
 * Supports Gmail API with fallback to console logging.
 * 
 * @author Lindsey Stead
 * @module server/services/email
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
  // ============================================================================
  // EMAIL CONTENT PREPARATION
  // ============================================================================
  
  // Build email subject line with lead name
  const emailSubject = `New Lead Submission: ${leadName}`;
  
  // Build email body with lead details and link to Google Sheets
  // Format is plain text, simple and readable
  const emailBody = `
New Lead Details:
-----------------
Name: ${leadName}
Email: ${leadEmail}
Phone: ${leadPhone || 'Not provided'}
Message: ${leadMessage}

View in Google Sheets: https://docs.google.com/spreadsheets/d/${spreadsheetId}

---
Sent from SmartSheetConnect Lead Capture System
  `.trim();
  
  // ============================================================================
  // CONSOLE LOGGING (Always Log)
  // ============================================================================
  
  // Always log email to console for debugging and monitoring
  // This helps diagnose issues when Gmail API isn't configured
  console.log('📧 Email Notification:');
  console.log(`To: ${recipientEmail}`);
  console.log(`Subject: ${emailSubject}`);
  console.log(emailBody);
  
  // ============================================================================
  // GMAIL API ATTEMPT
  // ============================================================================
  
  // Try to send email via Gmail API
  // If Gmail API is not configured or fails, we fall back to console-only logging
  try {
    // Get Gmail API access token using OAuth2 credentials
    // Returns null if credentials are not configured
    const accessToken = await getGmailAccessToken();
    
    // Check if access token was successfully obtained
    // If not, Gmail API is not configured, so skip sending
    if (!accessToken) {
      throw new Error('No Gmail access token available');
    }

    // Create OAuth2 client instance for Gmail API
    // OAuth2 client handles authentication with Google APIs
    const oauth2Client = new google.auth.OAuth2();
    
    // Set credentials with access token obtained from refresh token
    oauth2Client.setCredentials({ access_token: accessToken });
    
    // Create Gmail API client with authentication
    // Version 'v1' is the current stable version of Gmail API
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // ========================================================================
    // MESSAGE FORMATTING (RFC 2822)
    // ========================================================================
    
    // Create email message in RFC 2822 format (Internet Message Format)
    // Required format for Gmail API raw message sending
    const message = [
      `To: ${recipientEmail}`, // Recipient email address
      `Subject: ${emailSubject}`, // Email subject
      '', // Blank line separates headers from body
      emailBody // Email body content
    ].join('\n');
    
    // ========================================================================
    // BASE64URL ENCODING
    // ========================================================================
    
    // Encode message in base64url format (URL-safe base64)
    // Gmail API requires raw messages to be base64url encoded
    const encodedMessage = Buffer.from(message)
      .toString('base64') // Convert to base64
      .replace(/\+/g, '-') // Replace + with - (URL-safe)
      .replace(/\//g, '_') // Replace / with _ (URL-safe)
      .replace(/=+$/, ''); // Remove padding = characters
    
    // ========================================================================
    // SEND EMAIL VIA GMAIL API
    // ========================================================================
    
    // Send email using Gmail API
    // userId: 'me' refers to the authenticated user (the account with the refresh token)
    await gmail.users.messages.send({
      userId: 'me', // Authenticated user's email
      requestBody: {
        raw: encodedMessage, // Base64url encoded RFC 2822 message
      },
    });
    
    // Log success and return
    console.log('✅ Email sent successfully via Gmail API');
    return { success: true, method: 'gmail' };
    
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING (Fallback to Console-Only)
    // ========================================================================
    
    // If Gmail API fails, we don't throw an error
    // Instead, we log to console and return success with 'console-only' method
    // This ensures notification failures don't break the lead submission process
    
    // Extract error message safely
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Extract detailed error information if available
    let detailedError = errorMessage;
    if (error instanceof Error && 'response' in error) {
      const googleError = error as any;
      if (googleError.response?.data?.error) {
        detailedError = `${errorMessage} - ${JSON.stringify(googleError.response.data.error)}`;
      }
    }
    
    // Log warning about Gmail API failure with full details
    console.error(`❌ Could not send email via Gmail API:`);
    console.error(`   Error: ${detailedError}`);
    console.error(`   Recipient: ${recipientEmail}`);
    console.error(`💡 Email logged to console. Configure Gmail API credentials to enable email delivery.`);
    console.error(`💡 Common issues:`);
    console.error(`   1. Gmail API not enabled in Google Cloud Console`);
    console.error(`   2. Refresh token missing 'https://www.googleapis.com/auth/gmail.send' scope`);
    console.error(`   3. Invalid or expired refresh token`);
    
    // Return success (email was logged to console, which is acceptable)
    // The lead submission is still successful even if email notification fails
    return { success: true, method: 'console-only' };
  }
}

/**
 * Retrieves a Gmail API access token using OAuth2 credentials.
 * 
 * This function uses the same OAuth2 credentials as Google Sheets API.
 * It exchanges the refresh token for a new access token.
 * 
 * @returns {Promise<string | null>} Access token if credentials are configured, null otherwise
 * @throws {Error} If token refresh fails (credentials may be invalid)
 * 
 * @private
 * @internal
 */
async function getGmailAccessToken(): Promise<string | null> {
  // ============================================================================
  // GET OAUTH2 CREDENTIALS FROM ENVIRONMENT
  // ============================================================================
  
  // Read OAuth2 credentials from environment variables
  // These are the same credentials used for Google Sheets API
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  
  // ============================================================================
  // VALIDATE CREDENTIALS
  // ============================================================================
  
  // Check if all required credentials are present
  // If any are missing, Gmail API is not configured, return null
  if (clientId && clientSecret && refreshToken) {
    // ========================================================================
    // CREATE OAUTH2 CLIENT
    // ========================================================================
    
    // Create OAuth2 client instance
    // Redirect URI is not used for refresh token flow, but required for constructor
    const oauth2Client = new google.auth.OAuth2(
      clientId, // OAuth2 Client ID from Google Cloud Console
      clientSecret, // OAuth2 Client Secret from Google Cloud Console
      'http://localhost' // Redirect URI (not used in refresh token flow)
    );
    
    // ========================================================================
    // SET CREDENTIALS AND REFRESH TOKEN
    // ========================================================================
    
    // Set credentials with refresh token
    // Refresh token is long-lived and used to get new access tokens
    oauth2Client.setCredentials({
      refresh_token: refreshToken // Long-lived refresh token from OAuth flow
    });
    
    // ========================================================================
    // EXCHANGE REFRESH TOKEN FOR ACCESS TOKEN
    // ========================================================================
    
    // Exchange refresh token for new access token
    // Access tokens are short-lived (typically 1 hour), so we refresh them each time
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Return access token if available, null otherwise
      return credentials.access_token || null;
    } catch (error) {
      // If token refresh fails, log detailed error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to get Gmail access token: ${errorMessage}`);
      console.error(`   This usually means:`);
      console.error(`   1. Refresh token is invalid or expired`);
      console.error(`   2. Refresh token doesn't have Gmail scope`);
      console.error(`   3. OAuth credentials are incorrect`);
      return null;
    }
  }
  
  // No credentials configured, return null
  // This allows the calling function to fall back to console-only logging
  return null;
}

