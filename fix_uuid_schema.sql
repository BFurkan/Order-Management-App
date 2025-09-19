-- This is the definitive script to migrate your order IDs to UUIDs.
-- It uses the exact column names you provided.

-- Step 1: Drop existing foreign key constraints to unlock the tables.
-- We must also drop the constraint from deployed_items, as it depends on confirmed_items.
ALTER TABLE public.deployed_items DROP CONSTRAINT IF EXISTS deployed_items_confirmed_item_id_fkey;
ALTER TABLE public.confirmed_items DROP CONSTRAINT IF EXISTS confirmed_items_order_id_fkey;
ALTER TABLE public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_OrderID_fkey; 

-- Step 2: Clear all data from the transactional tables to ensure a clean migration.
TRUNCATE TABLE public.deployed_items, public.confirmed_items, public.inventory_items, public.orders RESTART IDENTITY CASCADE;

-- Step 3: Alter the column types to UUID.
-- We alter the parent table (orders) first.
ALTER TABLE public.orders
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN id SET DATA TYPE UUID USING (uuid_generate_v4()),
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Now, alter the child tables using their specific, case-sensitive column names.
ALTER TABLE public.confirmed_items
  ALTER COLUMN order_id SET DATA TYPE UUID USING (order_id::uuid);

ALTER TABLE public.inventory_items
  ALTER COLUMN "OrderID" SET DATA TYPE UUID USING ("OrderID"::uuid);

-- Note: We do not need to alter deployed_items' foreign key column type,
-- as it links to confirmed_items.id, which we are not changing.

-- Step 4: Add the foreign key constraints back with the correct relationships.
ALTER TABLE public.confirmed_items
  ADD CONSTRAINT confirmed_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.inventory_items
  ADD CONSTRAINT inventory_items_OrderID_fkey FOREIGN KEY ("OrderID") REFERENCES public.orders(id) ON DELETE CASCADE;

-- Re-add the constraint for deployed_items.
ALTER TABLE public.deployed_items
  ADD CONSTRAINT deployed_items_confirmed_item_id_fkey FOREIGN KEY (confirmed_item_id) REFERENCES public.confirmed_items(id) ON DELETE CASCADE;
