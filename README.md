# Lifesaver Technology Services - Smart Intake Form

A modern, full-stack lead capture application that automatically logs submissions to Google Sheets and sends real-time notifications via email and Slack.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)

## 🎯 Overview

This application demonstrates a complete lead capture workflow with:
- **Beautiful, responsive UI** built with React, TypeScript, and Tailwind CSS
- **Automatic Google Sheets integration** - all leads logged instantly
- **Real-time notifications** via Email (Gmail API) and Slack webhooks
- **Form validation** using React Hook Form + Zod
- **Professional design** following Material Design principles

**Live Demo:** [View on Replit](https://your-replit-url.replit.app)  
**Website:** [www.lifesavertech.ca](https://www.lifesavertech.ca)

## ✨ Features

- 📝 **Smart Form Validation** - Client-side validation prevents invalid submissions
- 📊 **Google Sheets Integration** - Automatic spreadsheet creation and data logging
- 📧 **Email Notifications** - Instant alerts via Gmail API
- 💬 **Slack Integration** - Beautiful formatted notifications with action buttons
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Fast & Lightweight** - Optimized Vite build for production

## 🏗️ Tech Stack

### Frontend
- **React** 18 with TypeScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **React Hook Form** + **Zod** - Type-safe form validation
- **TanStack Query** - Server state management
- **Wouter** - Lightweight routing

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **Google Sheets API** for data persistence
- **Gmail API** for email notifications
- **Slack Webhooks** for team notifications

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google account (for Sheets and Gmail integration)
- (Optional) A Slack workspace with webhook access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lifesaver-tech-intake.git
   cd lifesaver-tech-intake
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Email notification recipient (defaults to info@lifesavertech.ca)
   NOTIFICATION_EMAIL=your-email@example.com

   # Slack webhook URL (optional)
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

   # Session secret for Express sessions
   SESSION_SECRET=your-random-secret-key-here
   ```

4. **Configure Google Sheets Integration**

   This project uses Replit's Google Sheets connector for easy OAuth setup. If deploying elsewhere:
   - Enable Google Sheets API in Google Cloud Console
   - Create OAuth 2.0 credentials
   - Set up authentication (see `server/googleSheets.ts` for implementation)

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`

## 🔧 Configuration

### Slack Webhook Setup

1. Go to your Slack workspace settings
2. Create a new Incoming Webhook at https://api.slack.com/messaging/webhooks
3. Select the channel where you want notifications
4. Copy the webhook URL and add it to your `.env` file as `SLACK_WEBHOOK_URL`

### Google Sheets Setup

The application automatically:
- Creates a new Google Sheet on first submission
- Caches the spreadsheet ID for future submissions
- Appends each new lead with timestamp

No manual spreadsheet creation needed!

## 📁 Project Structure

```
lifesaver-tech-intake/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/          # Utilities and helpers
│   │   └── main.tsx      # App entry point
│   └── index.html        # HTML template
├── server/                # Backend Express server
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Data persistence layer
│   ├── googleSheets.ts   # Google Sheets integration
│   ├── email.ts          # Email notifications
│   ├── slack.ts          # Slack notifications
│   └── index.ts          # Server entry point
├── shared/               # Shared TypeScript types
│   └── schema.ts         # Zod schemas and types
└── README.md            # You are here!
```

## 🎨 Design Philosophy

This project follows modern SaaS design principles:
- **Clarity over cleverness** - Every element serves a purpose
- **Progressive disclosure** - Users are guided naturally through the flow
- **Trust-building** - Professional polish creates confidence
- **Zero friction** - Minimal steps from landing to submission

## 🔒 Security

- **Environment variables** - Sensitive data never committed to Git
- **Input validation** - Server-side Zod validation prevents malicious data
- **HTTPS ready** - Configured for secure deployment
- **OAuth 2.0** - Secure Google API authentication

## 📝 API Documentation

### POST `/api/submit-lead`

Submit a new lead to the system.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",  // Optional
  "message": "I'm interested in learning more about your services."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead submitted successfully",
  "rowNumber": 5
}
```

## 🚢 Deployment

### Deploy to Replit (Recommended)

1. Import this repository to Replit
2. Connect Google Sheets integration
3. Add environment variables in Secrets
4. Click "Run" - that's it!

### Deploy Elsewhere

Build the production bundle:
```bash
npm run build
npm start
```

The app runs on port 5000 by default.

## 🤝 Contributing

This is a portfolio project, but suggestions and improvements are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Your Name**
- Website: [www.lifesavertech.ca](https://www.lifesavertech.ca)
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Built with [Replit](https://replit.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

**Note for Portfolio Viewers:** This project showcases full-stack development skills including React, TypeScript, Node.js, API integration, form validation, responsive design, and external service integration (Google Sheets, Gmail, Slack). The code is production-ready and follows industry best practices.
