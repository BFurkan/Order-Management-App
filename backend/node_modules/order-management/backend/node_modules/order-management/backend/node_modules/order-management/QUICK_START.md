# Quick Start Guide - Order Management App

## 🚀 Live Demo

- **Frontend**: [https://order-management-app-frontend.vercel.app](https://order-management-app-frontend.vercel.app)
- **Backend API**: [https://order-management-67zo4288b-furkans-projects-bc5f2bca.vercel.app](https://order-management-67zo4288b-furkans-projects-bc5f2bca.vercel.app)

## 📋 Prerequisites

- Node.js (v14 or higher)
- Git
- Supabase account (free)
- Vercel account (free)

## ⚡ Quick Setup (5 minutes)

### 1. Fork and Clone
```bash
git clone https://github.com/YOUR_USERNAME/Order-Management-App.git
cd Order-Management-App
```

### 2. Set Up Supabase Database
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and service role key
3. Go to SQL Editor and run the contents of `backend/supabase-schema.sql`

### 3. Deploy Backend to Vercel
1. Go to [vercel.com](https://vercel.com) and create a new project
2. Import your repository
3. Set root directory to `backend`
4. Add environment variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `NODE_ENV`: `production`

### 4. Deploy Frontend to Vercel
1. Create another Vercel project
2. Import the same repository
3. Set root directory to `frontend`
4. Add environment variable:
   - `REACT_APP_API_URL`: Your backend Vercel URL

### 5. Test Your Application
Visit your frontend URL and test all functionality!

## 🔧 Local Development

### Backend
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your Supabase credentials
npm start
```

### Frontend
```bash
cd frontend
npm install
cp env.example .env
# Edit .env with your backend URL
npm start
```

## 📚 Detailed Guides

- [Supabase Setup](SUPABASE_DEPLOYMENT_GUIDE.md)
- [Full Deployment Guide](GITHUB_PAGES_DEPLOYMENT.md)
- [Technical Documentation](docs/TECHNICAL_MANUAL.md)

## 🎯 Features

- ✅ Product management with images
- ✅ Order creation and tracking
- ✅ Item confirmation with serial numbers
- ✅ Deployment tracking
- ✅ Comment system
- ✅ Modern Material-UI interface
- ✅ Responsive design

## 🆘 Need Help?

- Check the [documentation](docs/)
- Review [troubleshooting guides](docs/TECHNICAL_MANUAL.md#troubleshooting)
- Open an issue on GitHub

---

**Made with ❤️ using React, Node.js, and Supabase** 