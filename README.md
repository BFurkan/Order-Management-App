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
All API calls use the backend server at `http://10.167.49.200:3007`

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

## 📄 License

This project is licensed under the MIT License. 