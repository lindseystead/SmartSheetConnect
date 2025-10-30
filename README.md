# Lifesaver Technology Services - Smart Intake Form

> A professional full-stack lead capture application with automated Google Sheets logging and real-time notifications

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)

## 🎯 Project Overview

A production-ready lead capture system built with modern web technologies. This application demonstrates enterprise-grade architecture, clean code practices, and seamless integration with external APIs.

### Key Features

- 📝 **Smart Form Validation** - Type-safe validation using Zod schemas
- 📊 **Google Sheets Integration** - Automatic data persistence with OAuth2 authentication
- 📧 **Email Notifications** - Instant alerts via Gmail API
- 💬 **Slack Integration** - Rich, formatted notifications with actionable buttons
- 🎨 **Modern UI/UX** - Built with shadcn/ui components and Tailwind CSS
- 📱 **Fully Responsive** - Mobile-first design that works on all devices
- 🔒 **Security Focused** - Input validation, error handling, and secure authentication
- ⚡ **Performance Optimized** - Fast loading times with Vite bundler

**Website:** [www.lifesavertech.ca](https://www.lifesavertech.ca)

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** - Modern component-based UI framework
- **TypeScript** - Type safety across the entire codebase
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible React components
- **React Hook Form + Zod** - Performant form validation
- **TanStack Query (v5)** - Powerful data synchronization
- **Wouter** - Lightweight client-side routing

### Backend Stack
- **Node.js** - JavaScript runtime
- **Express** - Minimal web framework
- **TypeScript** - End-to-end type safety
- **Google APIs** - Sheets and Gmail integration
- **Slack Webhooks** - Team notifications
- **Zod** - Runtime type validation

### Code Quality
- **JSDoc Documentation** - Comprehensive inline documentation
- **Error Handling** - Graceful error recovery with user-friendly messages
- **TypeScript Strict Mode** - Maximum type safety
- **ESM Modules** - Modern JavaScript module system
- **Production Ready** - Environment-based configuration

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Google Cloud Account** (for Sheets & Gmail APIs)
- **Slack Workspace** (optional, for notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lindseystead/lifesaver-tech-intake.git
   cd lifesaver-tech-intake
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # Email Notifications
   NOTIFICATION_EMAIL=info@lifesavertech.ca

   # Slack Notifications (optional)
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

   # Google OAuth2 Credentials (see setup guide below)
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REFRESH_TOKEN=your-refresh-token

   # Optional: Specify an existing spreadsheet
   SPREADSHEET_ID=your-spreadsheet-id

   # Session Secret
   SESSION_SECRET=generate-a-random-secret-key
   ```

4. **Set up Google OAuth2** (detailed guide below)

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Application will be available at `http://localhost:5000`

## 🔧 Configuration Guide

### Google OAuth2 Setup

This application requires Google OAuth2 credentials for Sheets and Gmail APIs.

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one

2. **Enable Required APIs**
   - Navigate to "APIs & Services" → "Library"
   - Enable **Google Sheets API**
   - Enable **Gmail API** (if using email notifications)

3. **Create OAuth2 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Add authorized redirect URI: `http://localhost` (for testing)

4. **Generate Refresh Token**
   
   Use this Node.js script to generate your refresh token:
   
   ```javascript
   const { google } = require('googleapis');
   
   const oauth2Client = new google.auth.OAuth2(
     'YOUR_CLIENT_ID',
     'YOUR_CLIENT_SECRET',
     'http://localhost'
   );
   
   // Generate auth URL
   const authUrl = oauth2Client.generateAuthUrl({
     access_type: 'offline',
     scope: [
       'https://www.googleapis.com/auth/spreadsheets',
       'https://www.googleapis.com/auth/gmail.send'
     ]
   });
   
   console.log('Visit this URL:', authUrl);
   // After authorization, use the code to get refresh token
   // oauth2Client.getToken(code).then(({ tokens }) => {
   //   console.log('Refresh Token:', tokens.refresh_token);
   // });
   ```

5. **Add credentials to `.env` file**

### Slack Webhook Setup

1. Go to [Slack API: Incoming Webhooks](https://api.slack.com/messaging/webhooks)
2. Click "Create your Slack app"
3. Choose "From scratch"
4. Select your workspace
5. Enable "Incoming Webhooks"
6. Click "Add New Webhook to Workspace"
7. Select the channel for notifications
8. Copy the webhook URL to your `.env` file

### Google Sheets Behavior

The application automatically:
- Creates a new spreadsheet on first submission (if `SPREADSHEET_ID` not set)
- Adds column headers: Timestamp, Name, Email, Phone, Message
- Appends each new lead with ISO timestamp
- Logs spreadsheet URL to console

To use an existing spreadsheet, set `SPREADSHEET_ID` in your `.env` file.

## 📁 Project Structure

```
lifesaver-tech-intake/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # shadcn/ui base components
│   │   │   ├── Header.tsx    # Site header
│   │   │   ├── Footer.tsx    # Site footer
│   │   │   ├── Hero.tsx      # Hero section
│   │   │   ├── Features.tsx  # Features showcase
│   │   │   └── DemoFormSection.tsx  # Main form
│   │   ├── lib/              # Utilities
│   │   │   ├── queryClient.ts  # TanStack Query setup
│   │   │   └── utils.ts        # Helper functions
│   │   ├── hooks/            # Custom React hooks
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── index.html            # HTML template
│   └── index.css             # Global styles
├── server/                     # Backend Express server
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API endpoint definitions
│   ├── storage.ts            # Storage interface & implementation
│   ├── googleSheets.ts       # Google Sheets integration
│   ├── email.ts              # Email notification service
│   └── slack.ts              # Slack notification service
├── shared/                     # Shared TypeScript definitions
│   └── schema.ts             # Zod schemas and types
├── .env.example              # Environment variables template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## 🔒 Security Features

- **Environment Variables** - All sensitive data stored in `.env` (never committed)
- **Input Validation** - Server-side Zod validation prevents injection attacks
- **HTTPS Ready** - Configured for secure production deployment
- **OAuth 2.0** - Industry-standard authentication with Google
- **Error Sanitization** - Error messages don't expose sensitive information
- **Type Safety** - TypeScript prevents entire classes of runtime errors

## 📝 API Documentation

### `POST /api/submit-lead`

Submit a new lead to the system.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```typescript
{
  name: string;      // Required: Lead's full name
  email: string;     // Required: Valid email address
  phone?: string;    // Optional: Phone number
  message: string;   // Required: Lead's message
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Lead submitted successfully",
  "rowNumber": 5
}
```

**Error Responses:**

- **400 Bad Request** - Validation error
  ```json
  {
    "success": false,
    "message": "Validation error: Invalid email address"
  }
  ```

- **500 Internal Server Error** - Server error
  ```json
  {
    "success": false,
    "message": "Failed to append lead to sheet: ..."
  }
  ```

## 🚢 Deployment

### Production Build

```bash
# Build the frontend and backend
npm run build

# Start the production server
npm start
```

The application runs on port 5000 by default. Configure your reverse proxy (nginx, Apache, etc.) accordingly.

### Environment Variables for Production

Ensure these are set in your production environment:
- `NODE_ENV=production`
- `NOTIFICATION_EMAIL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `SLACK_WEBHOOK_URL` (optional)
- `SESSION_SECRET`
- `SPREADSHEET_ID` (optional but recommended)

### Platform Deployment

This application can be deployed to:
- **Heroku** - Use the provided `Procfile`
- **Vercel** - Requires serverless function adaptation
- **DigitalOcean** - Use App Platform or Droplet
- **AWS** - EC2, Elastic Beanstalk, or ECS
- **Any VPS** - Standard Node.js deployment

## 🎨 Design Philosophy

Built following modern SaaS best practices:

- **User-Centered Design** - Every interaction optimized for conversion
- **Progressive Disclosure** - Information revealed at the right time
- **Trust Signals** - Professional design builds credibility
- **Accessibility** - WCAG 2.1 compliant components
- **Performance** - Fast loading times improve user experience
- **Mobile-First** - Designed for smallest screens, enhanced for larger

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Build for production (validates entire codebase)
npm run build
```

## 🤝 Contributing

While this is a personal portfolio project, constructive feedback and suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Lindsey Stead**

Full-Stack Software Engineer specializing in TypeScript, React, and Node.js

- Website: [www.lifesavertech.ca](https://www.lifesavertech.ca)
- GitHub: [@lindseystead](https://github.com/lindseystead)
- Email: info@lifesavertech.ca

## 🙏 Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Inspired by modern SaaS applications like Linear, Notion, and Typeform

---

## 💼 Portfolio Note

This project demonstrates:

- ✅ **Full-Stack Development** - Complete MERN-style architecture
- ✅ **TypeScript Expertise** - End-to-end type safety
- ✅ **API Integration** - Google Sheets, Gmail, and Slack APIs
- ✅ **Modern React Patterns** - Hooks, custom hooks, context
- ✅ **Form Validation** - React Hook Form with Zod schemas
- ✅ **Authentication** - OAuth 2.0 implementation
- ✅ **Error Handling** - Graceful degradation and user feedback
- ✅ **Responsive Design** - Mobile-first CSS with Tailwind
- ✅ **Code Quality** - JSDoc documentation, TypeScript strict mode
- ✅ **Production Ready** - Environment configuration, security best practices

Built with ❤️ as a demonstration of professional software engineering skills.
