export async function sendEmailNotification(
  recipientEmail: string,
  leadName: string,
  leadEmail: string,
  leadPhone: string | undefined,
  leadMessage: string,
  spreadsheetId: string
) {
  // For now, log the notification - email integration can be added later
  console.log('📧 Email Notification:');
  console.log(`To: ${recipientEmail}`);
  console.log(`Subject: New Lead Submission: ${leadName}`);
  console.log(`
New Lead Details:
-----------------
Name: ${leadName}
Email: ${leadEmail}
Phone: ${leadPhone || 'Not provided'}
Message: ${leadMessage}

View in Google Sheets: https://docs.google.com/spreadsheets/d/${spreadsheetId}
  `);
  
  // Return success for now
  // In production, integrate with SendGrid, Resend, or Gmail API
  return { success: true };
}
