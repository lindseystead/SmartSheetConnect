/**
 * React Query Client Configuration
 * 
 * Configures TanStack Query (React Query) for data fetching and state management.
 * Provides API request utilities and query client configuration.
 * 
 * @fileoverview
 * This file provides:
 * - API request utility function for making HTTP requests
 * - Query function factory for React Query
 * - QueryClient configuration with default options
 * 
 * @author Lindsey Stead
 * @module client/lib/queryClient
 */

import { QueryClient, QueryFunction } from "@tanstack/react-query";

// ============================================================================
// HTTP RESPONSE VALIDATION
// ============================================================================

/**
 * Validates HTTP response status and throws error if not OK.
 * 
 * Extracts error message from response body (tries JSON first, then text).
 * Provides helpful error messages for debugging.
 * 
 * @param res - HTTP Response object to validate
 * @throws {Error} If response status is not OK (200-299)
 * 
 * @private
 * @internal
 */
async function throwIfResNotOk(res: Response): Promise<void> {
  // Check if response status indicates success (200-299)
  // If not OK, extract error message and throw
  if (!res.ok) {
    // Try to extract error message from response body
    // First attempt: Try to parse as JSON (API errors are usually JSON)
    let errorMessage = res.statusText || `HTTP ${res.status} error`;
    
    try {
      // Clone response to read body (body can only be read once)
      // Only clone if body hasn't been consumed yet
      const clonedResponse = res.clone();
      const errorJson = await clonedResponse.json();
      
      // Extract error message from JSON response if available
      // API returns errors in format: { success: false, message: "error message" }
      errorMessage = errorJson.message || errorJson.error || errorMessage;
      
    } catch (jsonError) {
      // If JSON parsing fails, try to read as text
      // Fall back to HTTP status text if body is empty
      try {
        // Try to clone again if first clone failed
        const clonedResponse = res.clone();
        const text = await clonedResponse.text();
        errorMessage = text || errorMessage;
        
      } catch (textError) {
        // If both JSON and text parsing fail, use status text only
        // This handles cases where response body is already consumed
        errorMessage = res.statusText || `HTTP ${res.status} error`;
      }
    }
    
    // Throw error with extracted message
    const error = new Error(errorMessage);
    // Store status code on error object for potential use
    (error as any).status = res.status;
    throw error;
  }
}

// ============================================================================
// API REQUEST UTILITY
// ============================================================================

/**
 * Makes an HTTP request to the API.
 * 
 * Handles JSON serialization, headers, and response validation.
 * Automatically includes credentials (cookies) for authenticated requests.
 * 
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param url - API endpoint URL (relative or absolute)
 * @param data - Optional request body data (will be JSON stringified)
 * @returns {Promise<Response>} HTTP Response object
 * @throws {Error} If request fails or response is not OK
 * 
 * @example
 * // GET request
 * const response = await apiRequest("GET", "/api/health");
 * 
 * // POST request with data
 * const response = await apiRequest("POST", "/api/submit-lead", {
 *   name: "John Doe",
 *   email: "john@example.com",
 *   message: "Hello"
 * });
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Make HTTP request using Fetch API
  const res = await fetch(url, {
    method, // HTTP method (GET, POST, etc.)
    // Only set Content-Type header if we're sending data
    headers: data ? { "Content-Type": "application/json" } : {},
    // Stringify data to JSON if provided
    body: data ? JSON.stringify(data) : undefined,
    // Include credentials (cookies, auth headers) in cross-origin requests
    credentials: "include",
  });

  // Validate response and throw if not OK
  await throwIfResNotOk(res);
  
  // Return valid response
  return res;
}

// ============================================================================
// QUERY FUNCTION FACTORY
// ============================================================================

/**
 * Behavior for handling 401 Unauthorized responses.
 * - "returnNull": Return null instead of throwing (useful for optional auth)
 * - "throw": Throw error (default behavior for authenticated routes)
 */
type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Creates a React Query function factory for fetching data.
 * 
 * This factory function creates query functions that can handle unauthorized
 * responses based on the configured behavior.
 * 
 * @template T - Expected return type of the query
 * @param options - Configuration options
 * @param options.on401 - How to handle 401 Unauthorized responses
 * @returns {QueryFunction<T>} React Query function for data fetching
 * 
 * @example
 * const queryFn = getQueryFn({ on401: "throw" });
 * const data = await queryFn({ queryKey: ["/api/users"] });
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Join query key array into URL path
    // Query keys are arrays like ["/api", "users"] which become "/api/users"
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include", // Include cookies/auth headers
    });

    // Handle 401 Unauthorized based on configured behavior
    // If configured to return null on 401, return null instead of throwing
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // Validate response (throws if not OK)
    await throwIfResNotOk(res);
    
    // Parse and return JSON response
    return await res.json();
  };

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

/**
 * Configured React Query client instance.
 * 
 * Default options:
 * - Queries: No automatic refetching, infinite stale time, no retry
 * - Mutations: No automatic retry on failure
 * 
 * These settings are optimized for this application's use case where:
 * - Data doesn't change frequently (leads are append-only)
 * - We want immediate feedback (no retry delay)
 * - We control refetching manually when needed
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use default query function that throws on 401 (requires auth)
      queryFn: getQueryFn({ on401: "throw" }),
      
      // Don't automatically refetch on interval (we control when to refetch)
      refetchInterval: false,
      
      // Don't refetch when window regains focus (not needed for this app)
      refetchOnWindowFocus: false,
      
      // Data never becomes stale (leads are historical, don't change)
      staleTime: Infinity,
      
      // Don't automatically retry failed queries (fail fast for user feedback)
      retry: false,
    },
    mutations: {
      // Don't automatically retry failed mutations (fail fast for user feedback)
      retry: false,
    },
  },
});
