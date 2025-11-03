/**
 * API Routes Tests
 * 
 * Tests for Express API endpoints in server/routes.ts.
 * Tests API behavior including validation, error handling, and responses.
 * 
 * @fileoverview
 * These tests validate:
 * - Health check endpoint
 * - Lead submission endpoint (validation, success, errors)
 * - Spam protection (honeypot)
 * - Error handling
 * 
 * Note: These tests use mocked services to avoid actual Google Sheets API calls.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import express, { type Express } from "express";
import { registerRoutes } from "./routes";
import type { Server } from "http";

// Mock the storage service to avoid actual Google Sheets API calls
vi.mock("./services/storage", () => ({
  storage: {
    submitLead: vi.fn(),
  },
}));

// Mock Google Sheets service to avoid actual API calls
vi.mock("./services/googleSheets", () => ({
  appendLeadToSheet: vi.fn(),
  createOrGetSpreadsheet: vi.fn(),
}));

import { storage } from "./services/storage";

describe("API Routes", () => {
  let app: Express;
  let server: Server;

  beforeEach(async () => {
    // Create fresh Express app for each test
    app = express();
    app.use(express.json());
    
    // Register routes and get server
    server = await registerRoutes(app);
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Close server after each test
    if (server) {
      server.close();
    }
  });

  describe("GET /api/health", () => {
    it("should return 200 OK with health status", async () => {
      const response = await request(app)
        .get("/api/health")
        .expect(200);

      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("POST /api/submit-lead", () => {
    beforeEach(() => {
      // Setup default mock implementation
      vi.mocked(storage.submitLead).mockResolvedValue({
        spreadsheetId: "test-spreadsheet-id",
        rowNumber: 2,
      });
    });

    it("should successfully submit a valid lead", async () => {

      const validLead = {
        name: "John Doe",
        email: "john@example.com",
        phone: "(555) 123-4567",
        message: "I'm interested in your services",
      };

      const response = await request(app)
        .post("/api/submit-lead")
        .send(validLead)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String),
        rowNumber: 2,
      });

      expect(storage.submitLead).toHaveBeenCalledWith(validLead);
    });

    it("should accept lead without phone (optional field)", async () => {

      const leadWithoutPhone = {
        name: "Jane Smith",
        email: "jane@example.com",
        message: "Please contact me",
      };

      const response = await request(app)
        .post("/api/submit-lead")
        .send(leadWithoutPhone)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(storage.submitLead).toHaveBeenCalledWith(leadWithoutPhone);
    });

    it("should reject lead with invalid email format", async () => {

      const invalidLead = {
        name: "John Doe",
        email: "notanemail",
        message: "Test message",
      };

      const response = await request(app)
        .post("/api/submit-lead")
        .send(invalidLead)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining("email"),
      });

      expect(storage.submitLead).not.toHaveBeenCalled();
    });

    it("should reject lead with missing required fields", async () => {

      const incompleteLead = {
        name: "John Doe",
        // Missing email and message
      };

      const response = await request(app)
        .post("/api/submit-lead")
        .send(incompleteLead)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(storage.submitLead).not.toHaveBeenCalled();
    });

    it("should silently accept spam submissions (honeypot filled)", async () => {

      const spamLead = {
        name: "Spam Bot",
        email: "spam@example.com",
        message: "Spam message",
        _honeypot: "filled", // Spam indicator
      };

      const response = await request(app)
        .post("/api/submit-lead")
        .send(spamLead)
        .expect(200);

      // Should return success to avoid revealing honeypot
      expect(response.body).toMatchObject({
        success: true,
        message: "Lead submitted successfully",
      });

      // Should not actually submit to storage
      expect(storage.submitLead).not.toHaveBeenCalled();
    });

    it("should trim and sanitize input data", async () => {
      // Email validation happens before trimming, so use valid email format
      // Name and message can have whitespace and will be trimmed
      const leadWithWhitespace = {
        name: "  John Doe  ",
        email: "john@example.com", // Valid email (Zod validates before trimming)
        message: "  Test message  ",
      };

      const response = await request(app)
        .post("/api/submit-lead")
        .send(leadWithWhitespace)
        .expect(200);

      // Verify sanitized data was passed to storage
      expect(storage.submitLead).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        message: "Test message",
      });
    });

    it("should handle storage errors gracefully", async () => {

      // Mock storage to throw an error
      vi.mocked(storage.submitLead).mockRejectedValue(
        new Error("Google Sheets API error")
      );

      const validLead = {
        name: "John Doe",
        email: "john@example.com",
        message: "Test message",
      };

      const response = await request(app)
        .post("/api/submit-lead")
        .send(validLead)
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        message: expect.any(String),
      });
    });
  });
});

