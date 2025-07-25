-- Clear all data from Order Management tables
-- This keeps the table structure but removes all data

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear data from all tables (order matters due to relationships)
TRUNCATE TABLE deployed_items;
TRUNCATE TABLE confirmed_items; 
TRUNCATE TABLE orders;
TRUNCATE TABLE products;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto-increment counters (optional)
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE confirmed_items AUTO_INCREMENT = 1;
ALTER TABLE deployed_items AUTO_INCREMENT = 1;

SELECT 'All data cleared successfully!' as Result; 