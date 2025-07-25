# Order Management System

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

## 🚀 Deployment

### GitHub Pages Deployment
This application can be deployed to GitHub Pages with a cloud-hosted backend. See [GITHUB_PAGES_DEPLOYMENT.md](GITHUB_PAGES_DEPLOYMENT.md) for detailed instructions.

### Quick Deployment Steps:
1. **Deploy Backend**: Use Vercel, Railway, or Heroku
2. **Update Configuration**: Set environment variables and CORS
3. **Deploy Frontend**: Use GitHub Pages with gh-pages
4. **Test**: Verify all functionality works in production

### Live Demo
Once deployed, your application will be available at:
`https://yourusername.github.io/Order-Management-App`

## 📄 License

This project is licensed under the MIT License. 