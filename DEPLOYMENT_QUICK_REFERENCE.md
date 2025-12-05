# Quick Deployment Reference

## Pre-Deployment Checklist

### Update Code
- [ ] Update `js/api.js` with production API URL
- [ ] Update `login.html` with production API URL
- [ ] Commit and push changes to GitHub

### MongoDB Atlas
- [ ] Create cluster
- [ ] Allow access from anywhere (0.0.0.0/0)
- [ ] Create database user
- [ ] Get connection string

## Render Deployment (Backend)

**Settings:**
```
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

**Required Environment Variables:**
```
NODE_ENV=production
MONGO_URI=<mongodb_atlas_connection_string>
JWT_SECRET=<random_32_chars>
SESSION_SECRET=<random_32_chars>
FRONTEND_URL=<vercel_url>
VERCEL_FRONTEND_URL=<vercel_url>
BASE_URL=<render_url>
```

**Test:** Visit `https://your-render-url.onrender.com/` → Should see: `{"message":"YM Real Estate API"}`

## Vercel Deployment (Frontend)

**Settings:**
```
Root Directory: (empty)
Build Command: (empty)
Output Directory: (empty)
Framework: Other
```

**No environment variables needed** - API URLs are in code

**Test:** Visit `https://your-vercel-url.vercel.app` → Site should load

## After Deployment

1. Update Render env vars with actual Vercel URL
2. Test login/registration
3. Verify CORS works (check browser console)
4. Test all main features

## Important URLs to Update

**Before deploying to Vercel, update these files:**

1. `js/api.js` (line ~4):
   ```javascript
   : 'https://YOUR-RENDER-URL.onrender.com/api';
   ```

2. `login.html` (line ~336):
   ```javascript
   : 'https://YOUR-RENDER-URL.onrender.com/api';
   ```

## Team Registration Codes

- User registration: No code needed
- Team registration: `YM2024TEAM`
- Test endpoints: `YMTEAM2024`

## Troubleshooting

**CORS errors?** → Check `FRONTEND_URL` in Render env vars

**MongoDB timeout?** → Check Atlas network access and connection string

**502 error?** → Check Render logs, verify `npm start` works

**Login fails?** → Check browser console, verify API URLs in code

## Quick Commands

```bash
# Local development
cd backend
npm install
npm run dev

# Test production build
npm start

# Deploy
git add .
git commit -m "Update for deployment"
git push origin main
```
