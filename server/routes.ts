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
import { storage } from "./services/storage";
import { leadSubmissionSchema, type LeadSubmissionResponse } from "@shared/schema";
import { z } from "zod";

/**
 * Registers all API routes with the Express application.
 * 
 * @param {Express} app - Express application instance
 * @returns {Promise<Server>} HTTP server instance
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================================================
  // HEALTH CHECK ENDPOINT
  // ============================================================================
  
  /**
   * GET /api/health
   * 
   * Health check endpoint for monitoring and load balancers.
   * Used by monitoring services to verify server is running and responsive.
   * 
   * Response:
   * - 200: {status: "ok", timestamp: string, uptime: number}
   * 
   * @route GET /api/health
   * @public - No authentication required
   */
  app.get("/api/health", (req, res) => {
    // Return server status information
    // This endpoint is lightweight and fast, suitable for frequent health checks
    res.json({
      status: "ok", // Server is healthy
      timestamp: new Date().toISOString(), // Current server time (ISO 8601 format)
      uptime: process.uptime(), // Server uptime in seconds
    });
  });

  // ============================================================================
  // LEAD SUBMISSION ENDPOINT
  // ============================================================================
  
  /**
   * POST /api/submit-lead
   * 
   * Submits a new lead to the system.
   * 
   * Process flow:
   * 1. Checks honeypot field for spam protection
   * 2. Validates input data using Zod schema
   * 3. Logs lead to Google Sheets (auto-creates spreadsheet if needed)
   * 4. Sends email notification (if configured)
   * 5. Sends Slack notification (if configured)
   * 
   * Request Body:
   * - name (string, required): Lead's full name (max 100 chars)
   * - email (string, required): Valid email address (max 255 chars)
   * - phone (string, optional): Phone number (validated format)
   * - message (string, required): Lead's message (max 1000 chars)
   * - _honeypot (string, optional): Spam protection field (should be empty)
   * 
   * Response:
   * - 200: Success with {success: true, message: string, rowNumber: number}
   * - 400: Validation error (invalid input data)
   * - 429: Too many requests (rate limited)
   * - 500: Server error (internal error)
   * 
   * @route POST /api/submit-lead
   * @public - No authentication required (public form submission)
   */
  app.post("/api/submit-lead", async (req, res) => {
    try {
      // ========================================================================
      // SPAM PROTECTION: Honeypot Field Check
      // ========================================================================
      
      // Honeypot is a hidden field that only bots will fill out
      // If honeypot field has any value, this is likely spam
      // We silently accept it (return success) to avoid revealing honeypot exists
      if (req.body._honeypot && req.body._honeypot !== "") {
        // Log potential spam attempt for monitoring
        // Don't reveal to client that we detected spam (don't give attackers feedback)
        console.warn(`[${req.id || "unknown"}] Potential spam detected: honeypot field filled`);
        
        // Return success to avoid revealing honeypot mechanism
        return res.json({
          success: true,
          message: "Lead submitted successfully",
        });
      }

      // Remove honeypot field from data before validation
      // This prevents honeypot from causing validation errors
      const { _honeypot, ...submissionData } = req.body;

      // ========================================================================
      // INPUT VALIDATION
      // ========================================================================
      
      // Validate request body against Zod schema
      // This ensures all required fields are present and formatted correctly
      // Throws ZodError if validation fails (caught in catch block below)
      const validatedData = leadSubmissionSchema.parse(submissionData);
      
      // ========================================================================
      // PROCESS LEAD SUBMISSION
      // ========================================================================
      
      // Submit lead to storage system:
      // 1. Appends lead to Google Sheets (creates spreadsheet if needed)
      // 2. Sends email notification (if Gmail API configured)
      // 3. Sends Slack notification (if webhook URL configured)
      // Errors in notifications don't fail the request (they're logged but ignored)
      const result = await storage.submitLead(validatedData);
      
      // Build success response
      const response: LeadSubmissionResponse = {
        success: true,
        message: "Lead submitted successfully",
        rowNumber: result.rowNumber, // Row number in Google Sheets (for reference)
      };
      
      // Send success response to client
      res.json(response);
    } catch (error) {
      // ========================================================================
      // ERROR HANDLING
      // ========================================================================
      
      // Get request ID for error tracking (set by express-request-id middleware)
      const requestId = req.id || "unknown";
      
      // Log error with request ID for debugging
      console.error(`[${requestId}] Error submitting lead:`, error);
      
      // ========================================================================
      // VALIDATION ERRORS (400 Bad Request)
      // ========================================================================
      
      // Handle Zod validation errors (invalid input from client)
      // These are user errors (wrong data format, missing required fields, etc.)
      if (error instanceof z.ZodError) {
        // Combine all validation error messages into single string
        // Each error includes field name and validation rule that failed
        const validationErrors = error.errors.map(e => e.message).join(", ");
        
        // Return 400 Bad Request with validation error details
        res.status(400).json({
          success: false,
          message: `Validation error: ${validationErrors}`,
          // Include request ID in development for debugging
          requestId: process.env.NODE_ENV === "development" ? requestId : undefined,
        });
        return;
      }
      
      // ========================================================================
      // SERVER ERRORS (500 Internal Server Error)
      // ========================================================================
      
      // Handle all other errors (API errors, network errors, etc.)
      // These are server-side errors that the client couldn't prevent
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to submit lead";
      
      // Security: Don't expose internal error details to clients in production
      // Production users see generic message, developers see detailed error in logs
      const safeMessage = process.env.NODE_ENV === "production"
        ? "Failed to submit lead. Please try again later."
        : errorMessage;
        
      // Return 500 Internal Server Error
      res.status(500).json({
        success: false,
        message: safeMessage,
        // Include request ID in development for debugging
        requestId: process.env.NODE_ENV === "development" ? requestId : undefined,
      });
    }
  });

  // ============================================================================
  // CREATE HTTP SERVER
  // ============================================================================
  
  // Create HTTP server from Express app
  // This allows us to attach WebSocket server or configure server-level options
  const httpServer = createServer(app);

  // Return server instance (used for Vite HMR integration)
  return httpServer;
}
