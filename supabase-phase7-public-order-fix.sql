-- ============================================================================
-- NAPPAN APP - Supabase Phase 7 Fix
-- Public order persistence + customer sync through trigger
--
-- Execute this file in Supabase SQL Editor after Phase 5.
-- ============================================================================

-- Ensure the trigger function can write to customers when an anonymous user
-- inserts into orders from the public storefront.
CREATE OR REPLACE FUNCTION sync_customer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_phone TEXT;
  cust_id UUID;
BEGIN
  normalized_phone := NULLIF(regexp_replace(COALESCE(NEW.customer_phone, ''), '\D', '', 'g'), '');
  NEW.customer_phone := normalized_phone;

  IF normalized_phone IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id INTO cust_id FROM customers WHERE phone = normalized_phone;

  IF cust_id IS NULL THEN
    INSERT INTO customers (phone, name, membership_tier, total_spent, order_count, last_order_at)
    VALUES (normalized_phone, COALESCE(NEW.customer_name, 'Cliente'), 'individual', COALESCE(NEW.total, 0), 1, NEW.created_at)
    ON CONFLICT (phone) DO UPDATE SET
      name = EXCLUDED.name,
      total_spent = customers.total_spent + COALESCE(EXCLUDED.total_spent, 0),
      order_count = customers.order_count + 1,
      last_order_at = EXCLUDED.last_order_at,
      updated_at = NOW()
    RETURNING id INTO cust_id;
  ELSE
    UPDATE customers
    SET
      name = COALESCE(NULLIF(NEW.customer_name, ''), customers.name),
      total_spent = total_spent + COALESCE(NEW.total, 0),
      order_count = order_count + 1,
      last_order_at = NEW.created_at,
      updated_at = NOW()
    WHERE id = cust_id;
  END IF;

  NEW.customer_id = cust_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_customer_stats ON orders;
CREATE TRIGGER trigger_sync_customer_stats
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION sync_customer_stats();

-- Explicit public upsert used by the storefront after a successful order insert.
CREATE OR REPLACE FUNCTION sync_public_customer_from_order(
  p_order_id UUID,
  p_phone TEXT,
  p_name TEXT,
  p_total NUMERIC DEFAULT 0,
  p_order_created_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_phone TEXT;
  cust_id UUID;
BEGIN
  normalized_phone := NULLIF(regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g'), '');

  IF normalized_phone IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO customers (phone, name, membership_tier, total_spent, order_count, last_order_at)
  VALUES (normalized_phone, COALESCE(NULLIF(p_name, ''), 'Cliente'), 'individual', COALESCE(p_total, 0), 1, p_order_created_at)
  ON CONFLICT (phone) DO UPDATE SET
    name = COALESCE(NULLIF(EXCLUDED.name, ''), customers.name),
    total_spent = customers.total_spent + COALESCE(EXCLUDED.total_spent, 0),
    order_count = customers.order_count + 1,
    last_order_at = EXCLUDED.last_order_at,
    updated_at = NOW()
  RETURNING id INTO cust_id;

  IF p_order_id IS NOT NULL THEN
    UPDATE orders
    SET
      customer_id = cust_id,
      customer_phone = normalized_phone,
      updated_at = NOW()
    WHERE id = p_order_id;
  END IF;

  RETURN cust_id;
END;
$$;

GRANT EXECUTE ON FUNCTION sync_public_customer_from_order(UUID, TEXT, TEXT, NUMERIC, TIMESTAMPTZ) TO anon;
GRANT EXECUTE ON FUNCTION sync_public_customer_from_order(UUID, TEXT, TEXT, NUMERIC, TIMESTAMPTZ) TO authenticated;
