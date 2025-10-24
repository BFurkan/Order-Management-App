-- This script creates a new database function to get all dashboard stats in a single call.
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_orders bigint,
    total_confirmed bigint,
    total_deployed bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM public.orders) AS total_orders,
        (SELECT COUNT(*) FROM public.confirmed_items) AS total_confirmed,
        (SELECT COUNT(*) FROM public.deployed_items) AS total_deployed;
END;
$$ LANGUAGE plpgsql;

