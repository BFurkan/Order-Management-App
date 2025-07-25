# Supabase Deployment Guide for Order Management App

This guide will help you deploy your Order Management App using Supabase as the database and GitHub Pages for the frontend.

## 🎯 Your Project Details
- **GitHub Username**: `Bfurkan`
- **GitHub Pages URL**: `https://bfurkan.github.io/Order-Management-App`
- **Supabase Project**: `yefrbkudmdakbykrpsfz`

## 📋 Step-by-Step Deployment Process

### Step 1: Set Up Supabase Database

1. **Go to your Supabase Dashboard**
   - Visit: [https://supabase.com/dashboard/project/yefrbkudmdakbykrpsfz](https://supabase.com/dashboard/project/yefrbkudmdakbykrpsfz)

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Database Schema**
   - Copy the contents of `backend/supabase-schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to create all tables and sample data

### Step 2: Get Your Supabase Environment Variables

1. **Go to Settings → API**
   - In your Supabase dashboard, click "Settings" (gear icon)
   - Click "API" in the settings menu

2. **Copy Your Keys**
   You'll see something like this:
   ```env
   # Project URL
   SUPABASE_URL=https://yefrbkudmdakbykrpsfz.supabase.co
   
   # Project API Keys
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **Important**: 
   - Use `SUPABASE_SERVICE_ROLE_KEY` for backend (server-side)
   - Use `SUPABASE_ANON_KEY` for frontend (client-side)

### Step 3: Deploy Backend to Vercel

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub

2. **Import Your Repository**
   - Click "New Project"
   - Import your GitHub repository: `Bfurkan/Order-Management-App`

3. **Configure Project Settings**
   - **Framework Preset**: Node.js
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty (not needed for Node.js)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Set Environment Variables**
   Click "Environment Variables" and add:
   ```env
   SUPABASE_URL=https://yefrbkudmdakbykrpsfz.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://your-app.vercel.app`)

### Step 4: Update Frontend Configuration

1. **Create Production Environment File**
   Create `frontend/.env.production`:
   ```env
   REACT_APP_API_URL=https://your-backend-url.vercel.app
   ```

2. **Verify Homepage URL**
   Check that `frontend/package.json` has:
   ```json
   "homepage": "https://bfurkan.github.io/Order-Management-App"
   ```

### Step 5: Deploy Frontend to GitHub Pages

1. **Build and Deploy**
   ```bash
   cd frontend
   npm run build
   npm run deploy
   ```

2. **Configure GitHub Pages**
   - Go to your GitHub repository
   - Click "Settings" → "Pages"
   - Source: "Deploy from a branch"
   - Branch: `gh-pages`
   - Click "Save"

### Step 6: Test Your Deployment

1. **Wait for Deployment**
   - GitHub Pages takes a few minutes to deploy
   - Vercel deployment is usually instant

2. **Test Your Application**
   - Visit: `https://bfurkan.github.io/Order-Management-App`
   - Test all functionality:
     - Add products
     - Place orders
     - Confirm items
     - Deploy items

## 🔧 Alternative: Use Supabase Backend

If you prefer to use the Supabase version of your backend:

1. **Rename the Supabase server file**
   ```bash
   cd backend
   mv server.js server-mysql.js
   mv server-supabase.js server.js
   ```

2. **Update package.json**
   Make sure your backend `package.json` points to the correct server file.

3. **Deploy to Vercel**
   Follow the same Vercel deployment steps above.

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
- **Problem**: Frontend can't connect to backend
- **Solution**: Verify CORS settings in `backend/server.js` include your GitHub Pages URL

#### 2. Database Connection Issues
- **Problem**: Backend can't connect to Supabase
- **Solution**: 
  - Check environment variables in Vercel
  - Verify Supabase URL and keys are correct
  - Check if RLS is enabled (disable for testing)

#### 3. 404 Errors on GitHub Pages
- **Problem**: Pages not found when refreshing
- **Solution**: This is normal for React Router on GitHub Pages. The app should work with navigation.

#### 4. Build Failures
- **Problem**: Frontend build fails
- **Solution**:
  - Check for syntax errors
  - Verify all dependencies are installed
  - Check environment variables

### Testing Your Setup

1. **Test Backend API**
   ```bash
   curl https://your-backend-url.vercel.app/health
   ```
   Should return: `{"status":"OK","database":"Supabase"}`

2. **Test Supabase Connection**
   ```bash
   curl https://your-backend-url.vercel.app/products
   ```
   Should return your products list

3. **Test Frontend**
   - Open browser developer tools
   - Check console for errors
   - Test API calls in Network tab

## 📊 Monitoring Your Deployment

### Vercel Dashboard
- Monitor backend performance
- View deployment logs
- Check environment variables

### Supabase Dashboard
- Monitor database usage
- View table data
- Check API requests

### GitHub Pages
- Monitor deployment status
- View build logs

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to GitHub
   - Use Vercel's environment variable system
   - Keep Supabase keys secure

2. **CORS Configuration**
   - Only allow necessary origins
   - Use HTTPS in production

3. **Database Security**
   - Consider enabling RLS for production
   - Use strong passwords
   - Regular backups

## 🎉 Success Checklist

- [ ] Supabase database schema created
- [ ] Environment variables configured
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to GitHub Pages
- [ ] All functionality tested
- [ ] No console errors
- [ ] API calls working
- [ ] Database operations working

## 📞 Getting Help

If you encounter issues:

1. **Check the logs** in Vercel and GitHub Pages
2. **Test API endpoints** directly
3. **Verify environment variables** are set correctly
4. **Check browser console** for frontend errors
5. **Review Supabase dashboard** for database issues

Your application should now be live at: `https://bfurkan.github.io/Order-Management-App`! 🚀 