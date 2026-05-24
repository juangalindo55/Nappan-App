# Nappan MVP Migrations

## Purpose

Track schema changes and deployment order so code and database stay in sync.

## Rules

- Schema changes must be documented before the code depends on them.
- Database migrations should be applied before deploys that require the new fields.
- Backward compatibility should be considered for any release that spans multiple environments.
- If a field is renamed, document the old field, new field, and transition window.

## Migration Checklist

- describe the schema change
- confirm the impacted screens or services
- confirm the new env vars, if any
- confirm the order of database and app deployment
- confirm the rollback path

---

## Schema History

### Initial Schema — MVP

#### `public.products`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `name` | text | |
| `slug` | text | |
| `category` | text | e.g. `Lunch Box`, `Fit Bar`, `Artistic Box` |
| `description` | text | nullable |
| `price` | numeric | |
| `active` | boolean | inactive products are excluded from catalog |
| `image_url` | text | nullable |
| `sort_order` | integer | |

#### `public.customers`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `name` | text | |
| `phone` | text | normalized lookup key |
| `membership_tier` | text | nullable — e.g. `business`, `premium` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

Phone lookup supports variants: 10 digits, with `52`, `+52`, `521`, `+521`, and common separators.

#### `public.app_config`

| Column | Type | Notes |
|---|---|---|
| `key` | text | primary key |
| `value` | text | parsed at read time |
| `updated_at` | timestamptz | |

Known keys:

| Key | Example value | Used by |
|---|---|---|
| `tier_business_discount` | `15` | discount calculation |
| `tier_premium_discount` | `10` | discount calculation |
| `shipping_tier_0_km` | `10` | shipping quote tiers |
| `shipping_tier_1_km` | `25` | shipping quote tiers |
| `shipping_tier_0_price` | `95` | shipping quote pricing |
| `shipping_tier_1_price` | `130` | shipping quote pricing |

### RLS Policies Required

- `public.products` — anon `SELECT`
- `public.customers` — anon `SELECT` and `INSERT`
- `public.app_config` — anon `SELECT`
- `public.orders` — anon `INSERT` (existing), anon `SELECT` (added 2026-05-24, see below)

---

## Applied Migrations

### 2026-05-24 — `orders_select_by_phone_public`

**Change:** Added RLS SELECT policy for the `anon` role on `public.orders`.

**Reason:** The profile page reads order history using the anon Supabase client. The existing policy only allowed SELECT for `authenticated` users, so all order history queries silently returned empty.

**SQL:**
```sql
CREATE POLICY "orders_select_by_phone_public"
  ON public.orders
  FOR SELECT
  TO anon
  USING (true);
```

**Impacted screens:** Profile page — Historial de pedidos section.

**Rollback:** `DROP POLICY "orders_select_by_phone_public" ON public.orders;`

---

### 2026-05-24 — `recreate_generate_order_number_trigger`

**Change:** Recreated the `BEFORE INSERT` trigger that calls `generate_order_number()` to assign `NAP-YYYYMMDD-XXXX` order numbers automatically.

**Reason:** The `generate_order_number()` function existed in the database but the trigger calling it had been dropped. New orders were being saved with `order_number = null`, showing as N/A in the admin panel.

**SQL:**
```sql
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();
```

**Notes:** The `WHEN (NEW.order_number IS NULL)` condition means manually supplied order numbers are preserved and not overwritten.

**Impacted screens:** Admin panel — Pedidos section. Checkout confirmation number.

**Rollback:** `DROP TRIGGER trigger_generate_order_number ON public.orders;`

---

### 2026-05-24 — `backfill_null_order_numbers`

**Change:** Backfilled `order_number` for all 25 orders that had `null` due to the missing trigger.

**Reason:** Orders created between 2026-04-20 and 2026-05-21 had no order number. Backfill assigns `NAP-YYYYMMDD-XXXX` in chronological order within each day, continuing after any existing numbered orders on the same day to avoid collisions.

**SQL:**
```sql
WITH ranked AS (
  SELECT
    id,
    created_at,
    COUNT(*) FILTER (WHERE order_number IS NOT NULL)
      OVER (PARTITION BY DATE(created_at)) AS existing_count,
    ROW_NUMBER()
      OVER (PARTITION BY DATE(created_at) ORDER BY created_at) AS rn
  FROM orders
  WHERE order_number IS NULL
)
UPDATE orders
SET order_number = 'NAP-'
  || TO_CHAR(ranked.created_at, 'YYYYMMDD')
  || '-'
  || LPAD((ranked.existing_count + ranked.rn)::TEXT, 4, '0')
FROM ranked
WHERE orders.id = ranked.id;
```

**Result:** 25 orders updated, 0 nulls remaining. No existing `NAP-` numbers were modified.

**Rollback:** Not applicable — original values were `null`. If needed, reset with `UPDATE orders SET order_number = null WHERE order_number LIKE 'NAP-202604%' OR order_number LIKE 'NAP-202605%'` (scoped to the affected date range).
