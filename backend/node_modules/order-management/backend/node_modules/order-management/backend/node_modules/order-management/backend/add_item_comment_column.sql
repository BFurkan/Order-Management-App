-- Add item_comment column to orders table for dual comment system
-- This allows both order-level comments and item-level comments

-- Check if item_comment column exists and add it if it doesn't
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'orders' 
AND TABLE_SCHEMA = 'order_tracking' 
AND COLUMN_NAME = 'item_comment';

-- Add item_comment column if it doesn't exist
SET @sql = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_NAME = 'orders' 
     AND TABLE_SCHEMA = 'order_tracking' 
     AND COLUMN_NAME = 'item_comment') = 0,
    'ALTER TABLE orders ADD COLUMN item_comment TEXT NULL AFTER comment;',
    'SELECT "item_comment column already exists" AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the addition
SELECT 'item_comment column has been added successfully' AS result;
DESCRIBE orders; 