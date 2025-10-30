# Lifesaver Tech - Smart Intake Form

## Overview

Lifesaver Tech is a lead capture and management application that serves as both a functional business tool and a marketing demonstration. The application provides an automated intake form system that instantly logs submissions to Google Sheets and sends real-time notifications to business owners.

The primary purpose is to demonstrate a zero-friction lead capture workflow - visitors submit contact information through a polished web form, which automatically synchronizes with Google Sheets for data organization and triggers email notifications to ensure rapid follow-up.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for component-based UI development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management

**UI Design System:**
- Shadcn/ui components with Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design principles with SaaS tool aesthetics (Linear, Notion, Typeform inspiration)
- Inter font family for consistent typography
- Custom color system using HSL values with CSS variables for theming support

**Design Philosophy:**
- Clarity over cleverness - every element serves conversion goals
- Progressive disclosure to guide users naturally through the submission flow
- Trust-building through professional polish
- Minimal friction in the submission process

**Component Structure:**
- Modular section-based architecture (Header, Hero, Features, How It Works, Social Proof, Demo Form, Footer)
- Single-page application with smooth scroll navigation
- Form validation using React Hook Form with Zod schema validation
- Responsive design with mobile-first approach

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js for the HTTP server
- TypeScript for type safety across the entire stack
- ESM modules for modern JavaScript module system

**API Design:**
- RESTful endpoint pattern
- Single POST endpoint `/api/submit-lead` for form submissions
- JSON request/response format
- Zod schema validation for request body validation
- Centralized error handling with appropriate HTTP status codes

**Data Flow:**
1. Client submits form data via POST request
2. Server validates data against Zod schema
3. Parallel operations: Google Sheets logging and email notification
4. Response sent to client with success/error status

**Storage Strategy:**
- No traditional database - direct integration with Google Sheets as the data store
- In-memory storage abstraction (`MemStorage` class) for potential future database migration
- Interface-based design (`IStorage`) allows swapping storage implementations without changing business logic

### External Dependencies

**Google Sheets Integration:**
- Official Google APIs Node.js client (`googleapis`)
- OAuth2 authentication via Replit Connectors system
- Environment-based authentication using `REPLIT_CONNECTORS_HOSTNAME` and identity tokens
- Automatic spreadsheet creation and management
- Access token caching with expiration handling
- Append-only operations for new lead submissions

**Replit Platform Integration:**
- Replit Connectors for OAuth credential management
- Environment variables for deployment configuration:
  - `REPL_IDENTITY` or `WEB_REPL_RENEWAL` for authentication tokens
  - `NOTIFICATION_EMAIL` for alert recipient (defaults to info@lifesavertech.ca)
  - `DATABASE_URL` (configured but not actively used - prepared for future database integration)
- Development-only plugins for error overlay and debugging

**Email Notification System:**
- Console-based logging for development/debugging
- Attempted Gmail API integration (requires same OAuth setup as Sheets)
- Fallback behavior when email API unavailable
- Notification includes lead details and direct link to Google Sheets

**Database Configuration (Future-Ready):**
- Drizzle ORM configured for PostgreSQL via `@neondatabase/serverless`
- Migration system set up with Drizzle Kit
- Schema definitions in TypeScript
- Currently unused but prepared for scaling beyond Google Sheets

**UI Component Libraries:**
- Radix UI primitives (20+ component packages) for accessible base components
- Lucide React for consistent iconography
- React Icons (specifically `react-icons/si` for social media icons)
- Embla Carousel for potential carousel functionality
- CMDK for command palette patterns

**Form Management:**
- React Hook Form for performant form state management
- Hookform Resolvers for Zod schema integration
- Date-fns for date manipulation (if needed in future features)

**Authentication Approach:**
- No user authentication system (public intake form)
- Service-to-service authentication via Google OAuth for API access
- Replit-managed credentials for simplified deployment

**Build and Development Tools:**
- TypeScript compiler with strict mode enabled
- ESBuild for server-side bundling in production
- PostCSS with Tailwind and Autoprefixer
- TSX for TypeScript execution in development
- Path aliasing for clean imports (`@/`, `@shared/`, `@assets/`)