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
