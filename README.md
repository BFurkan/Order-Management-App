# Order Management System

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Built with React](https://img.shields.io/badge/Built%20with-React-blue?style=for-the-badge&logo=react)](https://reactjs.org)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase-green?style=for-the-badge&logo=supabase)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A modern order management application built with React and Material-UI.

## 🛠️ Tech Stack

- **Frontend**: React 18, Material-UI, React Router
- **Backend**: Node.js, Express, MySQL
- **UI Framework**: Material-UI (@mui/material)
- **Styling**: Material-UI components with sx props

## 📦 Installation

```bash
# Install all dependencies
npm run install-all

# Or install individually
npm install --prefix backend
npm install --prefix frontend
```

## 🚀 Running the Application

```bash
# Start both frontend and backend
npm start

# Or start individually
npm run start --prefix frontend
npm run start --prefix backend
```

## 📱 Features

- **Product Management**: Add, view, and categorize products
- **Order Processing**: Create and manage orders
- **Comment System**: Add/edit comments for orders
- **Column Selection**: Toggle visibility of table columns
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Clean, professional Material-UI interface

## 🔧 Development

### Port Configuration
- **Backend Server**: Port **3007**
- **Frontend Development Server**: Port **3008**

### API Endpoints
All API calls use the backend server at `http://localhost:3007`

## 📊 Database Setup

Before running the application, ensure you have:
1. MySQL database named `order_tracking`
2. Required database migration (see DATABASE_SETUP.md)
3. Proper database credentials configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🚀 Live Demo

**Frontend**: [https://order-management-app-frontend.vercel.app](https://order-management-app-frontend.vercel.app)  
**Backend API**: [https://order-management-67zo4288b-furkans-projects-bc5f2bca.vercel.app](https://order-management-67zo4288b-furkans-projects-bc5f2bca.vercel.app)

## 🛠️ Deployment

### Current Setup
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Vercel with Supabase database
- **Database**: Supabase PostgreSQL

### Quick Setup for Others
1. **Fork this repository**
2. **Set up Supabase database** (see [SUPABASE_DEPLOYMENT_GUIDE.md](SUPABASE_DEPLOYMENT_GUIDE.md))
3. **Deploy backend to Vercel** with environment variables
4. **Deploy frontend to Vercel** with API URL
5. **Update environment variables** with your own Supabase credentials

## 📄 License

This project is licensed under the MIT License. 