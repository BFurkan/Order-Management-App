-- This script completely resets and rebuilds your database schema to match the application code.
-- WARNING: This will delete all existing data in these tables.

-- Drop tables in reverse order of dependency to avoid errors.
DROP TABLE IF EXISTS public.deployed_items;
DROP TABLE IF EXISTS public.inventory_items;
DROP TABLE IF EXISTS public.confirmed_items;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.products;

-- Create the products table first, as it's a parent table.
CREATE TABLE public.products (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying NULL,
    category character varying NULL,
    price numeric NULL,
    image text NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NULL,
    CONSTRAINT products_pkey PRIMARY KEY (id)
);

-- Create the orders table, which will be the parent for transactional items.
CREATE TABLE public.orders (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    order_date date NULL,
    ordered_by character varying NULL,
    comment text NULL,
    product_id uuid NULL,
    quantity integer NULL,
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create the confirmed_items table.
CREATE TABLE public.confirmed_items (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    order_id uuid NULL,
    serial_number character varying NULL,
    item_comment text NULL,
    confirmed_at timestamp with time zone NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT confirmed_items_pkey PRIMARY KEY (id),
    CONSTRAINT confirmed_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create the deployed_items table.
CREATE TABLE public.deployed_items (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    confirmed_item_id uuid NULL,
    deployed_by character varying NULL,
    deployment_location character varying NULL,
    deployed_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT deployed_items_pkey PRIMARY KEY (id),
    CONSTRAINT deployed_items_confirmed_item_id_fkey FOREIGN KEY (confirmed_item_id) REFERENCES confirmed_items(id) ON DELETE CASCADE
);

-- Create the inventory_items table.
CREATE TABLE public.inventory_items (
    "ItemID" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "OrderID" uuid NULL,
    "ItemName" character varying NULL,
    "Barcode" character varying NULL,
    "Status" character varying NULL,
    "Received" date NULL,
    "Count" integer NULL,
    CONSTRAINT inventory_items_pkey PRIMARY KEY ("ItemID"),
    CONSTRAINT inventory_items_OrderID_fkey FOREIGN KEY ("OrderID") REFERENCES orders(id) ON DELETE CASCADE
);
