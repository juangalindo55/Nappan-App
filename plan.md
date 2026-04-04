# Plan: Nappan App - Roadmap & Implementation Status

## Project Status: Phases 1-5 Complete / Phase 6 In Progress

### Phase 1: Order Capture (Complete)
- Supabase PostgreSQL integration via CDN
- `orders` and `order_items` tables with RLS
- Fire-and-forget order persistence from all 4 sections
- Sequential order numbering via trigger

### Phase 2: Admin Dashboard (Complete)
- Authentication (email/password)
- Tab: Pedidos - filters, search, inline status edit, expandable details, pagination, CSV export
- Tab: Productos - inline price editing
- Tab: Configuración - WhatsApp, shipping rates, extras, gallery, tier discounts
- Tab: Clientes - CRUD (view, edit, add, delete customers)

### Phase 3: Dynamic Config (Complete)
- `app_config` table (key-value store)
- Dynamic WhatsApp number loading
- Shipping rates configurable (5 tiers)
- Event gallery dynamic loading
- All editable from Admin > Configuración

### Phase 4: Dynamic Pricing (Complete)
- `products` table with SKU and `base_price`
- `product_extras` table for add-ons
- Price loading from DB to override HTML hardcoded values
- Lunch Box: 2 products + dynamic extras
- Nappan Box: 2 products (Normal + Premium) + separate extras per product
- Fit Bar: 10 products + 2 combos
- All editable from Admin > Productos

### Phase 5: Recurring Customers + Tier Pricing (Complete)
**Completed:**
- `customers` table with membership tiers (`individual`, `premium`, `business`)
- RPC function `find_customer_by_phone` (public, `SECURITY DEFINER`)
- Trigger `sync_customer_stats` for auto-upsert on new orders
- Lunch Box: phone field + customer lookup on blur + welcome badge + tier discounts applied
- Tier discount config in Admin > Configuración > Descuentos por Membresía
- Fit Bar: phone field + lookup + welcome badge + tier pricing applied to cart
- Nappan Box: phone lookup + welcome badge + tier pricing applied to both Normal/Premium boxes
- Eventos en Vivo remains excluded from Phase 5 because it is an open quotation flow

### Phase 6: Admin V2 Optimization + Analytics (In Progress)

#### Goals
- Refactor `nappan-admin-v2.html` into a maintainable modular admin shell
- Improve Supabase query efficiency and reduce redundant data loading
- Move heavy dashboard analytics from client-side loops to backend RPC aggregation
- Standardize dashboard state management, rendering, and auth/session flow
- Prepare `order_items` to become the canonical analytics source

#### Phase 6.1: Admin Shell Modularization + State Cleanup (Completed)
- `nappan-admin-v2.html` now acts as the admin shell/layout instead of holding the full implementation
- Admin logic moved into `nappan-admin-v2.js`
- Admin-specific styles extracted to `admin-v2.css`
- Shared dashboard state exposed via `window.NappanAdminState`
- Auth flow hardened from polling to session bootstrap + auth state listener
- Initial batch helpers added in `supabase-client.js`:
  - `loadProductsForSections()`
  - `loadProductsWithExtras()`
  - `onAuthStateChange()`
- Visible admin copy normalized to Spanish labels such as `Estado`, `Configuración`, `Estadísticas`, `Teléfono` and `Galería`

#### Phase 6.2: Query Optimization + Batch Loading (Active)
- Add a tab-scoped cache/store on top of `window.NappanAdminState` for:
  - `orders`
  - `products`
  - `productsWithExtras`
  - `customers`
  - `config`
  - `gallery`
  - `statsInput`
- Define cache invalidation rules per admin action:
  - order status/edit/delete/recover invalidates `orders`, `customers`, and `statsInput`
  - product or extra edits invalidate `products`, `productsWithExtras`, and order edit selector data
  - config, shipping, gallery, and tier writes invalidate only the affected config buckets
  - customer CRUD invalidates `customers` and `statsInput`
- Replace repeated full `orders` reloads so `Pedidos`, `Clientes`, and `Estadísticas` reuse the same cached canonical dataset unless explicitly invalidated
- Add admin-oriented batch methods in `supabase-client.js`:
  - `loadAdminBootstrap()`
  - `loadAdminConfigBundle()`
- Refactor each tab to one `ensureXLoaded({ force })` data path plus one render path
- Keep analytics client-side in this step, but make them consume only cached `orders`
- Do not introduce schema changes or backend analytics RPC migration in 6.2

#### Optimization Track
- **Admin modularization**
  - Split admin logic into domains: `auth`, `orders`, `products`, `customers`, `config`, `stats`, `ui`, `state`
  - Keep `nappan-admin-v2.html` as layout shell only
  - Extract admin-specific CSS and remove repeated inline styling

- **Rendering and UI**
  - Replace inline `onclick` / `onchange` / `onsubmit` handlers with centralized event listeners
  - Reduce large `innerHTML` string rendering and add safe DOM rendering helpers
  - Standardize loading, empty, error and confirmation states across tabs

- **Data layer optimization**
  - Replace sequential per-section loads with parallelized queries
  - Eliminate N+1 patterns for products/extras/config views
  - Add dashboard-oriented API methods in `supabase-client.js`
  - Define cache invalidation rules per tab and action

- **Analytics**
  - Extend or adopt `get_dashboard_stats()` for KPIs, top products, top customers and trends
  - Reduce dependence on client-side aggregation over `allOrders`
  - Migrate analytics progressively toward normalized `order_items`

- **Robustness**
  - Replace auth polling with session bootstrap + auth state listener
  - Improve validation, phone normalization and numeric/date input handling
  - Add safer update flows for config mutations and error feedback

#### Follow-up Checklist
- [x] Admin shell split from business logic
- [x] Shared dashboard state store defined
- [ ] Orders/products/customers/config loads optimized
- [ ] Stats moved to backend aggregation
- [ ] `order_items` analytics path defined
- [x] Auth/session lifecycle hardened
- [ ] Regression test pass on all admin tabs

---

## Key Files

### Core
- `index.html` - Landing page with admin link in footer
- `supabase-client.js` - Supabase client API (`window.NappanDB`)
- `nappan-admin-v2.html` - Admin shell (auth-gated)
- `nappan-admin-v2.js` - Admin dashboard logic and state handling
- `admin-v2.css` - Admin-specific extracted styles
- `supabase-schema.sql` - DDL for all tables + RLS + triggers
- `supabase-phase5-schema.sql` - Phase 5: customers table + RPC + trigger
- `supabase-phase6-schema.sql` - Phase 6 analytics RPC baseline

### Section Pages
- `nappan-lunchbox.html` - Complete (phone field + lookup + tier pricing)
- `nappan-fitbar.html` - Complete (phone field + lookup + tier pricing)
- `nappan-box.html` - Complete (lookup + tier pricing)
- `nappan-eventos.html` - Live quotation flow

---

## Next Steps

1. Phase 6.2 - Supabase query optimization and batch loading
2. Server-side analytics integration for Admin > Estadísticas
3. Optional polish - PWA, service worker, enhanced mobile UX

---

## SQL Still to Run (Phase 5)

Execute in Supabase SQL Editor to enable admin `INSERT` / `DELETE` on customers:

```sql
CREATE POLICY "customers_insert_admin" ON customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "customers_delete_admin" ON customers
  FOR DELETE USING (auth.role() = 'authenticated');
```

---

## Verification Checklist (Current System)

- [x] Lunch Box phone field recognizes existing customers
- [x] Membership badge shows with tier and discount percentage
- [x] Cart total reflects discount
- [x] WhatsApp message includes discount breakdown
- [x] Admin can edit tier discount percentages
- [x] Changes reflect in Lunch Box immediately
- [x] Admin can CRUD customers (view, edit name/tier, add, delete)
