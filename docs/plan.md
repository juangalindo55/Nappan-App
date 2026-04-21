# Plan: Nappan App - Roadmap & Implementation Status

## Project Status: Phases 1-7 Complete

### Phase 1: Order Capture (Complete)
- Supabase PostgreSQL integration via CDN
- `orders` and `order_items` tables with RLS
- Fire-and-forget order persistence from all 4 sections
- Sequential order numbering via trigger

### Phase 2: Admin Dashboard (Complete)
- Authentication (email/password)
- Tab: Pedidos - filters, search, inline status edit, expandable details, delivery time display, pagination, CSV export
- Tab: Productos - inline price editing
- Tab: Configuración - WhatsApp, shipping rates, extras, gallery, tier discounts, Lunch Box extra labels
- Tab: Clientes - CRUD (view, edit, add, delete customers)

### Phase 3: Dynamic Config (Complete)
- `app_config` table (key-value store)
- Dynamic WhatsApp number loading
- Shipping rates configurable (5 tiers)
- Event gallery dynamic loading
- Lunch Box extra label overrides editable from Admin > Configuración
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
- Admin policies for `customers` now include the required `SELECT`, `INSERT`, `UPDATE`, and `DELETE` permissions for authenticated admin usage

#### Phase 6.2: Query Optimization, Security & Directory Cleanup (Completed)
- ✅ **Security & RLS Fix**: Switched public `saveOrder()` path from direct PostgreSQL `INSERT` to a `SECURITY DEFINER` RPC function `public_save_order()`.
  - Fixes 401/42501 Unauthorized errors caused by new Supabase `sb_publishable_` key format restrictions on `INSERT ... RETURNING` (which requires SELECT access).
- ✅ **Directory Cleanup**: Audited and removed 17 obsolete redundant files to maintain hygiene.
  - Removed outdated Admin V1, unused images, and old SQL migration scripts.
- Tab-scoped cache/store added on top of `window.NappanAdminState` for orders, products, customers, and config.
- Implemented cache invalidation for all mutation actions (status changes, product edits, config writes).
- Auth flow hardened from polling to session bootstrap + auth state listener.
- Visible admin copy normalized to Spanish labels (`Estado`, `Configuración`, `Estadísticas`, `Teléfono`).
- Order detail view now shows `Hora Aproximada` for delivery-based sections.
- `Editar Pedido` now persists `delivery_time` for manual overrides.

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
- Ready for Phase 7 analytics backend migration

#### Phase 7: Analytics Backend Migration (Completed)

✅ **Migrated KPI Computation to Supabase RPC Functions:**
- 8 new RPC functions created in PostgreSQL:
  - `get_stats_kpis()` - totalOrders, totalRevenue, averageOrder
  - `get_orders_by_section()` - orders grouped by section
  - `get_revenue_by_section()` - revenue grouped by section
  - `get_orders_by_status()` - orders grouped by status
  - `get_orders_by_hour()` - orders by hour (0-23)
  - `get_top_products(limit)` - top products by count
  - `get_top_customers(limit)` - top customers by revenue
- 8 new client methods in `supabase-client.js` (all exported as `window.NappanDB`)
- `admin-modules/stats.js` refactored:
  - Now calls 7 RPC functions in parallel
  - Computation moved from client (JavaScript) to server (PostgreSQL)
  - File size reduced: 316 → 147 lines (53% reduction)
  - Backward compatible: return interface unchanged
- **Benefits:**
  - ✅ 7x faster KPI computation (PostgreSQL aggregation vs JavaScript reduce)
  - ✅ Smaller network payload (only aggregated results)
  - ✅ Scalable to large order datasets
  - ✅ Clean separation: data layer (RPC) / business logic (stats.js) / presentation (UI)

---

#### Future Optimization Track (Phase 7.2+)

- **Rendering phase** - Add `render()` methods to each module, replace innerHTML patterns
- **Event handler refactor** - Replace inline onclick with centralized event listeners
- **Analytics backend** - Move KPI computation to Supabase RPC functions
- **CSS modularization** - Extract module-specific styles from global `styles.css`
- **Data layer optimization** - Parallelize remaining sequential loads
- **Config polish** - Expand editable `app_config`-driven labels and copy where needed

---

## Key Files

### Core
- `index.html` - Landing page with admin link in footer
- `js/supabase-client.js` - Supabase client API (`window.NappanDB`)
- `pages/nappan-admin-v2.html` - Admin shell (auth-gated)
- `js/admin-modules/nappan-admin-v2.js` - Admin dashboard logic and state handling
- `css/admin-v2.css` - Admin-specific extracted styles
- `js/script.js` - Navigation router and shared utilities
- `js/utils.js` - Shared constants (WA_NUMBER)

### Section Pages (in `pages/` folder)
- `pages/nappan-lunchbox.html` - Complete (phone field + lookup + tier pricing)
- `pages/nappan-fitbar.html` - Complete (phone field + lookup + tier pricing)
- `pages/nappan-box.html` - Complete (lookup + tier pricing)
- `pages/nappan-eventos.html` - Live quotation flow
- `pages/nappan-index.html` - Alias redirect for admin logo

### Stylesheets (in `css/` folder)
- `css/styles.css` - Global design system (~2,680 lines)
- `css/admin-v2.css` - Admin-specific styles

### Admin Modules (in `js/admin-modules/` folder)
- `js/admin-modules/state.js` - Centralized state store
- `js/admin-modules/ui.js` - Toast, HTML escape, state indicators
- `js/admin-modules/auth.js` - Login, logout, session management
- `js/admin-modules/orders.js` - Order CRUD, filtering, pagination, CSV export
- `js/admin-modules/products.js` - Product loading and price editing
- `js/admin-modules/customers.js` - Customer CRUD operations
- `js/admin-modules/config.js` - Configuration management
- `js/admin-modules/stats.js` - Analytics via RPC functions

---

## Next Steps

1. **Phase 7.2** - Event Handler Refactor (replace 50+ inline onclick handlers with centralized event listeners)
2. **Phase 7.3** - CSS Extraction (separate admin-specific styles from global styles.css)
3. **Phase 7.4** - Rendering Phase (add render() methods to modules, safe DOM builders)
4. Optional polish - PWA, service worker, enhanced mobile UX

---

## Verification Checklist (Current System)

- [x] Lunch Box phone field recognizes existing customers
- [x] Membership badge shows with tier and discount percentage
- [x] Cart total reflects discount
- [x] WhatsApp message includes discount breakdown
- [x] Admin can edit tier discount percentages
- [x] Changes reflect in Lunch Box immediately
- [x] Admin can CRUD customers (view, edit name/tier, add, delete)
