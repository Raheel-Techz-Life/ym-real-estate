# YM Real Estate Deployment Guide

This guide walks you through deploying the YM Real Estate application to production using Render (backend) and Vercel (frontend).

## Prerequisites

- GitHub account
- MongoDB Atlas account (for production database)
- Render account (free tier available)
- Vercel account (free tier available)
- Google Cloud Console account (optional, for OAuth)

## Part 1: Database Setup (MongoDB Atlas)

1. **Create a MongoDB Atlas Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (free M0 tier is sufficient)
   - Wait for cluster to be created (~3-5 minutes)

2. **Configure Network Access**
   - Go to Security → Network Access
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

3. **Create Database User**
   - Go to Security → Database Access
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password
   - Set "Database User Privileges" to "Read and write to any database"
   - Click "Add User"

4. **Get Connection String**
   - Go to Deployment → Database
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/`)
   - Replace `<password>` with your database user password
   - Add database name at the end: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ym-realestate`

## Part 2: Backend Deployment (Render)

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `ym-real-estate` repository

2. **Configure Build Settings**
   - **Name**: `ym-realestate-api` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Set Environment Variables**
   Click "Advanced" → Add the following environment variables:

   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=<your_mongodb_atlas_connection_string>
   JWT_SECRET=<generate_random_string_32_chars>
   SESSION_SECRET=<generate_random_string_32_chars>
   FRONTEND_URL=<will_add_after_vercel_deployment>
   VERCEL_FRONTEND_URL=<will_add_after_vercel_deployment>
   BASE_URL=<will_be_your_render_url>
   ```

   Optional (for Google OAuth):
   ```
   GOOGLE_CLIENT_ID=<your_google_client_id>
   GOOGLE_CLIENT_SECRET=<your_google_client_secret>
   GOOGLE_CALLBACK_URL=https://your-render-url.onrender.com/api/auth/google/callback
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for the build to complete (~5-10 minutes)
   - Note your Render URL: `https://ym-realestate-api.onrender.com`

5. **Update Environment Variables**
   - Go to Environment
   - Update `BASE_URL` to your actual Render URL
   - Click "Save Changes"

6. **Test Backend**
   - Visit `https://your-render-url.onrender.com/`
   - You should see: `{"message":"YM Real Estate API"}`

## Part 3: Frontend Deployment (Vercel)

1. **Update API URLs in Code**
   Before deploying, update these files with your Render backend URL:

   **File: `js/api.js`** (line 2-4)
   ```javascript
   const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
     ? 'http://localhost:5011/api'
     : 'https://YOUR-RENDER-URL.onrender.com/api';  // Update this line
   ```

   **File: `login.html`** (line 334-336)
   ```javascript
   const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
     ? 'http://localhost:5011/api'
     : 'https://YOUR-RENDER-URL.onrender.com/api';  // Update this line
   ```

   Replace `YOUR-RENDER-URL.onrender.com` with your actual Render URL.

2. **Commit and Push Changes**
   ```bash
   git add js/api.js login.html
   git commit -m "Update production API URLs"
   git push origin main
   ```

3. **Deploy to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - **Framework Preset**: Other
   - **Root Directory**: Leave empty (.) 
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - Click "Deploy"
   - Wait for deployment (~1-2 minutes)
   - Note your Vercel URL: `https://ym-real-estate.vercel.app`

4. **Update Backend Environment Variables**
   - Go back to Render Dashboard
   - Navigate to your web service
   - Go to Environment
   - Update these variables:
     - `FRONTEND_URL`: `https://your-vercel-url.vercel.app`
     - `VERCEL_FRONTEND_URL`: `https://your-vercel-url.vercel.app`
   - If using Google OAuth, also update:
     - `GOOGLE_CALLBACK_URL`: Update to match your Render URL
   - Click "Save Changes"
   - The service will automatically redeploy

5. **Test Frontend**
   - Visit your Vercel URL: `https://your-vercel-url.vercel.app`
   - Test login/registration
   - Check browser console for any errors

## Part 4: Google OAuth Setup (Optional)

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "YM Real Estate"
   - Authorized JavaScript origins:
     - `https://your-vercel-url.vercel.app`
     - `https://your-render-url.onrender.com`
   - Authorized redirect URIs:
     - `https://your-render-url.onrender.com/api/auth/google/callback`
   - Click "Create"
   - Copy the Client ID and Client Secret

4. **Update Render Environment Variables**
   - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Add `GOOGLE_CALLBACK_URL`
   - Save changes

## Part 5: Verification Checklist

After deployment, verify these items:

### Backend (Render)
- [ ] Service is running without errors
- [ ] Health check endpoint works: `GET /`
- [ ] MongoDB connection successful
- [ ] CORS allows requests from Vercel domain
- [ ] Environment variables are set correctly

### Frontend (Vercel)
- [ ] Site loads correctly
- [ ] No console errors
- [ ] API requests reach backend successfully
- [ ] Login/registration works
- [ ] Properties display correctly
- [ ] Contact form works

### Authentication
- [ ] Email/password login works
- [ ] Email/password registration works
- [ ] User registration creates user role
- [ ] Team registration requires correct code (YM2024TEAM)
- [ ] Google OAuth login works (if configured)
- [ ] After login, redirects to index.html
- [ ] After registration, redirects to index.html

## Common Issues and Solutions

### Issue: CORS errors in browser console

**Solution**: 
- Verify `FRONTEND_URL` and `VERCEL_FRONTEND_URL` are set in Render
- Check that frontend uses correct backend URL
- Backend CORS config should allow your Vercel domain

### Issue: MongoDB connection timeout

**Solution**:
- Check MongoDB Atlas network access allows 0.0.0.0/0
- Verify connection string is correct in `MONGO_URI`
- Ensure database user has correct permissions

### Issue: 502 Bad Gateway on Render

**Solution**:
- Check Render logs for errors
- Verify build completed successfully
- Ensure `npm start` command works
- Check if all dependencies installed

### Issue: Registration/Login fails

**Solution**:
- Open browser console to see exact error
- Verify API URL in frontend code is correct
- Check backend logs in Render dashboard
- Ensure MongoDB connection is working

### Issue: Google OAuth fails

**Solution**:
- Verify Google Client ID and Secret in environment variables
- Check authorized redirect URIs in Google Console
- Ensure `GOOGLE_CALLBACK_URL` matches redirect URI exactly
- Verify `FRONTEND_URL` is set correctly

## Team Registration Codes

The application supports two team registration codes:

1. **YM2024TEAM** - Used with `/api/register` endpoint when `role=team`
2. **YMTEAM2024** - Used with `/api/register/team` endpoint

These codes are hardcoded in the backend for security. To change them, update:
- `backend/server.js` lines 274 and 303

## Monitoring and Maintenance

### Render Dashboard
- View logs: Dashboard → Your Service → Logs
- Monitor metrics: Dashboard → Your Service → Metrics
- Restart service: Dashboard → Your Service → Manual Deploy

### Vercel Dashboard
- View deployments: Dashboard → Your Project → Deployments
- View logs: Click on any deployment → View Function Logs
- Rollback: Click "..." on previous deployment → "Promote to Production"

### MongoDB Atlas
- Monitor database: Cluster → Metrics
- View logs: Cluster → ... → View Monitoring
- Backup: Cluster → Backup (configure automatic backups)

## Environment Variables Reference

### Backend (Render)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| NODE_ENV | Yes | Environment mode | `production` |
| PORT | Auto-set | Server port | `10000` |
| MONGO_URI | Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/ym-realestate` |
| JWT_SECRET | Yes | Secret for JWT tokens | Random 32-char string |
| SESSION_SECRET | Yes | Secret for sessions | Random 32-char string |
| FRONTEND_URL | Yes | Vercel deployment URL | `https://your-site.vercel.app` |
| VERCEL_FRONTEND_URL | Yes | Same as FRONTEND_URL | `https://your-site.vercel.app` |
| BASE_URL | Yes | Your Render URL | `https://your-api.onrender.com` |
| GOOGLE_CLIENT_ID | Optional | Google OAuth Client ID | From Google Console |
| GOOGLE_CLIENT_SECRET | Optional | Google OAuth Secret | From Google Console |
| GOOGLE_CALLBACK_URL | Optional | OAuth callback URL | `https://your-api.onrender.com/api/auth/google/callback` |

### Frontend (Vercel)

No environment variables needed. API URLs are configured directly in code:
- `js/api.js`
- `login.html`

## Support

For issues or questions:
- Check backend logs in Render dashboard
- Check browser console for frontend errors
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas is accessible
- Review this deployment guide thoroughly

## Next Steps

After successful deployment:
1. Configure custom domain (optional)
2. Enable automatic SSL (Render and Vercel handle this automatically)
3. Set up monitoring and alerts
4. Configure database backups
5. Add team members and test workflows
6. Consider setting up staging environment
