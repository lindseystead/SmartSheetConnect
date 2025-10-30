import { z } from "zod";

export const leadSubmissionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required").max(1000, "Message is too long"),
});

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

export interface LeadSubmissionResponse {
  success: boolean;
  message: string;
  rowNumber?: number;
}
