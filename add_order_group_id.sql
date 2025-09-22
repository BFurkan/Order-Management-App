-- This script adds a new column to the orders table to correctly group items.

ALTER TABLE public.orders
ADD COLUMN order_group_id UUID;
