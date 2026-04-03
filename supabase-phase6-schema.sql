-- ============================================
-- Phase 6: Analytics RPC (Optional)
-- Run in Supabase SQL Editor if server-side stats aggregation is needed.
-- The admin dashboard currently computes stats client-side,
-- so this RPC is optional for now.
-- ============================================

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'summary', (
            SELECT json_build_object(
                'total_revenue', COALESCE(SUM(total), 0),
                'order_count', COUNT(*),
                'avg_ticket', ROUND(COALESCE(AVG(total), 0), 2)
            ) FROM orders WHERE status != 'cancelled'
        ),
        'by_section', (
            SELECT json_agg(t) FROM (
                SELECT section, COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
                FROM orders 
                WHERE status != 'cancelled'
                GROUP BY section
                ORDER BY revenue DESC
            ) t
        ),
        'by_status', (
            SELECT json_agg(t) FROM (
                SELECT status, COUNT(*) as count
                FROM orders
                GROUP BY status
                ORDER BY count DESC
            ) t
        ),
        'top_products', (
            SELECT json_agg(t) FROM (
                SELECT 
                    item->>'name' as product_name,
                    SUM((item->>'qty')::int) as total_qty
                FROM orders,
                     jsonb_array_elements(raw_cart::jsonb) AS item
                WHERE status != 'cancelled'
                  AND jsonb_typeof(raw_cart::jsonb) = 'array'
                GROUP BY item->>'name'
                ORDER BY total_qty DESC
                LIMIT 10
            ) t
        ),
        'top_customers', (
            SELECT json_agg(t) FROM (
                SELECT name, phone, order_count, total_spent, membership_tier
                FROM customers
                ORDER BY total_spent DESC
                LIMIT 10
            ) t
        ),
        'daily_trend', (
            SELECT json_agg(t) FROM (
                SELECT 
                    DATE(created_at) as day,
                    COUNT(*) as order_count,
                    COALESCE(SUM(total), 0) as revenue
                FROM orders
                WHERE status != 'cancelled'
                  AND created_at >= NOW() - INTERVAL '30 days'
                GROUP BY DATE(created_at)
                ORDER BY day ASC
            ) t
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
