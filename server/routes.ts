/**
 * API Routes Module
 * 
 * Defines all HTTP API endpoints for the application.
 * Handles request validation, error handling, and response formatting.
 * 
 * @author Lindsey Stead
 * @module server/routes
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { leadSubmissionSchema, type LeadSubmissionResponse } from "@shared/schema";
import { z } from "zod";

/**
 * Registers all API routes with the Express application.
 * 
 * @param {Express} app - Express application instance
 * @returns {Promise<Server>} HTTP server instance
 */
export async function registerRoutes(app: Express): Promise<Server> {
  /**
   * POST /api/submit-lead
   * 
   * Submits a new lead to the system.
   * Validates input, logs to Google Sheets, and sends notifications.
   * 
   * Request Body:
   * - name (string, required): Lead's full name
   * - email (string, required): Lead's email address
   * - phone (string, optional): Lead's phone number
   * - message (string, required): Lead's message
   * 
   * Response:
   * - 200: Success with {success: true, message: string, rowNumber: number}
   * - 400: Validation error
   * - 500: Server error
   */
  app.post("/api/submit-lead", async (req, res) => {
    try {
      // Validate request body against schema
      const validatedData = leadSubmissionSchema.parse(req.body);
      
      // Submit lead to storage (logs to Sheets and sends notifications)
      const result = await storage.submitLead(validatedData);
      
      const response: LeadSubmissionResponse = {
        success: true,
        message: "Lead submitted successfully",
        rowNumber: result.rowNumber,
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error submitting lead:", error);
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(e => e.message).join(", ");
        res.status(400).json({
          success: false,
          message: `Validation error: ${validationErrors}`,
        });
        return;
      }
      
      // Handle all other errors
      const errorMessage = error instanceof Error ? error.message : "Failed to submit lead";
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
