-- Fix deployed_items table to accept varchar order_id
-- This migration changes the order_id column from int to varchar(255) to match the orders table

-- First, backup the current data
CREATE TABLE IF NOT EXISTS deployed_items_backup AS SELECT * FROM deployed_items;

-- Change the column type
ALTER TABLE deployed_items MODIFY COLUMN order_id varchar(255) NOT NULL;

-- Verify the change
DESCRIBE deployed_items;

-- Optional: Clean up backup table after verification
-- DROP TABLE deployed_items_backup; 