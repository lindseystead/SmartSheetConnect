/**
 * DemoFormSection Component Tests
 * 
 * Tests for the lead submission form component.
 * Validates form behavior, user interactions, and API integration.
 * 
 * @fileoverview
 * These tests validate:
 * - Form rendering
 * - Form validation
 * - User interactions (typing, submitting)
 * - Success state
 * - Error handling
 * 
 * Note: These tests use mocked API calls to avoid actual server requests.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DemoFormSection } from "./DemoFormSection";

// Mock the API request function
vi.mock("@/lib/queryClient", () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from "@/lib/queryClient";

describe("DemoFormSection", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DemoFormSection />
      </QueryClientProvider>
    );
  };

  describe("form rendering", () => {
    it("should render form with all input fields", () => {
      renderComponent();

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
    });

    it("should show form title and description", () => {
      renderComponent();

      expect(screen.getByText(/ready to get started/i)).toBeInTheDocument();
      expect(screen.getByText(/fill out the form below/i)).toBeInTheDocument();
    });
  });

  describe("form validation", () => {
    it("should show validation error for empty name", async () => {
      const user = userEvent.setup();
      renderComponent();

      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);
      const submitButton = screen.getByRole("button", { name: /send message/i });

      await user.type(emailInput, "test@example.com");
      await user.type(messageInput, "Test message");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it("should show validation error for invalid email", async () => {
      const user = userEvent.setup();
      renderComponent();

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);
      const submitButton = screen.getByRole("button", { name: /send message/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "notanemail");
      await user.type(messageInput, "Test message");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

    it("should show validation error for empty message", async () => {
      const user = userEvent.setup();
      renderComponent();

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole("button", { name: /send message/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/message is required/i)).toBeInTheDocument();
      });
    });

    it("should accept valid submission without phone (optional field)", async () => {
      const user = userEvent.setup();
      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: "Lead submitted successfully",
          rowNumber: 2,
        }),
      } as Response);

      renderComponent();

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);
      const submitButton = screen.getByRole("button", { name: /send message/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(messageInput, "Test message");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/thank you/i)).toBeInTheDocument();
      });
    });
  });

  describe("form submission", () => {
    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          message: "Lead submitted successfully",
          rowNumber: 2,
        }),
      } as Response;

      vi.mocked(apiRequest).mockResolvedValue(mockResponse);

      renderComponent();

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);
      const submitButton = screen.getByRole("button", { name: /send message/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(messageInput, "I'm interested");

      await user.click(submitButton);

      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith("POST", "/api/submit-lead", {
          name: "John Doe",
          email: "john@example.com",
          message: "I'm interested",
          phone: "",
        });
      });
    });

    it("should show success message after successful submission", async () => {
      const user = userEvent.setup();
      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: "Lead submitted successfully",
          rowNumber: 2,
        }),
      } as Response);

      renderComponent();

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);
      const submitButton = screen.getByRole("button", { name: /send message/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(messageInput, "Test message");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/thank you/i)).toBeInTheDocument();
        expect(screen.getByText(/automatically logged/i)).toBeInTheDocument();
      });
    });

    it("should show error message on submission failure", async () => {
      const user = userEvent.setup();
      vi.mocked(apiRequest).mockRejectedValue(new Error("Network error"));

      renderComponent();

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);
      const submitButton = screen.getByRole("button", { name: /send message/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(messageInput, "Test message");
      await user.click(submitButton);

      await waitFor(() => {
        // Error message shows the actual error
        expect(screen.getByTestId("error-message")).toHaveTextContent(/network error/i);
      });
    });

    it("should disable submit button while submitting", async () => {
      const user = userEvent.setup();
      // Mock a delayed response to test loading state
      vi.mocked(apiRequest).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    success: true,
                    message: "Success",
                    rowNumber: 2,
                  }),
                } as Response),
              100
            )
          )
      );

      renderComponent();

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);
      const submitButton = screen.getByRole("button", { name: /send message/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(messageInput, "Test message");
      await user.click(submitButton);

      // Button should show loading state
      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });
});

