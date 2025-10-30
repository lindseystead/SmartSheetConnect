/**
 * Storage Interface Module
 * 
 * Defines the storage interface for lead submissions and provides
 * an in-memory implementation that integrates with Google Sheets,
 * email, and Slack notifications.
 * 
 * @author Lindsey Stead
 * @module server/storage
 */

import { type LeadSubmission } from "@shared/schema";
import { appendLeadToSheet } from "./googleSheets";
import { sendEmailNotification } from "./email";
import { sendSlackNotification } from "./slack";

/**
 * Storage interface for lead submission operations.
 * Defines the contract that all storage implementations must follow.
 */
export interface IStorage {
  /**
   * Submits a new lead to storage and triggers notifications.
   * 
   * @param {LeadSubmission} lead - The lead data to submit
   * @returns {Promise<{spreadsheetId: string, rowNumber: number}>} Result with spreadsheet ID and row number
   */
  submitLead(lead: LeadSubmission): Promise<{ spreadsheetId: string; rowNumber: number }>;
}

/**
 * In-memory storage implementation.
 * Stores leads in Google Sheets and sends notifications via email and Slack.
 */
export class MemStorage implements IStorage {
  /**
   * Submits a lead to Google Sheets and sends notifications.
   * This method performs three operations in parallel after logging to Sheets:
   * 1. Logs the lead to Google Sheets
   * 2. Sends an email notification
   * 3. Sends a Slack notification
   * 
   * @param {LeadSubmission} lead - The lead submission data
   * @returns {Promise<{spreadsheetId: string, rowNumber: number}>} Result with spreadsheet details
   * @throws {Error} If Google Sheets logging fails
   */
  async submitLead(lead: LeadSubmission): Promise<{ spreadsheetId: string; rowNumber: number }> {
    try {
      // Log to Google Sheets (primary operation)
      const result = await appendLeadToSheet(
        lead.name,
        lead.email,
        lead.phone,
        lead.message
      );
      
      // Send notifications (non-blocking, errors are logged but don't fail the request)
      const notificationEmail = process.env.NOTIFICATION_EMAIL || 'info@lifesavertech.ca';
      
      // Execute notifications in parallel
      await Promise.allSettled([
        sendEmailNotification(
          notificationEmail,
          lead.name,
          lead.email,
          lead.phone,
          lead.message,
          result.spreadsheetId
        ),
        sendSlackNotification(
          lead.name,
          lead.email,
          lead.phone,
          lead.message,
          result.spreadsheetId
        )
      ]);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to submit lead: ${errorMessage}`);
    }
  }
}

/**
 * Singleton storage instance used throughout the application.
 */
export const storage = new MemStorage();
