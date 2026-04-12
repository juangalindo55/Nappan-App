-- Add a real customer link to orders while preserving phone-based fallback.
-- Safe to run multiple times.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'orders'
      AND constraint_name = 'orders_customer_id_fkey'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_customer_id_fkey
      FOREIGN KEY (customer_id)
      REFERENCES customers(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS orders_customer_id_idx
  ON orders(customer_id);

-- Backfill historic orders by normalized phone match.
UPDATE orders o
SET customer_id = c.id
FROM customers c
WHERE o.customer_id IS NULL
  AND regexp_replace(coalesce(o.customer_phone, ''), '\D', '', 'g')
      = regexp_replace(coalesce(c.phone, ''), '\D', '', 'g');
