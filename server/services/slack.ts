/**
 * Slack Notification Module
 * 
 * Sends formatted notifications to Slack via incoming webhooks.
 * Uses Slack Block Kit for rich, interactive messages.
 * 
 * @author Lindsey Stead
 * @module server/services/slack
 */

/**
 * Sends a formatted Slack notification about a new lead submission.
 * Falls back to console logging if webhook URL is not configured.
 * 
 * @param {string} leadName - Name of the lead who submitted
 * @param {string} leadEmail - Email address of the lead
 * @param {string | undefined} leadPhone - Phone number of the lead (optional)
 * @param {string} leadMessage - Message from the lead
 * @param {string} spreadsheetId - Google Sheets spreadsheet ID containing the lead
 * @returns {Promise<{success: boolean, method: string, error?: any}>} Result object with success status and method used
 */
export async function sendSlackNotification(
  leadName: string,
  leadEmail: string,
  leadPhone: string | undefined,
  leadMessage: string,
  spreadsheetId: string
): Promise<{ success: boolean; method: string; error?: any }> {
  // ============================================================================
  // CHECK WEBHOOK CONFIGURATION
  // ============================================================================
  
  // Get Slack webhook URL from environment variables
  // If not configured, fall back to console-only logging
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  // If webhook URL is not configured, log to console and return success
  // This ensures notification failures don't break the lead submission process
  if (!webhookUrl) {
    console.log('💬 Slack Notification (webhook URL not configured):');
    console.log(`New lead from ${leadName} (${leadEmail})`);
    console.log(`Message: ${leadMessage}`);
    // Return success even though webhook wasn't used (logged to console)
    return { success: true, method: 'console-only' };
  }

  // ============================================================================
  // SLACK MESSAGE FORMATTING (BLOCK KIT)
  // ============================================================================
  
  // Format message for Slack using Block Kit (Slack's rich message format)
  // Block Kit allows rich formatting with headers, sections, buttons, etc.
  // Documentation: https://api.slack.com/block-kit
  const slackMessage = {
    text: `🎯 New Lead Submission: ${leadName}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🎯 New Lead Submission",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Name:*\n${leadName}`
          },
          {
            type: "mrkdwn",
            text: `*Email:*\n${leadEmail}`
          },
          {
            type: "mrkdwn",
            text: `*Phone:*\n${leadPhone || 'Not provided'}`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Message:*\n${leadMessage}`
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View in Google Sheets",
              emoji: true
            },
            url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
            style: "primary"
          }
        ]
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Sent from SmartSheetConnect Lead Capture System"
          }
        ]
      }
    ]
  };

  // ============================================================================
  // SEND SLACK NOTIFICATION
  // ============================================================================
  
  // Attempt to send notification via Slack webhook
  // If webhook fails, log error but don't throw (non-blocking)
  try {
    // Send POST request to Slack webhook URL
    // Slack webhooks accept JSON payload with Block Kit message format
    const response = await fetch(webhookUrl, {
      method: 'POST', // HTTP POST method for webhook
      headers: {
        'Content-Type': 'application/json', // JSON content type
      },
      body: JSON.stringify(slackMessage), // Stringify Block Kit message
    });

    // ========================================================================
    // VALIDATE RESPONSE
    // ========================================================================
    
    // Check if response indicates success (200-299 status codes)
    // Slack webhooks return 200 on success, 4xx/5xx on failure
    if (!response.ok) {
      // Throw error with status code for error handling
      throw new Error(`Slack API returned ${response.status}`);
    }

    // ========================================================================
    // SUCCESS
    // ========================================================================
    
    // Log success and return
    console.log('✅ Slack notification sent successfully');
    return { success: true, method: 'webhook' };
    
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    
    // Extract error message safely (handles both Error objects and other types)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log error for debugging and monitoring
    // Don't throw error (return failure instead) to ensure lead submission succeeds
    console.error(`❌ Failed to send Slack notification: ${errorMessage}`);
    
    // Return failure status with error details
    // This allows calling code to handle notification failure if needed
    // Lead submission still succeeds even if Slack notification fails
    return { success: false, method: 'webhook', error };
  }
}

