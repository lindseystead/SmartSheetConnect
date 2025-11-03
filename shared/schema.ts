/**
 * Shared Schema Definitions
 * 
 * Defines Zod schemas and TypeScript types shared between client and server.
 * These schemas provide runtime validation and compile-time type safety.
 * 
 * @fileoverview
 * This file contains:
 * - Zod validation schemas for lead submission data
 * - TypeScript types derived from Zod schemas
 * - API response type definitions
 * 
 * @author Lindsey Stead
 * @module shared/schema
 */

import { z } from "zod";

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Phone number validation regex pattern.
 * 
 * Supports various phone number formats:
 * - International: +1 (555) 123-4567
 * - US format: (555) 123-4567
 * - With dashes: 555-123-4567
 * - With spaces: 555 123 4567
 * - Plain digits: 5551234567
 * 
 * Pattern breakdown:
 * - ^[\+]? - Optional leading + for international format
 * - [(]? - Optional opening parenthesis
 * - [0-9]{3} - Three digits (area code)
 * - [)]? - Optional closing parenthesis
 * - [-\s\.]? - Optional separator (dash, space, or dot)
 * - [0-9]{3} - Three digits (exchange code)
 * - [-\s\.]? - Optional separator
 * - [0-9]{4,6} - Four to six digits (subscriber number)
 * - $ - End of string
 */
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

// ============================================================================
// LEAD SUBMISSION SCHEMA
// ============================================================================

/**
 * Zod schema for lead submission validation.
 * 
 * Validates lead form submission data with the following rules:
 * - name: Required string, 1-100 characters, trimmed
 * - email: Required valid email, max 255 chars, lowercase and trimmed
 * - phone: Optional string, must match phone format if provided
 * - message: Required string, 1-1000 characters, trimmed
 * 
 * This schema is used on both client (pre-submission validation) and server
 * (post-submission validation) to ensure data integrity.
 */
export const leadSubmissionSchema = z.object({
  // Name: Required, must be 1-100 characters after trimming whitespace
  name: z.string()
    .min(1, "Name is required") // Must have at least 1 character
    .max(100, "Name is too long") // Maximum 100 characters
    .trim(), // Remove leading/trailing whitespace
  
  // Email: Required, must be valid email format, max 255 chars, lowercase
  email: z.string()
    .email("Please enter a valid email address") // Must match email regex pattern
    .max(255, "Email is too long") // Maximum 255 characters (RFC 5321 standard)
    .toLowerCase() // Convert to lowercase for consistency
    .trim(), // Remove leading/trailing whitespace
  
  // Phone: Optional, but if provided must match phone number format
  phone: z.string()
    .optional() // Phone number is not required
    .refine((val) => !val || phoneRegex.test(val.replace(/\s/g, "")), {
      // Custom validation: if phone is provided, it must match phone regex
      // Remove all spaces before testing to allow flexible formatting
      message: "Please enter a valid phone number",
    }),
  
  // Message: Required, must be 1-1000 characters after trimming
  message: z.string()
    .min(1, "Message is required") // Must have at least 1 character
    .max(1000, "Message is too long") // Maximum 1000 characters
    .trim(), // Remove leading/trailing whitespace
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * TypeScript type for lead submission data.
 * 
 * Derived from leadSubmissionSchema using Zod's type inference.
 * This provides compile-time type safety that matches runtime validation.
 * 
 * @example
 * const lead: LeadSubmission = {
 *   name: "John Doe",
 *   email: "john@example.com",
 *   phone: "555-1234", // Optional
 *   message: "I'm interested in your services"
 * };
 */
export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

/**
 * API response type for lead submission endpoint.
 * 
 * Used for both success and error responses from POST /api/submit-lead.
 * 
 * @property success - Whether the submission was successful
 * @property message - Human-readable status message
 * @property rowNumber - Optional row number in Google Sheets (only on success)
 */
export interface LeadSubmissionResponse {
  /** Whether the operation was successful */
  success: boolean;
  
  /** Human-readable status message */
  message: string;
  
  /** 
   * Row number in Google Sheets where the lead was added.
   * Only present when success is true.
   */
  rowNumber?: number;
}
