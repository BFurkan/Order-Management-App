-- This script fixes the data type and column mismatches in the dashboard functions.
-- Please run this in your Supabase SQL Editor.

-- Function for Comprehensive Orders Page (FIXED)
CREATE OR REPLACE FUNCTION public.get_comprehensive_orders()
 RETURNS TABLE(record_type text, order_id uuid, product_id uuid, product_name text, category text, image text, quantity integer, confirmed_quantity bigint, deployed_quantity bigint, serial_numbers text, order_date date, confirm_date timestamp with time zone, deploy_date timestamp with time zone, ordered_by text, location text, site text, managed_by text, comment text, item_comment text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        'order'::text AS record_type,
        o.id AS order_id,
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.image,
        o.quantity,
        (SELECT count(*) FROM public.confirmed_items ci WHERE ci.order_id = o.id) AS confirmed_quantity,
        (SELECT count(*) FROM public.deployed_items di JOIN public.confirmed_items ci ON di.confirmed_item_id = ci.id WHERE ci.order_id = o.id) AS deployed_quantity,
        (SELECT string_agg(ci.serial_number, ', ') FROM public.confirmed_items ci WHERE ci.order_id = o.id) AS serial_numbers,
        o.order_date,
        NULL::timestamptz AS confirm_date,
        NULL::timestamptz AS deploy_date,
        o.ordered_by,
        NULL::text AS location,
        NULL::text AS site,
        NULL::text AS managed_by,
        o.comment,
        NULL::text AS item_comment
    FROM
        public.orders o
    JOIN
        public.products p ON o.product_id = p.id
    
    UNION ALL

    SELECT
        'deployed'::text AS record_type,
        ci.order_id,
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.image,
        1 AS quantity,
        NULL::bigint AS confirmed_quantity,
        NULL::bigint AS deployed_quantity,
        ci.serial_number AS serial_numbers,
        o.order_date,
        ci.confirmed_at AS confirm_date,
        di.deployed_at AS deploy_date,
        o.ordered_by,
        di.deployment_location AS location,
        NULL::text AS site, -- Assuming 'site' is not in deployed_items
        di.deployed_by AS managed_by,
        o.comment,
        ci.item_comment
    FROM
        public.deployed_items di
    JOIN
        public.confirmed_items ci ON di.confirmed_item_id = ci.id
    JOIN
        public.orders o ON ci.order_id = o.id
    JOIN
        public.products p ON o.product_id = p.id;

END;
$function$
;

-- Function for Inventory Summary Page (FIXED)
CREATE OR REPLACE FUNCTION public.get_inventory_summary()
 RETURNS TABLE(id uuid, name text, category text, image text, total_ordered bigint, total_confirmed bigint, total_deployed bigint, in_stock bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.category,
        p.image,
        (SELECT COALESCE(sum(o.quantity), 0) FROM public.orders o WHERE o.product_id = p.id)::bigint AS total_ordered,
        (SELECT count(*) FROM public.confirmed_items ci JOIN public.orders o ON ci.order_id = o.id WHERE o.product_id = p.id)::bigint AS total_confirmed,
        (SELECT count(*) FROM public.deployed_items di JOIN public.confirmed_items ci ON di.confirmed_item_id = ci.id JOIN public.orders o ON ci.order_id = o.id WHERE o.product_id = p.id)::bigint AS total_deployed,
        ((SELECT count(*) FROM public.confirmed_items ci JOIN public.orders o ON ci.order_id = o.id WHERE o.product_id = p.id) - (SELECT count(*) FROM public.deployed_items di JOIN public.confirmed_items ci ON di.confirmed_item_id = ci.id JOIN public.orders o ON ci.order_id = o.id WHERE o.product_id = p.id))::bigint AS in_stock
    FROM
        public.products p;
END;
$function$
;

