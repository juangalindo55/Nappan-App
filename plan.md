# Plan: Nappan App - Roadmap & Implementation Status

## Project Status: Phases 1-6.3 Complete / Phase 7 Pending

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

#### Phase 6.2: Query Optimization, Security & Directory Cleanup (Completed)
- ✅ **Security & RLS Fix**: Switched public `saveOrder()` path from direct PostgreSQL `INSERT` to a `SECURITY DEFINER` RPC function `public_save_order()`.
  - Fixes 401/42501 Unauthorized errors caused by new Supabase `sb_publishable_` key format restrictions on `INSERT ... RETURNING` (which requires SELECT access).
- ✅ **Directory Cleanup**: Audited and removed 17 obsolete redundant files to maintain hygiene.
  - Removed outdated Admin V1, unused images, and old SQL migration scripts.
- Tab-scoped cache/store added on top of `window.NappanAdminState` for orders, products, customers, and config.
- Implemented cache invalidation for all mutation actions (status changes, product edits, config writes).
- Auth flow hardened from polling to session bootstrap + auth state listener.
- Visible admin copy normalized to Spanish labels (`Estado`, `Configuración`, `Estadísticas`, `Teléfono`).

#### Phase 6.3: Admin Dashboard Modularization (Completed)

✅ **8 new modules created in `admin-modules/`:**
- `state.js` (244 lines) - Centralized state store with cache invalidation rules
- `ui.js` (150 lines) - Toast, HTML escape, loading/empty/error states
- `auth.js` (98 lines) - Login, logout, session management
- `orders.js` (176 lines) - Load, filter, paginate, edit, delete, CSV export
- `products.js` (147 lines) - Load with extras, price editing
- `customers.js` (72 lines) - Full CRUD for customers
- `config.js` (99 lines) - WhatsApp, shipping, tier discounts management
- `stats.js` (316 lines) - KPI computation, aggregations, analytics

✅ **Integration to existing dashboard:**
- Modules exposed globally via `window` for backward compatibility
- All 8 modules loaded as ES6 imports in `<script type="module">`
- Existing `nappan-admin-v2.js` functions exposed to `window` for inline onclick handlers
- 100% functional parity with Phase 6.2 dashboard

✅ **Architecture benefits:**
- Separation of concerns: each module handles one domain
- Centralized cache invalidation with dependency tracking
- Reusable UI helpers (toast, escape, state indicators)
- Ready for Phase 7 render function expansion

---

#### Future Optimization Track (Phase 7+)

- **Rendering phase** - Add `render()` methods to each module, replace innerHTML patterns
- **Event handler refactor** - Replace inline onclick with centralized event listeners
- **Analytics backend** - Move KPI computation to Supabase RPC functions
- **CSS modularization** - Extract module-specific styles from global `styles.css`
- **Data layer optimization** - Parallelize remaining sequential loads

---

## Key Files

### Core
- `index.html` - Landing page with admin link in footer
- `supabase-client.js` - Supabase client API (`window.NappanDB`)
- `nappan-admin-v2.html` - Admin shell (auth-gated)
- `nappan-admin-v2.js` - Admin dashboard logic and state handling
- `admin-v2.css` - Admin-specific extracted styles
- `supabase-schema.sql` - DDL for all tables + RLS + triggers

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
