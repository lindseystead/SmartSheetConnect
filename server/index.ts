/**
 * Server Entry Point
 * 
 * Main Express server configuration and initialization.
 * Sets up security middleware, routing, error handling, and server startup.
 * 
 * @fileoverview
 * This file is the entry point for the Express backend server. It:
 * - Loads environment variables from .env file
 * - Configures security middleware (helmet, CORS, rate limiting)
 * - Sets up request logging and tracking
 * - Registers API routes
 * - Handles global error handling
 * - Serves static files in production or Vite dev server in development
 * 
 * @author Lindsey Stead
 * @module server/index
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "..", ".env");
const result = dotenv.config({ path: envPath });

// Debug: Log .env loading status in development
if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
  if (result.error) {
    console.error(`❌ Failed to load .env file: ${result.error.message}`);
    console.error(`   Looking for .env at: ${envPath}`);
  } else {
    console.log(`✅ Loaded .env file from: ${envPath}`);
    const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
    const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
    const hasRefreshToken = !!process.env.GOOGLE_REFRESH_TOKEN;
    console.log(`   GOOGLE_CLIENT_ID: ${hasClientId ? '✅ Set' : '❌ NOT SET'}`);
    console.log(`   GOOGLE_CLIENT_SECRET: ${hasClientSecret ? '✅ Set' : '❌ NOT SET'}`);
    console.log(`   GOOGLE_REFRESH_TOKEN: ${hasRefreshToken ? '✅ Set' : '❌ NOT SET'}`);
    
    if (!hasClientId || !hasClientSecret || !hasRefreshToken) {
      console.warn(`⚠️  Missing Google credentials! Check your .env file at: ${envPath}`);
      console.warn(`   Make sure you have these lines in your .env file:`);
      console.warn(`   GOOGLE_CLIENT_ID=your-client-id`);
      console.warn(`   GOOGLE_CLIENT_SECRET=your-client-secret`);
      console.warn(`   GOOGLE_REFRESH_TOKEN=your-refresh-token`);
    }
  }
}

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
// @ts-ignore - express-request-id has type issues but works correctly
import requestId from "express-request-id";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./utils/vite";

// Create Express application instance
export const app = express();

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet.js: Sets various HTTP headers to help protect the app from common vulnerabilities
// Content Security Policy prevents XSS attacks by controlling which resources can be loaded
// In development: Allow Vite HMR inline scripts
// In production: Strict CSP for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      // In development: Allow Vite HMR inline scripts ('unsafe-inline' or use nonces)
      // In production: Strict CSP (no inline scripts)
      scriptSrc: process.env.NODE_ENV === "development" 
        ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"] // Development: Allow Vite HMR
        : ["'self'"], // Production: Strict (no inline scripts)
      // Worker scripts: Allow blob: URLs in development for Vite HMR workers
      workerSrc: process.env.NODE_ENV === "development"
        ? ["'self'", "blob:"] // Development: Allow blob: URLs for Vite workers
        : ["'self'"], // Production: Strict (no blob: workers)
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: process.env.NODE_ENV === "development"
        ? ["'self'", "ws:", "wss:"] // Development: Allow WebSocket for HMR
        : ["'self'"], // Production: No WebSocket needed
    },
  },
  crossOriginEmbedderPolicy: false, // Disabled for compatibility with Vite dev server
}));

// CORS (Cross-Origin Resource Sharing): Controls which origins can access the API
// In development: allows all origins (*) for easier testing
// In production: uses ALLOWED_ORIGINS env var or blocks all (false)
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || (process.env.NODE_ENV === "production" ? false : "*"),
  credentials: true, // Allows cookies and authentication headers
}));

// Request ID: Adds a unique ID to each request for debugging and tracking
// Helps correlate logs and errors across the application lifecycle
app.use(requestId());

// Compression: Gzip compresses responses to reduce bandwidth and improve performance
// Automatically compresses JSON, HTML, CSS, JavaScript, and other text-based responses
app.use(compression());

// Rate Limiting: Prevents abuse and DoS attacks by limiting requests per IP
// Configuration:
// - windowMs: Time window in milliseconds (15 minutes)
// - max: Maximum number of requests allowed per window per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false, // Use standard RateLimit-* headers instead of X-RateLimit-*
});

// Apply rate limiting only to API routes (not static file serving)
// This protects API endpoints while allowing normal web page access
app.use("/api", limiter);

// ============================================================================
// TYPE DECLARATIONS
// ============================================================================

// Extend Express Request type to include rawBody for webhook verification
declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Extend Express Request type to include request ID from express-request-id middleware
declare module 'express-serve-static-core' {
  interface Request {
    id?: string; // Unique request ID for tracking
  }
}

// ============================================================================
// REQUEST PARSING MIDDLEWARE
// ============================================================================

// JSON body parser: Parses JSON request bodies and stores in req.body
// Size limit: 10MB to prevent DoS attacks from large payloads
// verify: Stores raw body buffer in req.rawBody for webhook signature verification
app.use(express.json({
  limit: "10mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));

// URL-encoded body parser: Parses form-encoded data (application/x-www-form-urlencoded)
// extended: false uses querystring library instead of qs (simpler, faster)
// limit: 10MB prevents large form submissions from causing issues
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// ============================================================================
// REQUEST LOGGING MIDDLEWARE
// ============================================================================

// Custom logging middleware: Logs all API requests with method, path, status, and duration
// Captures response JSON before it's sent to include in logs
// Only logs requests to /api/* routes to reduce noise from static file requests
app.use((req, res, next) => {
  // Record start time to calculate request duration
  const start = Date.now();
  const path = req.path;
  
  // Variable to capture response JSON for logging
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Intercept res.json() to capture response body before it's sent
  // This allows us to log the response in the 'finish' event handler
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Log request details when response finishes sending
  // 'finish' event fires when response has been sent to client
  res.on("finish", () => {
    const duration = Date.now() - start; // Calculate total request duration
    
    // Only log API requests, not static file requests
    if (path.startsWith("/api")) {
      // Build log line with method, path, status code, and duration
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Add response body if available (for debugging)
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      // Truncate very long log lines to keep logs readable
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      // Output formatted log message
      log(logLine);
    }
  });

  // Continue to next middleware
  next();
});

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

// Initialize app (async function)
// For Vercel: app is exported and used as serverless function
// For local dev: server is started below
async function initializeApp() {
  // Register all API routes and create HTTP server
  // Routes are registered before error handler to catch route-specific errors
  const server = await registerRoutes(app);

  // ============================================================================
  // GLOBAL ERROR HANDLER
  // ============================================================================
  
  // Global error handler: Catches all unhandled errors from route handlers
  // Must be registered AFTER all routes so it can catch errors from them
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Get request ID for error tracking (set by express-request-id middleware)
    const requestId = req.id || "unknown";
    
    // Extract HTTP status code from error (defaults to 500 if not specified)
    const status = err.status || err.statusCode || 500;
    
    // Log error with full context for debugging
    // In development: includes stack trace for easier debugging
    // In production: only logs message to avoid exposing sensitive info
    console.error(`[${requestId}] Error:`, {
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      path: req.path,
      method: req.method,
    });

    // Security: Don't expose internal error details to clients in production
    // Production users see generic error message, developers see detailed error
    const message = process.env.NODE_ENV === "production" && status === 500
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

    // Send error response to client
    res.status(status).json({
      success: false,
      message,
      // Only include request ID in development for debugging
      requestId: process.env.NODE_ENV === "development" ? requestId : undefined,
    });
  });

  // ============================================================================
  // STATIC FILE SERVING
  // ============================================================================
  
  // Important: Vite catch-all route must be registered AFTER API routes
  const isDevelopment = process.env.NODE_ENV === "development" || app.get("env") === "development";
  if (isDevelopment) {
    await setupVite(app, server);
  } else {
    // Production: Serve pre-built static files from dist/public directory
    // These files were built during 'npm run build' command
    serveStatic(app);
  }

  // ============================================================================
  // SERVER STARTUP
  // ============================================================================
  
  // Parse port from environment variable, default to 5000 if not set
  // parseInt with base 10 prevents octal number interpretation
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Parse host from environment variable, default to localhost
  // Use '0.0.0.0' in production to bind to all network interfaces
  const host = process.env.HOST || 'localhost';
  
  // Start HTTP server listening on specified port and host
  // Callback runs when server successfully starts listening
  server.listen(port, host, () => {
    log(`serving on ${host}:${port}`);
  });
  
  // Error handler for server-level errors (e.g., port already in use)
  server.on('error', (err: any) => {
    // Handle common error: port already in use
    if (err.code === 'EADDRINUSE') {
      log(`Port ${port} is already in use. Please use a different port.`);
    } else {
      // Log other server errors
      log(`Server error: ${err.message}`);
    }
    
    // Exit process with error code (1 indicates failure)
    // This allows process managers to detect startup failure
    process.exit(1);
  });
  
  return server;
}

// Start the server
// For Railway and local development, this starts the Express server normally
// The app is also exported for potential future serverless deployments
initializeApp().catch((err) => {
  console.error("Failed to initialize server:", err);
  process.exit(1);
});
