-- This script creates a PostgreSQL function to calculate popular products.
-- This is needed for the Dashboard page to work correctly.

CREATE OR REPLACE FUNCTION get_popular_products()
RETURNS TABLE(name text, orderCount bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.name,
        count(o.id) as orderCount
    FROM
        public.orders o
    JOIN
        public.products p ON o.product_id = p.id
    GROUP BY
        p.name
    ORDER BY
        orderCount DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;
