# Quick Start Guide - Order Management System

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js (v14+)
- MySQL (v8.0+)
- Git

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/BFurkan/Order-Management.git
cd Order-Management

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE order_management;
USE order_management;

# Run migration
mysql -u root -p order_management < backend/migrate.sql
```

### 3. Configuration
```bash
# Backend configuration
cd backend
cp env.example .env
# Edit .env with your database credentials

# Frontend configuration
cd ../frontend
cp env.example .env
# Edit .env if needed
```

### 4. Start the Application
```bash
# Terminal 1 - Start backend
cd backend
npm start

# Terminal 2 - Start frontend
cd frontend
npm start
```

### 5. Access the Application
- **Frontend**: http://localhost:3008
- **Backend API**: http://localhost:3007

---

## 📋 First Steps

### 1. Add Your First Product
1. Navigate to **Product List**
2. Click **"Add Product"**
3. Fill in product details
4. Upload an image
5. Click **"Add Product"**

### 2. Place Your First Order
1. In **Product List**, find your product
2. Enter quantity and email
3. Click **"Place Order"**
4. Note the Order ID

### 3. Confirm the Order
1. Go to **Order Details**
2. Find your order
3. Click **"Confirm"**
4. Enter serial numbers
5. Add comments if needed

### 4. Deploy the Item
1. Go to **Scan** page
2. Enter the serial number
3. Click **"Deploy"**
4. Verify deployment

---

## 🎯 Key Features Overview

### Product Management
- ✅ Add products with images
- ✅ Edit product details
- ✅ Delete products
- ✅ Search and filter

### Order Processing
- ✅ Place orders with email validation
- ✅ Bulk order placement
- ✅ Order grouping by ID
- ✅ Quantity tracking

### Order Confirmation
- ✅ Confirm individual items
- ✅ Assign serial numbers
- ✅ Add item comments
- ✅ Track confirmation dates

### Item Deployment
- ✅ Deploy via serial number scan
- ✅ Track deployment dates
- ✅ Undeploy items if needed
- ✅ Deployment history

### Reporting
- ✅ Export to CSV
- ✅ Advanced search
- ✅ Date range filtering
- ✅ Category summaries

---

## 🔧 Common Tasks

### Adding Multiple Products
```bash
# Use the Product List page
# Click "Add Product" for each item
# Or use bulk import (if available)
```

### Processing Bulk Orders
```bash
# In Product List
# Select multiple products
# Enter quantities and email
# Click "Place Bulk Order"
```

### Confirming Multiple Items
```bash
# In Order Details
# Expand order accordion
# Confirm items individually
# Or use bulk confirmation
```

### Deploying Items
```bash
# In Scan page
# Enter serial number
# Verify item details
# Click "Deploy"
```

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL service
sudo systemctl status mysql

# Verify credentials in .env
# Test connection
mysql -u your_user -p order_management
```

### Port Issues
```bash
# Check if ports are in use
sudo lsof -i :3003
sudo lsof -i :3004

# Kill processes if needed
sudo kill -9 <PID>
```

### Image Upload Issues
```bash
# Check upload directory
ls -la backend/public/images

# Fix permissions
sudo chmod 755 backend/public/images
```

### PM2 Issues (Production)
```bash
# Check PM2 status
pm2 status

# Restart services
pm2 restart all

# View logs
pm2 logs
```

---

## 📊 Understanding the Data Flow

```
Product Added → Order Placed → Order Confirmed → Item Deployed
     ↓              ↓              ↓              ↓
Products Table → Orders Table → Confirmed Items → Deployed Items
```

### Table Purposes
- **Products**: Product catalog
- **Orders**: Initial order requests
- **Confirmed Items**: Orders with serial numbers
- **Deployed Items**: Items in use

---

## 🎨 UI Navigation

### Main Navigation
- **Product List**: Manage products and place orders
- **Open Orders**: View pending orders
- **Order Details**: Confirm orders and assign serials
- **Confirmed Orders**: View confirmed items
- **Deployed Items**: View deployed items
- **Scan**: Deploy items via serial number

### Key UI Features
- **Clickable Rows**: Click any row to view details
- **Accordion Groups**: Orders grouped by ID
- **Search & Filter**: Advanced search capabilities
- **Export**: CSV export for reporting
- **Responsive**: Works on mobile and desktop

---

## 🔐 Security Notes

### User Authentication
- Email validation for orders
- No login system (as per requirements)
- Admin functions available to all users

### Data Protection
- Input validation on all forms
- SQL injection prevention
- File upload security
- CORS configuration

---

## 📞 Support

### Getting Help
1. Check this documentation
2. Review the main documentation
3. Check GitHub Issues
4. Contact the development team

### Useful Commands
```bash
# Check application status
pm2 status

# View application logs
pm2 logs

# Restart application
pm2 restart all

# Update application
git pull origin master
npm install
pm2 restart all
```

---

## 🚀 Next Steps

After completing the quick start:

1. **Explore Features**: Try all the main features
2. **Add Sample Data**: Create realistic test data
3. **Configure Production**: Set up for production use
4. **Customize**: Modify for your specific needs
5. **Train Users**: Share this guide with your team

---

*This guide covers the basics. For detailed information, see the main documentation.* 