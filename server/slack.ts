/**
 * Slack Notification Module
 * 
 * Sends formatted notifications to Slack via incoming webhooks.
 * Uses Slack Block Kit for rich, interactive messages.
 * 
 * @author Lindsey Stead
 * @module server/slack
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
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('💬 Slack Notification (webhook URL not configured):');
    console.log(`New lead from ${leadName} (${leadEmail})`);
    console.log(`Message: ${leadMessage}`);
    return { success: true, method: 'console-only' };
  }

  // Format message for Slack using Block Kit
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
            text: "Sent from Lifesaver Technology Services Intake Form"
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      throw new Error(`Slack API returned ${response.status}`);
    }

    console.log('✅ Slack notification sent successfully');
    return { success: true, method: 'webhook' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Failed to send Slack notification: ${errorMessage}`);
    return { success: false, method: 'webhook', error };
  }
}
