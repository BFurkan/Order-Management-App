-- This script creates the necessary database functions for the new dashboard pages.

-- Function for Comprehensive Orders Page
CREATE OR REPLACE FUNCTION get_comprehensive_orders()
RETURNS TABLE (
    record_type text,
    order_id uuid,
    product_id uuid,
    product_name text,
    category text,
    image text,
    quantity int,
    confirmed_quantity int,
    deployed_quantity int,
    serial_numbers text,
    order_date date,
    confirm_date timestamptz,
    deploy_date timestamptz,
    ordered_by text,
    location text,
    site text,
    managed_by text,
    comment text,
    item_comment text
) AS $$
BEGIN
    -- Union of orders and deployed items
    RETURN QUERY
    SELECT
        'order' AS record_type,
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
        NULL AS location,
        NULL AS site,
        NULL AS managed_by,
        o.comment,
        NULL AS item_comment
    FROM
        public.orders o
    JOIN
        public.products p ON o.product_id = p.id
    
    UNION ALL

    SELECT
        'deployed' AS record_type,
        ci.order_id,
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.image,
        1 AS quantity,
        NULL AS confirmed_quantity,
        NULL AS deployed_quantity,
        ci.serial_number AS serial_numbers,
        o.order_date,
        ci.confirmed_at AS confirm_date,
        di.deployed_at AS deploy_date,
        o.ordered_by,
        di.deployment_location AS location,
        NULL AS site,
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
$$ LANGUAGE plpgsql;


-- Function for Inventory Summary Page
CREATE OR REPLACE FUNCTION get_inventory_summary()
RETURNS TABLE (
    id uuid,
    name text,
    category text,
    image text,
    total_ordered bigint,
    total_confirmed bigint,
    total_deployed bigint,
    in_stock bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.category,
        p.image,
        COALESCE(o.total_ordered, 0) AS total_ordered,
        COALESCE(c.total_confirmed, 0) AS total_confirmed,
        COALESCE(d.total_deployed, 0) AS total_deployed,
        (COALESCE(c.total_confirmed, 0) - COALESCE(d.total_deployed, 0)) AS in_stock
    FROM
        public.products p
    LEFT JOIN
        (SELECT product_id, count(*) AS total_ordered FROM public.orders GROUP BY product_id) o ON p.id = o.product_id
    LEFT JOIN
        (SELECT o.product_id, count(*) AS total_confirmed FROM public.confirmed_items ci JOIN public.orders o ON ci.order_id = o.id GROUP BY o.product_id) c ON p.id = c.product_id
    LEFT JOIN
        (SELECT o.product_id, count(*) AS total_deployed FROM public.deployed_items di JOIN public.confirmed_items ci ON di.confirmed_item_id = ci.id JOIN public.orders o ON ci.order_id = o.id GROUP BY o.product_id) d ON p.id = d.product_id;

END;
$$ LANGUAGE plpgsql;
