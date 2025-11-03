/**
 * Demo Form Section Component
 * 
 * Lead submission form component with validation and error handling.
 * Handles form state, submission, and success/error display.
 * 
 * @fileoverview
 * This component provides:
 * - Form validation using React Hook Form + Zod
 * - API submission via React Query mutation
 * - Success/error state management
 * - Honeypot spam protection
 * - Loading states and user feedback
 * 
 * @author Lindsey Stead
 * @module client/components/DemoFormSection
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { leadSubmissionSchema, type LeadSubmission, type LeadSubmissionResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, Loader2 } from "lucide-react";

/**
 * Demo Form Section Component
 * 
 * Main lead submission form with validation, error handling, and success states.
 * Uses React Hook Form for form management and React Query for API submission.
 * 
 * Features:
 * - Client-side validation with Zod schema
 * - Server-side validation on submission
 * - Honeypot spam protection
 * - Loading states during submission
 * - Success/error feedback
 * 
 * @returns {JSX.Element} Lead submission form section
 */
export function DemoFormSection() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Track success state to show success message after submission
  // Resets after 5 seconds to allow submitting another lead
  const [isSuccess, setIsSuccess] = useState(false);

  // ============================================================================
  // FORM CONFIGURATION
  // ============================================================================
  
  // React Hook Form setup with Zod validation
  // Uses zodResolver to validate form data against leadSubmissionSchema
  // This provides both client-side and type-safe validation
  const form = useForm<LeadSubmission>({
    resolver: zodResolver(leadSubmissionSchema), // Validate using Zod schema from shared/schema.ts
    defaultValues: {
      name: "", // Default empty string for name field
      email: "", // Default empty string for email field
      phone: "", // Default empty string for phone field (optional)
      message: "", // Default empty string for message field
    },
  });

  // ============================================================================
  // API MUTATION (REACT QUERY)
  // ============================================================================
  
  // React Query mutation for submitting lead to API
  // Handles loading, error, and success states automatically
  // mutationFn: Makes POST request to /api/submit-lead endpoint
  // onSuccess: Shows success message and resets form
  const mutation = useMutation<LeadSubmissionResponse, Error, LeadSubmission>({
    // Mutation function: Makes API request to submit lead
    // Throws error if request fails (caught by React Query error handling)
    mutationFn: async (data) => {
      // Make POST request to API endpoint with lead data
      // apiRequest validates response and throws error if not OK (200-299)
      const response = await apiRequest("POST", "/api/submit-lead", data);
      
      // Parse JSON response
      // If parsing fails, throw error with helpful message
      try {
        const result = await response.json();
        return result;
      } catch (parseError) {
        // If JSON parsing fails (invalid response format), throw helpful error
        // This handles cases where server returns non-JSON response
        throw new Error('Invalid response from server. Please try again.');
      }
    },
    // Success callback: Called when submission succeeds
    onSuccess: () => {
      setIsSuccess(true); // Show success message
      form.reset(); // Clear form fields
      // Hide success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    },
    // Error handling: Errors are automatically caught and available via mutation.error
    // Displayed in UI below the form
  });

  // ============================================================================
  // FORM SUBMISSION HANDLER
  // ============================================================================
  
  // Handle form submission
  // Called when form is submitted and passes validation
  // Triggers React Query mutation to submit data to API
  const onSubmit = (data: LeadSubmission) => {
    // Trigger mutation to submit lead data
    // React Query handles loading, error, and success states
    mutation.mutate(data);
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <section id="demo-form" className="py-20 px-6 bg-muted/30">
      <div className="max-w-2xl mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold">
            Ready to Get Started?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Fill out the form below to see how it automatically logs to Google Sheets and triggers notifications
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-8 md:p-12">
          {/* Success State: Show success message after successful submission */}
          {isSuccess ? (
            <div className="text-center space-y-6 py-8" data-testid="success-message">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Thank You! Your Message Has Been Sent</h3>
                <p className="text-muted-foreground">
                  Your submission has been automatically logged to Google Sheets and notifications have been sent to your team.
                </p>
              </div>
              <Button onClick={() => setIsSuccess(false)} data-testid="button-submit-another">
                Send Another Message
              </Button>
            </div>
          ) : (
            /* Form State: Show form for lead submission */
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                {/* Name Field: Required, validated by Zod schema */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium uppercase tracking-wide">
                        Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Smith"
                          {...field}
                          data-testid="input-name"
                          className="h-12"
                        />
                      </FormControl>
                      {/* Error message displayed automatically if validation fails */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field: Required, validated for email format by Zod */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium uppercase tracking-wide">
                        Email *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                          data-testid="input-email"
                          className="h-12"
                        />
                      </FormControl>
                      {/* Error message displayed automatically if validation fails */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Field: Optional, validated for phone format if provided */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium uppercase tracking-wide">
                        Phone <span className="text-muted-foreground text-xs normal-case">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          {...field}
                          data-testid="input-phone"
                          className="h-12"
                        />
                      </FormControl>
                      {/* Error message displayed automatically if validation fails */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Message Field: Required, validated by Zod schema */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium uppercase tracking-wide">
                        Message *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your project or inquiry..."
                          rows={4}
                          {...field}
                          data-testid="input-message"
                          className="resize-none"
                        />
                      </FormControl>
                      {/* Error message displayed automatically if validation fails */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ======================================================================== */}
                {/* SPAM PROTECTION: Honeypot Field */}
                {/* ======================================================================== */}
                
                {/* Honeypot field: Hidden field that only bots will fill out
                    If this field has a value, the submission is likely spam
                    Server-side validation silently accepts spam submissions
                    This field is visually hidden and excluded from tab navigation */}
                <input
                  type="text"
                  name="_honeypot"
                  tabIndex={-1} // Exclude from tab navigation
                  autoComplete="off" // Disable autocomplete
                  style={{
                    position: "absolute", // Position off-screen
                    left: "-9999px", // Move far to the left
                    opacity: 0, // Make invisible
                    pointerEvents: "none", // Disable mouse interactions
                  }}
                  aria-hidden="true" // Hide from screen readers
                />

                {/* ======================================================================== */}
                {/* ERROR DISPLAY */}
                {/* ======================================================================== */}
                
                {/* Display error message if API request fails
                    React Query automatically handles error state via mutation.isError
                    Error message comes from API response or network error */}
                {mutation.isError && (
                  <div className="text-sm text-destructive" data-testid="error-message">
                    {/* Display error message from API or fallback to generic message */}
                    {mutation.error?.message || "Something went wrong. Please try again."}
                  </div>
                )}

                {/* ======================================================================== */}
                {/* SUBMIT BUTTON */}
                {/* ======================================================================== */}
                
                {/* Submit button: Disabled during submission to prevent double-submission
                    Shows loading spinner while mutation is pending */}
                <Button
                  type="submit"
                  className="w-full md:w-auto h-12 px-8"
                  disabled={mutation.isPending} // Disable during submission
                  data-testid="button-submit"
                >
                  {/* Show loading state during submission */}
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </Card>
      </div>
    </section>
  );
}
