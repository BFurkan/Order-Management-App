-- Add price column to products table
-- Run this script on your MySQL database

USE order_tracking;

-- Add price column to products table
ALTER TABLE products 
ADD COLUMN price DECIMAL(10,2) DEFAULT 0.00 AFTER category;

-- Add index for price column for better performance
ALTER TABLE products 
ADD INDEX idx_price (price);

-- Update existing products with a default price (you can update these later)
UPDATE products SET price = 0.00 WHERE price IS NULL;

-- Verify the changes
DESCRIBE products;

-- Show updated table structure
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'order_tracking' 
AND TABLE_NAME = 'products' 
ORDER BY ORDINAL_POSITION; 