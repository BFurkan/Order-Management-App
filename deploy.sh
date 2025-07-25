#!/bin/bash

# Order Management App - GitHub Pages Deployment Script
# This script helps you deploy your app to GitHub Pages

echo "🚀 Order Management App - GitHub Pages Deployment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Update homepage URL
echo ""
echo "📝 Step 1: Update homepage URL in frontend/package.json"
echo "Please update the homepage URL in frontend/package.json with your GitHub username:"
echo "Replace 'yourusername' with your actual GitHub username"
echo "Current: https://yourusername.github.io/Order-Management-App"
echo ""

# Step 2: Deploy backend
echo "📝 Step 2: Backend Deployment"
echo "You need to deploy your backend to a cloud service:"
echo ""
echo "Option A - Vercel (Recommended):"
echo "1. Go to https://vercel.com"
echo "2. Sign up/Login with GitHub"
echo "3. Import your repository"
echo "4. Set root directory to 'backend'"
echo "5. Add environment variables:"
echo "   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME"
echo "   - Or use Supabase: SUPABASE_URL, SUPABASE_SERVICE_KEY"
echo "6. Deploy and note the URL"
echo ""

echo "Option B - Railway:"
echo "1. Go to https://railway.app"
echo "2. Sign up/Login with GitHub"
echo "3. Deploy from GitHub repository"
echo "4. Set root directory to 'backend'"
echo "5. Add environment variables"
echo ""

echo "Option C - Heroku:"
echo "1. Go to https://heroku.com"
echo "2. Create new app"
echo "3. Connect GitHub repository"
echo "4. Deploy backend folder"
echo ""

# Step 3: Update frontend environment
echo "📝 Step 3: Update Frontend Environment"
echo "After deploying your backend, update the API URL:"
echo ""
echo "1. Create frontend/.env.production file:"
echo "   REACT_APP_API_URL=https://your-backend-url.vercel.app"
echo ""
echo "2. Update CORS settings in backend/server.js with your GitHub Pages URL"
echo ""

# Step 4: Deploy frontend
echo "📝 Step 4: Deploy Frontend to GitHub Pages"
echo ""

# Check if gh-pages is installed
if [ ! -d "frontend/node_modules/gh-pages" ]; then
    echo "Installing gh-pages..."
    cd frontend
    npm install gh-pages --save-dev
    cd ..
fi

echo "Ready to deploy frontend to GitHub Pages!"
echo ""
echo "Commands to run:"
echo "cd frontend"
echo "npm run build"
echo "npm run deploy"
echo ""

# Step 5: Configure GitHub Pages
echo "📝 Step 5: Configure GitHub Pages"
echo ""
echo "After running the deploy command:"
echo "1. Go to your GitHub repository"
echo "2. Click Settings"
echo "3. Scroll to Pages section"
echo "4. Source: Deploy from a branch"
echo "5. Branch: gh-pages"
echo "6. Click Save"
echo ""

# Step 6: Test deployment
echo "📝 Step 6: Test Your Deployment"
echo ""
echo "1. Wait a few minutes for deployment to complete"
echo "2. Visit: https://yourusername.github.io/Order-Management-App"
echo "3. Test all functionality"
echo "4. Check browser console for any errors"
echo ""

echo "🎉 Deployment Complete!"
echo "Your app should be live at: https://yourusername.github.io/Order-Management-App"
echo ""
echo "📚 For detailed instructions, see: GITHUB_PAGES_DEPLOYMENT.md"
echo "🐛 For troubleshooting, see the deployment guide" 