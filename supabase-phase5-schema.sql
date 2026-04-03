-- ============================================================================
-- NAPPAN APP — Supabase Phase 5 Schema
-- Detección de Clientes Recurrentes + Tier Pricing
--
-- Execute this file in Supabase SQL Editor (Project > SQL Editor > New Query)
-- ============================================================================

-- ============================================================================
-- TABLE: customers
-- Purpose: Store customer info with membership tiers and stats
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  membership_tier TEXT DEFAULT 'individual',  -- individual, premium, business
  total_spent NUMERIC(12,2) DEFAULT 0,
  order_count INT DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: SELECT/UPDATE admin only, INSERT via trigger only (not direct)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select_admin" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "customers_update_admin" ON customers
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================================
-- FUNCTION: find_customer_by_phone (RPC)
-- Purpose: Lookup customer by phone number without exposing all data
-- SECURITY: DEFINER so anon can call safely
-- ============================================================================

CREATE OR REPLACE FUNCTION find_customer_by_phone(p_phone TEXT)
RETURNS TABLE(id UUID, name TEXT, membership_tier TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT customers.id, customers.name, customers.membership_tier
  FROM customers
  WHERE customers.phone = p_phone
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: sync_customer_stats
-- Purpose: Auto-insert/update customer record when order is placed with phone
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_customer_stats()
RETURNS TRIGGER AS $$
DECLARE
  cust_id UUID;
BEGIN
  -- Skip if no phone provided
  IF NEW.customer_phone IS NULL THEN
    RETURN NEW;
  END IF;

  -- Try to find existing customer by phone
  SELECT id INTO cust_id FROM customers WHERE phone = NEW.customer_phone;

  IF cust_id IS NULL THEN
    -- New customer — insert
    INSERT INTO customers (phone, name, membership_tier, total_spent, order_count, last_order_at)
    VALUES (NEW.customer_phone, NEW.customer_name, 'individual', NEW.total, 1, NEW.created_at)
    ON CONFLICT (phone) DO UPDATE SET
      name = COALESCE(customers.name, NEW.customer_name),
      total_spent = customers.total_spent + NEW.total,
      order_count = customers.order_count + 1,
      last_order_at = NEW.created_at,
      updated_at = NOW()
    RETURNING id INTO cust_id;
  ELSE
    -- Existing customer — update stats
    UPDATE customers
    SET
      total_spent = total_spent + NEW.total,
      order_count = order_count + 1,
      last_order_at = NEW.created_at,
      updated_at = NOW()
    WHERE id = cust_id;
  END IF;

  -- Link order to customer
  NEW.customer_id = cust_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_customer_stats ON orders;
CREATE TRIGGER trigger_sync_customer_stats
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION sync_customer_stats();

-- ============================================================================
-- SEED: Add tier discount settings to app_config
-- ============================================================================

INSERT INTO app_config (key, value, description) VALUES
  ('tier_premium_discount', '10', 'Descuento % para clientes tier Premium'),
  ('tier_business_discount', '15', 'Descuento % para clientes tier Business')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- INDEX: For performance on lookups
-- ============================================================================

CREATE INDEX IF NOT EXISTS customers_phone_idx ON customers(phone);
CREATE INDEX IF NOT EXISTS customers_membership_tier_idx ON customers(membership_tier);
CREATE INDEX IF NOT EXISTS customers_last_order_at_idx ON customers(last_order_at DESC);

-- ============================================================================
-- TEST DATA (optional — delete if not needed)
-- ============================================================================
-- Uncomment to seed test customers:
/*
INSERT INTO customers (phone, name, membership_tier, total_spent, order_count, last_order_at) VALUES
  ('5281112222', 'María García', 'premium', 2500, 5, NOW() - INTERVAL '7 days'),
  ('5281113333', 'Carlos López', 'business', 8000, 15, NOW() - INTERVAL '3 days'),
  ('5281114444', 'Ana Martínez', 'individual', 450, 1, NOW() - INTERVAL '30 days')
ON CONFLICT (phone) DO NOTHING;
*/
