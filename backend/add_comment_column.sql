-- Add comment column to orders table if it doesn't exist
-- This script should be run on your MySQL database

-- Check if the comment column exists and add it if it doesn't
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

-- Check if the ordered_by column exists and add it if it doesn't
SET @sql2 = (
    SELECT IF(
        (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = 'order_tracking' 
         AND TABLE_NAME = 'orders' 
         AND COLUMN_NAME = 'ordered_by') = 0,
        'ALTER TABLE orders ADD COLUMN ordered_by VARCHAR(255) NULL',
        'SELECT "Column ordered_by already exists" as message'
    )
);

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Verify the columns were added
DESCRIBE orders; 