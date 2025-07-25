# GitHub Pages Deployment Guide

This guide will help you deploy your Order Management App to GitHub Pages with a cloud-hosted backend.

## Prerequisites

1. **GitHub Account**: Make sure your project is on GitHub
2. **Node.js**: Installed on your local machine
3. **Git**: Installed and configured

## Step 1: Backend Deployment Options

Since GitHub Pages only hosts static files, you need to deploy your backend to a cloud service. Here are the recommended options:

### Option A: Vercel (Recommended - Free)
1. Go to [vercel.com](https://vercel.com) and sign up
2. Connect your GitHub repository
3. Deploy the backend folder
4. Get your backend URL (e.g., `https://your-app.vercel.app`)

### Option B: Railway (Free tier available)
1. Go to [railway.app](https://railway.app) and sign up
2. Connect your GitHub repository
3. Deploy the backend folder
4. Get your backend URL

### Option C: Heroku (Free tier discontinued, but still popular)
1. Go to [heroku.com](https://heroku.com) and sign up
2. Create a new app
3. Connect your GitHub repository
4. Deploy the backend folder

## Step 2: Update Backend for Production

### 1. Create a Vercel configuration file
Create `backend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

### 2. Update CORS settings
In your `backend/server.js`, update the CORS configuration:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3008',
    'https://yourusername.github.io',
    'https://yourusername.github.io/Order-Management-App'
  ],
  credentials: true
}));
```

### 3. Set up environment variables
In your cloud platform dashboard, set these environment variables:
- `DB_HOST` (your database host)
- `DB_USER` (your database username)
- `DB_PASSWORD` (your database password)
- `DB_NAME` (your database name)
- `PORT` (usually 3007 or let the platform set it)

## Step 3: Update Frontend Configuration

### 1. Update the homepage URL
In `frontend/package.json`, replace `yourusername` with your actual GitHub username:
```json
{
  "homepage": "https://yourusername.github.io/Order-Management-App"
}
```

### 2. Create production environment file
Create `frontend/.env.production`:
```env
REACT_APP_API_URL=https://your-backend-url.vercel.app
```

### 3. Update environment example
Update `frontend/env.example`:
```env
# Frontend Environment Variables
# Copy this file to .env and update with your actual values

# Backend API URL
REACT_APP_API_URL=http://localhost:3007

# For production, use your deployed backend URL
# REACT_APP_API_URL=https://your-backend-url.vercel.app
```

## Step 4: Deploy to GitHub Pages

### 1. Install gh-pages dependency
```bash
cd frontend
npm install gh-pages --save-dev
```

### 2. Build and deploy
```bash
# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### 3. Configure GitHub Pages
1. Go to your GitHub repository
2. Click on "Settings"
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Select "gh-pages" branch
6. Click "Save"

## Step 5: Update Router for GitHub Pages

Since GitHub Pages doesn't support client-side routing by default, you need to update your React Router configuration.

### Update App.js
In `frontend/src/App.js`, update the Router:
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      {/* Your routes */}
    </Router>
  );
}
```

## Step 6: Test Your Deployment

1. **Backend**: Test your API endpoints using the deployed URL
2. **Frontend**: Visit `https://yourusername.github.io/Order-Management-App`
3. **Integration**: Test the full application flow

## Troubleshooting

### Common Issues

#### 1. 404 Errors on Refresh
- This is a common issue with React Router on GitHub Pages
- Solution: Use HashRouter instead of BrowserRouter
- Update `App.js`:
```javascript
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
```

#### 2. API Connection Issues
- Check CORS configuration in backend
- Verify the API URL in frontend environment variables
- Test API endpoints directly

#### 3. Build Failures
- Check for any hardcoded localhost URLs
- Ensure all dependencies are installed
- Check for syntax errors

#### 4. Database Connection Issues
- Verify database credentials in cloud platform
- Check if your database allows external connections
- Consider using a cloud database service

## Alternative: Using Supabase (Recommended for Public Projects)

Since you mentioned using Supabase, this is actually a great choice for GitHub Pages deployment:

### 1. Set up Supabase
Follow the `docs/SUPABASE_SETUP.md` guide to set up your Supabase project.

### 2. Update backend for Supabase
Install Supabase client:
```bash
cd backend
npm install @supabase/supabase-js
```

### 3. Update server.js
Replace MySQL connection with Supabase:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
```

### 4. Set environment variables
In your cloud platform, set:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_ANON_KEY`

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to GitHub
- Use your cloud platform's environment variable system
- Keep sensitive data secure

### 2. CORS Configuration
- Only allow necessary origins
- Use HTTPS in production
- Configure properly for your domain

### 3. Database Security
- Use strong passwords
- Enable SSL connections
- Consider using connection pooling

## Final Notes

1. **Update README.md**: Add deployment instructions and live demo link
2. **Add badges**: Add build status and deployment badges
3. **Documentation**: Keep deployment guide updated
4. **Monitoring**: Set up basic monitoring for your application

## Quick Deployment Checklist

- [ ] Backend deployed to cloud platform
- [ ] Frontend homepage URL updated
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Router configuration updated
- [ ] GitHub Pages enabled
- [ ] Frontend deployed
- [ ] Full application tested
- [ ] Documentation updated

Your application should now be live at `https://yourusername.github.io/Order-Management-App`! 