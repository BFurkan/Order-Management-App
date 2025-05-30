-- Add comment column to orders table if it doesn't exist
-- This script should be run on your MySQL database

-- Check if the column exists and add it if it doesn't
SET @sql = (
    SELECT IF(
        (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = 'order_tracking' 
         AND TABLE_NAME = 'orders' 
         AND COLUMN_NAME = 'comment') = 0,
        'ALTER TABLE orders ADD COLUMN comment TEXT NULL',
        'SELECT "Column comment already exists" as message'
    )
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the column was added
DESCRIBE orders; 