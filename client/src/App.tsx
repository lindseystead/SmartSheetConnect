/**
 * Main Application Component
 * 
 * Root component that sets up the React application with providers and routing.
 * 
 * @fileoverview
 * This component:
 * - Provides React Query client for data fetching
 * - Sets up tooltip provider for UI components
 * - Configures toast notification system
 * - Implements client-side routing
 * 
 * @author Lindsey Stead
 * @module client/App
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

/**
 * Router component that handles client-side routing.
 * 
 * Uses Wouter (lightweight React router) to match URL paths to components.
 * 
 * @returns {JSX.Element} Router with route definitions
 */
function Router() {
  return (
    <Switch>
      {/* Home page route - matches root path "/" */}
      <Route path="/" component={Home} />
      
      {/* 404 Not Found route - catches all unmatched paths */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Main App component - root of the React application.
 * 
 * Sets up all required providers:
 * - QueryClientProvider: Enables React Query for data fetching
 * - TooltipProvider: Enables tooltip components throughout app
 * - Toaster: Provides toast notification system
 * 
 * @returns {JSX.Element} Application with all providers and routing
 */
function App() {
  return (
    // React Query Provider: Enables data fetching, caching, and state management
    <QueryClientProvider client={queryClient}>
      {/* Tooltip Provider: Required for tooltip components to work */}
      <TooltipProvider>
        {/* Toaster: Displays toast notifications (success, error, etc.) */}
        <Toaster />
        
        {/* Router: Handles client-side routing */}
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
