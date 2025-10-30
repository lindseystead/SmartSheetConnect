import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { leadSubmissionSchema, type LeadSubmissionResponse } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/submit-lead", async (req, res) => {
    try {
      // Validate request body
      const validatedData = leadSubmissionSchema.parse(req.body);
      
      // Submit lead to Google Sheets and send notification
      const result = await storage.submitLead(validatedData);
      
      const response: LeadSubmissionResponse = {
        success: true,
        message: "Lead submitted successfully",
        rowNumber: result.rowNumber,
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error submitting lead:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation error: " + error.errors.map(e => e.message).join(", "),
        });
      } else {
        res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : "Failed to submit lead",
        });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
