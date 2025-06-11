# Order Management System - Technical Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Installation & Deployment](#installation--deployment)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)
9. [Development Guide](#development-guide)

---

## System Overview

The Order Management System is a full-stack web application designed to manage product orders, track inventory, and handle order confirmations with dual comment systems (order-level and item-level comments).

### Technology Stack
- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Authentication**: Basic authentication system
- **Real-time Features**: RESTful API communication

### Key Features
- Order creation and management
- Product catalog management
- Individual item confirmation with serial numbers
- Dual comment system (order comments + item comments)
- Confirmed items tracking and viewing
- Column visibility controls
- Barcode scanner integration support

---

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│    (MySQL)      │
│   Port: 3000    │    │   Port: 3007    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### File Structure
```
Order-Management/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ColumnSelector.js
│   │   ├── pages/
│   │   │   ├── OrderDetails.js
│   │   │   └── ConfirmedItems.js
│   │   └── App.js
│   ├── public/
│   └── package.json
├── backend/
│   ├── server.js
│   └── package.json
└── docs/
    ├── TECHNICAL_MANUAL.md
    └── USER_MANUAL.md
```

---

## Database Schema

### Tables

#### `orders`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT AUTO_INCREMENT PRIMARY KEY | Unique identifier |
| `order_id` | VARCHAR(50) | Order reference number |
| `product_id` | INT | Foreign key to products table |
| `quantity` | INT | Number of items ordered |
| `confirmed_quantity` | INT | Number of items confirmed |
| `order_date` | DATETIME | When order was placed |
| `ordered_by` | VARCHAR(100) | Email of person who ordered |
| `comment` | TEXT | Order-level comment |
| `item_comment` | TEXT | JSON string of item-level comments |
| `serial_numbers` | TEXT | JSON string of serial numbers per item |
| `confirmed_items` | TEXT | JSON string tracking confirmed items |

#### `products`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT AUTO_INCREMENT PRIMARY KEY | Unique identifier |
| `name` | VARCHAR(255) | Product name |
| `category` | VARCHAR(100) | Product category (Monitors, Notebooks, Accessories) |

### JSON Field Formats

#### `item_comment` field:
```json
{
  "0": "Comment for first item",
  "1": "Comment for second item",
  "2": "Comment for third item"
}
```

#### `serial_numbers` field:
```json
{
  "0": "SN123456789",
  "1": "SN987654321",
  "2": "SN456789123"
}
```

#### `confirmed_items` field:
```json
{
  "0": true,
  "1": true,
  "2": false
}
```

---

## API Endpoints

### GET Endpoints

#### `GET /products`
- **Description**: Retrieve all products
- **Response**: Array of product objects
```json
[
  {
    "id": 1,
    "name": "Dell Monitor 24\"",
    "category": "Monitors"
  }
]
```

#### `GET /orders`
- **Description**: Retrieve all orders with full details
- **Response**: Array of order objects with all fields including JSON parsed data

#### `GET /confirmed-items`
- **Description**: Retrieve all confirmed items grouped by order
- **Response**: Array of confirmed order details

### POST Endpoints

#### `POST /confirm`
- **Description**: Confirm a specific item in an order
- **Request Body**:
```json
{
  "order_id": "ORD001",
  "product_id": 1,
  "serialNumber": "SN123456789",
  "itemIndex": 0
}
```
- **Response**: Success confirmation

#### `POST /update-order-comment`
- **Description**: Update order-level comment
- **Request Body**:
```json
{
  "orderId": "ORD001",
  "comment": "This is an order comment"
}
```

#### `POST /update-item-comment`
- **Description**: Update item-level comment
- **Request Body**:
```json
{
  "orderId": "ORD001",
  "productId": 1,
  "itemIndex": 0,
  "comment": "This is an item comment"
}
```

---

## Frontend Components

### Core Pages

#### `OrderDetails.js`
- **Purpose**: Main order management interface
- **Key Features**:
  - Order display in accordion format
  - Individual item confirmation
  - Serial number input
  - Dual comment system
  - Column visibility controls
- **State Management**:
  - `groupedOrders`: Orders grouped by order_id
  - `confirmedItems`: Tracks confirmation status
  - `serialNumbers`: Stores serial numbers
  - `orderComments` & `itemComments`: Comment data

#### `ConfirmedItems.js`
- **Purpose**: View all confirmed items
- **Key Features**:
  - Accordion view by order
  - Individual item rows
  - Comment editing capabilities
  - Order filtering

#### `ColumnSelector.js`
- **Purpose**: Reusable component for column visibility
- **Props**:
  - `visibleColumns`: Object with column visibility state
  - `onColumnToggle`: Function to toggle column visibility
  - `columnLabels`: Display labels for columns

### Key State Patterns

#### Confirmed Items Tracking
```javascript
// Key format: "orderId-productId-itemIndex"
const confirmedItems = {
  "ORD001-1-0": true,
  "ORD001-1-1": false,
  "ORD001-1-2": true
};
```

#### Serial Numbers Storage
```javascript
// Key format: "orderId-productId-itemIndex"
const serialNumbers = {
  "ORD001-1-0": "SN123456789",
  "ORD001-1-1": "SN987654321"
};
```

---

## Installation & Deployment

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Backend Setup
```bash
cd backend
npm install
# Configure database connection in server.js
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Database Setup
```sql
CREATE DATABASE order_management;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  confirmed_quantity INT DEFAULT 0,
  order_date DATETIME NOT NULL,
  ordered_by VARCHAR(100) NOT NULL,
  comment TEXT,
  item_comment TEXT,
  serial_numbers TEXT,
  confirmed_items TEXT,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Environment Configuration
Create `.env` files for environment-specific settings:

**Backend `.env**:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=order_management
SERVER_PORT=3007
```

**Frontend `.env**:
```
REACT_APP_API_URL=http://localhost:3007
```

---

## Configuration

### Database Connection
Update `server.js` with your database credentials:
```javascript
const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'your_username',
  password: 'your_password',
  database: 'order_management'
});
```

### CORS Configuration
Current CORS settings allow all origins. For production, restrict to specific domains:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com']
}));
```

### Server Configuration
- **Backend Port**: 3007 (configurable in server.js)
- **Frontend Port**: 3000 (default React dev server)
- **Database Port**: 3306 (default MySQL)

---

## Troubleshooting

### Common Issues

#### "Cannot connect to database"
- **Cause**: Database server not running or incorrect credentials
- **Solution**: 
  1. Verify MySQL service is running
  2. Check database credentials in server.js
  3. Ensure database exists and tables are created

#### "Orders not displaying"
- **Cause**: Frontend cannot reach backend API
- **Solution**:
  1. Verify backend server is running on port 3007
  2. Check network connectivity
  3. Verify API endpoints are responding

#### "Confirmation not working"
- **Cause**: Serial number validation or database update issues
- **Solution**:
  1. Check browser console for errors
  2. Verify serial number is entered
  3. Check database connection
  4. Review server logs

#### "Comments not saving"
- **Cause**: API endpoint issues or database constraints
- **Solution**:
  1. Check request payload in browser dev tools
  2. Verify database field types support JSON
  3. Check server error logs

### Debug Logging
Enable debug logging by adding console.log statements:
```javascript
// Frontend debugging
console.log('Debug: Confirmed items state:', confirmedItems);

// Backend debugging
console.log('Received confirm request:', req.body);
```

### Database Debugging
```sql
-- Check order data
SELECT * FROM orders WHERE order_id = 'ORD001';

-- Check confirmed items JSON
SELECT order_id, confirmed_items FROM orders 
WHERE confirmed_items IS NOT NULL;

-- Verify foreign key relationships
SELECT o.*, p.name FROM orders o 
JOIN products p ON o.product_id = p.id;
```

---

## Development Guide

### Adding New Features

#### 1. Adding a New API Endpoint
```javascript
// Backend (server.js)
app.post('/new-endpoint', (req, res) => {
  // Handle request
  res.json({ success: true });
});

// Frontend
const handleNewFeature = async () => {
  const response = await fetch('http://localhost:3007/new-endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};
```

#### 2. Adding New Database Fields
```sql
-- Add new column
ALTER TABLE orders ADD COLUMN new_field VARCHAR(255);

-- Update queries in server.js to include new field
```

#### 3. Adding New Frontend Components
```javascript
// Create new component file
import React from 'react';

const NewComponent = ({ props }) => {
  return <div>New Component</div>;
};

export default NewComponent;
```

### Code Standards
- Use meaningful variable names
- Add comments for complex logic
- Follow React hooks patterns
- Handle errors gracefully
- Use async/await for API calls

### Testing Guidelines
1. Test all CRUD operations
2. Verify state management
3. Test error scenarios
4. Validate data persistence
5. Check responsive design

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
# Create pull request
```

### Performance Considerations
- Implement pagination for large datasets
- Use React.memo for expensive components
- Optimize database queries with indexes
- Consider caching for frequently accessed data

---

## Security Considerations

### Data Validation
- Validate all user inputs
- Sanitize data before database operations
- Use parameterized queries to prevent SQL injection

### Authentication (Future Enhancement)
- Implement JWT-based authentication
- Add role-based access control
- Secure API endpoints

### HTTPS Configuration
- Use HTTPS in production
- Implement proper certificate management
- Secure cookie settings

---

## Monitoring & Maintenance

### Log Management
- Implement structured logging
- Monitor error rates
- Set up log rotation

### Database Maintenance
- Regular backups
- Monitor database performance
- Optimize queries and indexes

### Application Monitoring
- Monitor API response times
- Track user interactions
- Set up health checks

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Initial | Basic order management |
| 1.1.0 | Recent | Added dual comment system |
| 1.2.0 | Recent | Fixed infinite loop issues |
| 1.3.0 | Recent | Added individual item confirmation |

---

*Last Updated: December 2024*
*Document Version: 1.0* 