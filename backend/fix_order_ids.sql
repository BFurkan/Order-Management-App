-- Fix Order ID Sequential Numbering
-- This script will reset all order IDs to start from 1 sequentially
-- Run this script on your MySQL database

USE order_tracking;

-- Backup the current order_ids (optional - run this if you want to keep a backup)
-- CREATE TABLE order_backup AS SELECT id, order_id FROM orders;

-- Method 1: Reset order_ids to sequential numbers starting from 1
-- This creates a temporary mapping and updates all order_ids

-- Step 1: Create a temporary table with new sequential order_ids
CREATE TEMPORARY TABLE temp_order_mapping AS
SELECT 
    order_id AS old_order_id,
    ROW_NUMBER() OVER (ORDER BY MIN(order_date)) AS new_order_id
FROM orders 
WHERE order_id IS NOT NULL 
GROUP BY order_id;

-- Step 2: Show the mapping (optional - to see what will change)
SELECT 'Current mapping:' as info;
SELECT old_order_id, new_order_id FROM temp_order_mapping ORDER BY old_order_id;

-- Step 3: Update the orders table with new sequential order_ids
UPDATE orders o
JOIN temp_order_mapping m ON o.order_id = m.old_order_id
SET o.order_id = m.new_order_id;

-- Step 4: Verify the changes
SELECT 'Updated order_ids:' as info;
SELECT DISTINCT order_id FROM orders ORDER BY order_id;

-- Step 5: Check the max order_id for next orders
SELECT 'Max order_id:' as info, MAX(order_id) as max_order_id FROM orders;

-- Clean up temporary table
DROP TEMPORARY TABLE temp_order_mapping;

-- Alternative Method 2: If you want to start from a specific number (e.g., 1000)
-- Uncomment the lines below and comment out Method 1 above

/*
CREATE TEMPORARY TABLE temp_order_mapping_1000 AS
SELECT 
    order_id AS old_order_id,
    999 + ROW_NUMBER() OVER (ORDER BY MIN(order_date)) AS new_order_id
FROM orders 
WHERE order_id IS NOT NULL 
GROUP BY order_id;

UPDATE orders o
JOIN temp_order_mapping_1000 m ON o.order_id = m.old_order_id
SET o.order_id = m.new_order_id;

DROP TEMPORARY TABLE temp_order_mapping_1000;
*/ 