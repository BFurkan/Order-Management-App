# Database Setup and Port Configuration

## New Port Configuration
- **Backend Server**: Port **3007**
- **Frontend Development Server**: Port **3008**

## Database Migration Required

Before running the application, you need to add a `comment` column to the `orders` table.

### Option 1: Automatic Migration (Recommended)
Run the dynamic SQL script:
```sql
-- Connect to your MySQL database and run:
source backend/add_comment_column.sql;
```

### Option 2: Manual Migration
If the automatic script doesn't work, run this simple command:
```sql
-- Connect to your MySQL database and run:
ALTER TABLE orders ADD COLUMN comment TEXT NULL;
```

### Verify the Migration
Check that the column was added:
```sql
DESCRIBE orders;
```

You should see a `comment` column of type `TEXT` that allows `NULL` values.

## Running the Application

### Backend (Port 3007)
```bash
cd backend
npm start
```
The server will run on `http://10.167.49.200:3007`

### Frontend (Port 3008)
```bash
cd frontend
npm start
```
The React app will run on `http://localhost:3008`

## New Features Added

### 1. Comment System
- Add/edit comments for orders in Order Summary page
- View comments in Order Details and Confirmed Items pages
- Visual indicators for orders with comments

### 2. Column Selection
- Toggle visibility of table columns on all pages
- Customizable view for better data management
- Persistent column preferences during session

### 3. Enhanced UI
- Collapsible order sections (accordion style)
- Professional Material-UI components
- Responsive design improvements

## Troubleshooting

### Port Conflicts
If ports 3007 or 3008 are already in use:
- Backend: Change the port in `backend/server.js` line 13
- Frontend: Change the port in `frontend/package.json` start script

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `backend/server.js`
- Ensure the `order_tracking` database exists

### API Connection Issues
- Verify backend is running on port 3007
- Check that all frontend API calls use the correct port (3007)
- Ensure firewall allows connections to the new ports 