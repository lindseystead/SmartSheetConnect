# Railway Deployment Guide

## Quick Start

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/SmartSheetConnect.git
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your SmartSheetConnect repository

3. **Add Environment Variables**
   - Go to your project → **Variables** tab
   - Add each variable from your `.env` file:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `GOOGLE_REFRESH_TOKEN`
     - `NOTIFICATION_EMAIL`
     - `ORGANIZATION_NAME` (optional)
     - `NODE_ENV=production`
     - `PORT` (Railway sets this automatically, but you can override)

4. **Deploy**
   - Railway automatically detects `package.json`
   - Build command: `npm run build`
   - Start command: `npm start`
   - Railway will provide a public URL

5. **Verify Deployment**
   - Visit your Railway URL
   - Test the form submission
   - Check logs for any errors

## Troubleshooting

**Build fails:**
- Check Railway logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Railway uses latest LTS)

**Environment variables not working:**
- Make sure variables are set in Railway dashboard
- No quotes around values
- Restart deployment after adding variables

**Spreadsheet not created:**
- Check Google credentials are correct
- Verify Google Sheets API is enabled
- Check Railway logs for specific errors

## Custom Domain

1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Set `ALLOWED_ORIGINS` variable to your domain

