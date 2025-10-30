export async function sendEmailNotification(
  recipientEmail: string,
  leadName: string,
  leadEmail: string,
  leadPhone: string | undefined,
  leadMessage: string,
  spreadsheetId: string
) {
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
  
  // Log notification to console
  console.log('📧 Email Notification:');
  console.log(`To: ${recipientEmail}`);
  console.log(`Subject: ${emailSubject}`);
  console.log(emailBody);
  
  // Try to send via Gmail API if available
  try {
    const { google } = await import('googleapis');
    
    // Get the same auth client used for Sheets
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!xReplitToken || !hostname) {
      throw new Error('Auth tokens not available');
    }

    const connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    const accessToken = connectionSettings?.settings?.access_token || 
                       connectionSettings?.settings?.oauth?.credentials?.access_token;

    if (!accessToken) {
      throw new Error('No access token');
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Create email message
    const message = [
      `To: ${recipientEmail}`,
      `Subject: ${emailSubject}`,
      '',
      emailBody
    ].join('\n');
    
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
    console.warn('⚠️ Could not send email via Gmail API:', error instanceof Error ? error.message : 'Unknown error');
    console.log('💡 Email logged to console. To enable email delivery, add Gmail API scope to your Google connection.');
    return { success: true, method: 'console-only' };
  }
}
