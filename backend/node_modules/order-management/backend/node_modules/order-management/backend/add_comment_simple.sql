-- Simple script to add comment column to orders table
-- Run this if the dynamic script doesn't work

-- Add comment column (will show error if column already exists, which is fine)
ALTER TABLE orders ADD COLUMN comment TEXT NULL;

-- Show the table structure to verify
DESCRIBE orders; 