-- This script adds a new, editable text column for a human-readable order ID.
-- Please run this in your Supabase SQL Editor.

ALTER TABLE public.orders
ADD COLUMN customer_order_id TEXT;

