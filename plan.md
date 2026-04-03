# Plan: Nappan App — Roadmap & Implementation Status

## Project Status ✅ Phases 1-5 in Progress

### Phase 1: Order Capture (✅ Complete)
- Supabase PostgreSQL integration via CDN
- `orders` & `order_items` tables with RLS
- Fire-and-forget order persistence from all 4 sections
- Sequential order numbering via trigger

### Phase 2: Admin Dashboard (✅ Complete)
- Authentication (email/password)
- Tab: Pedidos — filters, search, inline status edit, expandable details, pagination, CSV export
- Tab: Productos — inline price editing
- Tab: Configuración — WhatsApp, shipping rates, extras, gallery, tier discounts
- Tab: Clientes — CRUD (view, edit, add, delete customers)

### Phase 3: Dynamic Config (✅ Complete)
- `app_config` table (key-value store)
- Dynamic WhatsApp number loading
- Shipping rates configurable (5 tiers)
- Event gallery dynamic loading
- All editable from Admin > Configuración

### Phase 4: Dynamic Pricing (✅ Complete)
- `products` table with SKU and base_price
- `product_extras` table for add-ons
- Price loading from DB to override HTML hardcoded values
- Lunch Box: 2 products + dynamic extras
- Nappan Box: 2 products (Normal + Premium) + separate extras per product
- Fit Bar: 10 products + 2 combos
- All editable from Admin > Productos

### Phase 5: Recurring Customers + Tier Pricing (🟡 In Progress)
**Completed:**
- ✅ `customers` table with membership tiers (individual/premium/business)
- ✅ RPC function `find_customer_by_phone` (public, SECURITY DEFINER)
- ✅ Trigger `sync_customer_stats` — auto-upsert on new orders
- ✅ **Lunch Box:** Phone field + customer lookup on blur + welcome badge + tier discounts applied
- ✅ Tier discount config in Admin > Configuración > Descuentos por Membresía

**Pending (same pattern as Lunch Box):**
- ⏳ Fit Bar — add phone field + lookup + tier pricing
- ⏳ Nappan Box — add lookup (already has phone fields)
- ⏳ Eventos — add lookup (already has phone field)

### Phase 6: Analytics (❌ Not Started)
- `get_dashboard_stats()` RPC for aggregations
- Admin > Statistics tab with charts (Chart.js CDN)
- Revenue, top products, repeat rate, heatmaps
- Top 10 customers by lifetime value

---

## Key Files

### Core
- `index.html` — Landing page with 🔐 Admin link in footer
- `supabase-client.js` — Supabase client API (window.NappanDB)
- `nappan-admin-v2.html` — Admin dashboard (auth-gated)
- `supabase-schema.sql` — DDL for all tables + RLS + triggers
- `supabase-phase5-schema.sql` — Phase 5: customers table + RPC + trigger

### Section Pages (Phase 5 in progress)
- `nappan-lunchbox.html` — ✅ Complete (phone field + lookup + tier pricing)
- `nappan-fitbar.html` — ⏳ Needs phone field + lookup
- `nappan-box.html` — ⏳ Needs lookup (has phone fields)
- `nappan-eventos.html` — ⏳ Needs lookup (has phone field)

---

## Next Steps (Phase 5 → Phase 6)

1. **Complete Phase 5** — Apply Lunch Box pattern (lookup + tier pricing) to Fit Bar, Nappan Box, Eventos
2. **Phase 6 — Analytics** — Add stats RPC, charts dashboard in admin
3. **Optional polish** — PWA, service worker, enhanced mobile UX

---

## SQL Still to Run (Phase 5)

Execute in Supabase SQL Editor to enable admin INSERT/DELETE on customers:
```sql
CREATE POLICY "customers_insert_admin" ON customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "customers_delete_admin" ON customers
  FOR DELETE USING (auth.role() = 'authenticated');
```

---

## Verification Checklist (Phase 5)

- ✅ Lunch Box: Phone field recognizes existing customers
- ✅ Badge shows with tier and discount percentage
- ✅ Carrito total reflects discount
- ✅ WhatsApp message includes discount breakdown
- ✅ Admin can edit tier discount percentages
- ✅ Changes reflect in Lunch Box immediately
- ✅ Admin can CRUD customers (view, edit name/tier, add, delete)
