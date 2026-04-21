-- ============================================================================
-- NAPPAN APP — Supabase Database Schema
-- ============================================================================
-- Phase 1: Core tables for order capture and basic admin
-- Execute this file in Supabase SQL Editor (Project > SQL Editor > New Query)
--
-- Tables:
--   - orders: Every order (saved from WhatsApp + admin)
--   - order_items: Normalized line items per order
--   - app_config: Key-value store for configuration
-- ============================================================================

-- ============================================================================
-- TABLE: app_config
-- Purpose: Store global configuration (WhatsApp number, shipping rates, etc)
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: SELECT open to all, INSERT/UPDATE/DELETE admin only
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_config_select_public" ON app_config
  FOR SELECT USING (true);

CREATE POLICY "app_config_insert_admin" ON app_config
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "app_config_update_admin" ON app_config
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "app_config_delete_admin" ON app_config
  FOR DELETE USING (auth.role() = 'authenticated');

-- Seed initial config values
INSERT INTO app_config (key, value, description) VALUES
  ('whatsapp_number', '528123509768', 'WhatsApp business number for orders'),
  ('origin_address', 'Cumbres, Monterrey, 64349, Mexico', 'Business address for shipping calculations'),
  ('shipping_tier_1_km', '3', 'Distance limit for tier 1 shipping'),
  ('shipping_tier_1_price', '50', 'Price in MXN for tier 1'),
  ('shipping_tier_2_km', '8', 'Distance limit for tier 2 shipping'),
  ('shipping_tier_2_price', '85', 'Price in MXN for tier 2'),
  ('shipping_tier_3_km', '15', 'Distance limit for tier 3 shipping'),
  ('shipping_tier_3_price', '130', 'Price in MXN for tier 3'),
  ('shipping_tier_4_km', '20', 'Distance limit for tier 4 shipping'),
  ('shipping_tier_4_price', '150', 'Price in MXN for tier 4'),
  ('shipping_tier_5_km', '45', 'Distance limit for tier 5 shipping'),
  ('shipping_tier_5_price', '200', 'Price in MXN for tier 5'),
  ('shipping_max_km', '45', 'Maximum shipping distance in km')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- TABLE: orders
-- Purpose: Persist every order (WhatsApp + admin)
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  section TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_id UUID,
  membership_tier TEXT DEFAULT 'individual',
  status TEXT DEFAULT 'pending',
  delivery_date DATE,
  delivery_time TEXT,
  delivery_address TEXT,
  event_type TEXT,
  guest_count INT,
  subtotal NUMERIC(12,2),
  discount_amount NUMERIC(12,2) DEFAULT 0,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(12,2),
  whatsapp_sent BOOLEAN DEFAULT false,
  notes TEXT,
  raw_cart JSONB,
  pricing_applied JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND constraint_name = 'orders_customer_id_fkey'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_customer_id_fkey
      FOREIGN KEY (customer_id)
      REFERENCES customers(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- RLS: INSERT open to anon, SELECT/UPDATE/DELETE admin only
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_insert_public" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_select_admin" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "orders_update_admin" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "orders_delete_admin" ON orders
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- TABLE: order_items
-- Purpose: Normalized line items for analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID,
  product_sku TEXT,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2),
  extras JSONB,
  art_option TEXT,
  fruit_type TEXT,
  line_total NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Same as orders
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_insert_public" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "order_items_select_admin" ON order_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "order_items_delete_admin" ON order_items
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- TRIGGER: Generate order number
-- Purpose: Auto-generate sequential order numbers like NAP-20260402-0001
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  count_today INT;
BEGIN
  date_part := TO_CHAR(NEW.created_at, 'YYYYMMDD');

  SELECT COUNT(*) INTO count_today
  FROM orders
  WHERE DATE(created_at) = DATE(NEW.created_at)
  AND order_number IS NOT NULL;

  NEW.order_number := 'NAP-' || date_part || '-' || LPAD((count_today + 1)::TEXT, 4, '0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_section_idx ON orders(section);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_customer_phone_idx ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

-- ============================================================================
-- VIEW for Admin: Last 7 Days Orders Summary
-- ============================================================================

CREATE OR REPLACE VIEW orders_last_7_days AS
SELECT
  id,
  order_number,
  section,
  customer_name,
  customer_phone,
  total,
  status,
  created_at,
  DATE(created_at) as order_date
FROM orders
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- ============================================================================
-- END OF PHASE 1 SCHEMA
-- ============================================================================
-- Next phases will add:
--   - products, product_extras, art_options, event_gallery
--   - customers, pricing_rules
--   - admin_users
--   - Additional triggers and views
-- ============================================================================
