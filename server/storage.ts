import { type LeadSubmission } from "@shared/schema";
import { appendLeadToSheet } from "./googleSheets";
import { sendEmailNotification } from "./email";

export interface IStorage {
  submitLead(lead: LeadSubmission): Promise<{ spreadsheetId: string; rowNumber: number }>;
}

export class MemStorage implements IStorage {
  async submitLead(lead: LeadSubmission): Promise<{ spreadsheetId: string; rowNumber: number }> {
    // Log to Google Sheets
    const result = await appendLeadToSheet(
      lead.name,
      lead.email,
      lead.phone,
      lead.message
    );
    
    // Send email notification
    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'info@lifesavertech.ca';
    await sendEmailNotification(
      notificationEmail,
      lead.name,
      lead.email,
      lead.phone,
      lead.message,
      result.spreadsheetId
    );
    
    return result;
  }
}

export const storage = new MemStorage();
