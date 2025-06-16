-- Migration script to add item_comment column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS item_comment TEXT; 