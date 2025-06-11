# Database Setup and Port Configuration

## New Port Configuration
- **Backend Server**: Port **3007**
- **Frontend Development Server**: Port **3008**

## Database Migration Required

Before running the application, you need to add `comment`, `item_comment`, and `ordered_by` columns to the `orders` table.

### Option 1: Automatic Migration (Recommended)
Run the dynamic SQL scripts:
```sql
-- Connect to your MySQL database and run:
source backend/add_comment_column.sql;
source backend/add_item_comment_column.sql;
```

### Option 2: Manual Migration
If the automatic script doesn't work, run these commands:
```sql
-- Connect to your MySQL database and run:
ALTER TABLE orders ADD COLUMN comment TEXT NULL;
ALTER TABLE orders ADD COLUMN item_comment TEXT NULL;
ALTER TABLE orders ADD COLUMN ordered_by VARCHAR(255) NULL;
```

### Verify the Migration
Check that the columns were added:
```sql
DESCRIBE orders;
```

You should see:
- A `comment` column of type `TEXT` that allows `NULL` values (for order-level comments)
- An `item_comment` column of type `TEXT` that allows `NULL` values (for item-level comments)
- An `ordered_by` column of type `VARCHAR(255)` that allows `NULL` values

## Running the Application

### Backend (Port 3007)
```bash
cd backend
npm start
```
The server will run on `http://localhost:3007`

### Frontend (Port 3008)
```bash
cd frontend
npm start
```
The React app will run on `http://localhost:3008`

## New Features Added

### 1. Dual Comment System
- **Order-level comments**: Add/edit comments for entire orders
- **Item-level comments**: Add/edit comments for individual items within orders
- View both types of comments in Order Details and Confirmed Items pages
- Visual indicators for orders with order comments and/or item comments
- Separate dialog boxes for each comment type with clear labeling

### 2. Modern Column Selection
- **NEW**: Replaced old checkbox layout with modern button + popup
- Toggle visibility of table columns on all pages
- Clean, modern UI with switches instead of checkboxes
- Customizable view for better data management
- Persistent column preferences during session

### 3. Enhanced Order Placement
- **NEW**: Floating "Place Order" button that appears when items are selected
- **NEW**: "Ordered By" field - tracks who placed each order
- Sticky button positioning for better UX when scrolling
- Modern popup dialog for order confirmation

### 4. Ordered By Tracking
- **NEW**: Track who placed each order
- Display "Ordered By" information in all order views
- Required field when placing orders
- Searchable in Confirmed Items page

### 5. Enhanced UI
- Collapsible order sections (accordion style)
- Professional Material-UI components
- Responsive design improvements
- Modern floating action buttons
- Improved visual hierarchy

## Troubleshooting

### Port Conflicts
If ports 3007 or 3008 are already in use:
- Backend: Change the port in `backend/server.js` line 13
- Frontend: Change the port in `frontend/package.json` start script

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `backend/server.js`
- Ensure the `order_tracking` database exists
- Verify both `comment` and `ordered_by` columns exist in the `orders` table

### API Connection Issues
- Verify backend is running on port 3007
- Check that all frontend API calls use the correct port (3007)
- Ensure firewall allows connections to the new ports

### Material-UI Icons Issues
- Ensure `@mui/icons-material@^5.17.1` is installed
- Version must match your `@mui/material` version
- Run `npm install @mui/icons-material@^5.17.1` if missing 