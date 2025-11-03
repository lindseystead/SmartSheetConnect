/**
 * Vite Development Server Utilities
 * 
 * Provides utilities for Vite dev server integration and static file serving.
 * Handles development HMR (Hot Module Replacement) and production static file serving.
 * 
 * @fileoverview
 * This module provides:
 * - Vite dev server setup for development (with HMR)
 * - Static file serving for production builds
 * - Request logging utility
 * 
 * @author Lindsey Stead
 * @module server/utils/vite
 */

import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../../vite.config";
import { nanoid } from "nanoid";

// Create Vite logger instance for development logging
const viteLogger = createLogger();

/**
 * Logs a formatted message with timestamp and source.
 * 
 * Formats log messages for better readability during development.
 * Includes timestamp, source identifier, and message.
 * 
 * @param message - Log message to output
 * @param source - Source identifier (default: "express")
 * 
 * @example
 * log("Server started on port 5000", "server");
 * // Output: 10:30:45 AM [server] Server started on port 5000
 */
export function log(message: string, source = "express") {
  // Format time in 12-hour format (e.g., "10:30:45 AM")
  // This provides human-readable timestamps for log messages
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric", // 12-hour format (1-12)
    minute: "2-digit", // Two digits (00-59)
    second: "2-digit", // Two digits (00-59)
    hour12: true, // Use AM/PM
  });

  // Output formatted log message with timestamp and source identifier
  console.log(`${formattedTime} [${source}] ${message}`);
}

// ============================================================================
// VITE DEVELOPMENT SERVER SETUP
// ============================================================================

/**
 * Sets up Vite development server with Hot Module Replacement (HMR).
 * 
 * Configures Vite to run in middleware mode, integrated with Express.
 * Provides fast HMR for instant updates during development.
 * 
 * @param app - Express application instance
 * @param server - HTTP server instance for WebSocket HMR connection
 * @returns {Promise<void>} Resolves when Vite server is ready
 * 
 * @throws {Error} If Vite server fails to start
 */
export async function setupVite(app: Express, server: Server) {
  // ========================================================================
  // VITE SERVER CONFIGURATION
  // ========================================================================
  
  // Configure Vite to run in middleware mode (not standalone)
  // This allows Vite to be integrated with Express server
  const serverOptions = {
    middlewareMode: true, // Run as Express middleware, not standalone server
    hmr: { server }, // Use Express HTTP server for WebSocket HMR connection
    allowedHosts: true as const, // Allow all hosts (for development flexibility)
  };

  // Create Vite dev server with custom configuration
  // IMPORTANT: Allow Vite to auto-discover postcss.config.js by not setting configFile: false
  // Vite will automatically find and load postcss.config.js from the project root
  const vite = await createViteServer({
    ...viteConfig, // Use existing vite.config.ts settings (includes PostCSS config)
    // Remove configFile: false to allow Vite to auto-discover configs
    // Vite will find vite.config.ts and postcss.config.js automatically
    customLogger: {
      ...viteLogger, // Use default Vite logger methods
      // Override error handler to exit process on fatal errors
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1); // Exit on critical Vite errors
      },
    },
    server: serverOptions, // Pass server configuration
    appType: "custom", // Custom app type (not SPA or MPA)
    // Ensure React plugin works correctly in middleware mode
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
  });

  // ========================================================================
  // VITE MIDDLEWARE INTEGRATION
  // ========================================================================
  
  // Important: Must be registered BEFORE catch-all route to handle asset requests
  app.use(vite.middlewares);
  
  // ========================================================================
  // CATCH-ALL ROUTE FOR SPA ROUTING
  // ========================================================================
  
  // Catch-all route for SPA (Single Page Application) routing
  // Serves index.html for all routes, allowing React Router to handle routing
  // This must be registered AFTER API routes and Vite middleware
  // Only handles routes that Vite middleware didn't process (HTML requests)
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl; // Get requested URL path

    try {
      // Resolve path to client index.html file
      const clientTemplate = path.resolve(
        import.meta.dirname, // Current file directory (server/utils)
        "..", // Go up to server/
        "..", // Go up to project root
        "client", // Enter client directory
        "index.html", // index.html file
      );

      // Always reload index.html from disk in case it changed during development
      // This ensures we always serve the latest version of the HTML template
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      
      // Transform HTML through Vite (processes <script type="module"> tags)
      // Vite will inject HMR client and process module imports
      // This ensures React app loads correctly with all CSS and JavaScript
      const page = await vite.transformIndexHtml(url, template);
      
      // Send transformed HTML to client
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      // If error occurs, fix stack trace for better error messages
      // Then pass error to Express error handler
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

// ============================================================================
// STATIC FILE SERVING (PRODUCTION)
// ============================================================================

/**
 * Serves pre-built static files from dist/public directory.
 * 
 * Used in production after running 'npm run build'.
 * Serves optimized, bundled static assets.
 * 
 * @param app - Express application instance
 * @throws {Error} If dist/public directory doesn't exist
 * 
 * @example
 * // In production mode
 * serveStatic(app);
 */
export function serveStatic(app: Express) {
  // Resolve path to production build directory
  // Files are built to dist/public by 'npm run build' command
  const distPath = path.resolve(
    import.meta.dirname, // Current file directory (server/utils)
    "..", // Go up to server/
    "..", // Go up to project root
    "dist", // Enter dist directory
    "public", // Enter public directory (contains built files)
  );

  // ========================================================================
  // VALIDATE BUILD DIRECTORY EXISTS
  // ========================================================================
  
  // Check if build directory exists
  // If not, throw helpful error message
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // ========================================================================
  // SERVE STATIC FILES
  // ========================================================================
  
  // Mount Express static file middleware
  // Serves files from dist/public directory (JS, CSS, images, etc.)
  // Automatically handles file requests like /assets/main.js
  app.use(express.static(distPath));

  // ========================================================================
  // CATCH-ALL ROUTE FOR SPA ROUTING
  // ========================================================================
  
  // Catch-all route: Serve index.html for all unmatched routes
  // This enables client-side routing (React Router, Wouter, etc.)
  // If a file doesn't exist, fall back to index.html
  // The client router will handle the route
  app.use("*", (_req, res) => {
    // Send index.html for all non-file requests
    // This allows SPA routing to work in production
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

