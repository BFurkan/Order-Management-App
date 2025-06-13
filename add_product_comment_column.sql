-- Add product_comment column to orders table if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS product_comment TEXT;

-- Show the updated table structure
DESCRIBE orders; 