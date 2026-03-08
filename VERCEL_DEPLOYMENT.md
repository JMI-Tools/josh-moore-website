# Vercel Deployment Guide

This project is configured for seamless deployment on Vercel.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- MySQL/TiDB database (for production)

## Deployment Steps

### 1. Connect GitHub Repository to Vercel

1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Choose your GitHub repository (JMI-Tools/josh-moore-website)
4. Click "Import"

### 2. Configure Environment Variables

In the Vercel dashboard, add the following environment variables:

**Required:**
- `DATABASE_URL` - Your MySQL/TiDB connection string
- `JWT_SECRET` - A secure random string for JWT signing

**Optional (if using Manus OAuth):**
- `VITE_APP_ID` - Your Manus app ID
- `OAUTH_SERVER_URL` - OAuth server URL
- `VITE_OAUTH_PORTAL_URL` - OAuth portal URL
- `OWNER_NAME` - Your name
- `OWNER_OPEN_ID` - Your Manus open ID
- `BUILT_IN_FORGE_API_URL` - Forge API URL
- `BUILT_IN_FORGE_API_KEY` - Forge API key
- `VITE_FRONTEND_FORGE_API_KEY` - Frontend API key
- `VITE_FRONTEND_FORGE_API_URL` - Frontend API URL
- `VITE_ANALYTICS_ENDPOINT` - Analytics endpoint
- `VITE_ANALYTICS_WEBSITE_ID` - Analytics website ID
- `VITE_APP_TITLE` - Website title
- `VITE_APP_LOGO` - Logo URL

### 3. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your site will be live at `your-project.vercel.app`

## Build Configuration

The `vercel.json` file contains the build configuration:
- **Build Command:** `pnpm build`
- **Output Directory:** `dist`
- **Framework:** Other (Node.js)

## Database Setup

After deployment, you'll need to set up your database:

1. Ensure your `DATABASE_URL` points to a production MySQL/TiDB instance
2. The application will automatically create tables on first run
3. You can manually run migrations if needed

## Troubleshooting

### Build Fails
- Check that all environment variables are set correctly
- Ensure `DATABASE_URL` is valid and accessible
- Check the Vercel build logs for specific errors

### Runtime Errors
- Check the Vercel function logs
- Ensure database is accessible from Vercel's servers
- Verify all API keys and URLs are correct

### Cold Start Issues
- Vercel functions may take a few seconds on first request
- This is normal and will improve with subsequent requests

## Monitoring

Monitor your deployment in the Vercel dashboard:
- View build logs
- Check function execution times
- Monitor error rates
- View analytics

## Rollback

To rollback to a previous version:
1. Go to Vercel dashboard
2. Select your project
3. Go to "Deployments"
4. Find the previous deployment
5. Click the three dots and select "Promote to Production"

## Support

For issues with Vercel deployment, visit: https://vercel.com/docs
