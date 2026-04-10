# CLAUDE.md - Nappan App Architecture & Guidelines

This file provides guidance to Claude Code when working with the **Nappan** repository.

## Project Overview

**Nappan** is a lifestyle brand app (Lunch Box, Nappan Box, Protein Fit Bar & Eventos en Vivo) built with pure HTML5, CSS3, and Vanilla JavaScript.
**Status:** Modular multi-page public site. 4 sections fully functional. **Phases 1-7 complete: Supabase integration, order capture, dynamic pricing, admin dashboard, recurring tier discounts, admin security & performance optimization, admin dashboard modularization, analytics backend migration to RPC functions.** Current UI polish includes the home hero logo using `images/Logo Dorado Nappan V2.svg`, `Hora Aproximada` in order details, editable `Hora de Entrega` in `Editar Pedido`, and Lunch Box extra label overrides from `Configuración`.

## Running Locally

Start the local static server on port 8080:

```bash
# From project root (Windows)
.claude\serve.bat
```

Then open http://localhost:8080 in the browser.

## Architecture & File Structure

The project uses a **modular multi-page** structure. Each business line is a standalone HTML file.

### Entry Point

- `index.html` - Main landing page. Navigation hub to all sections via card grid.
- `pages/nappan-index.html` - Landing redirect alias used by the admin logo.

### Shared Resources

- `css/styles.css` - Global design system. CSS variables (colors, fonts), shared layout rules, and page-specific styles scoped via `body.page-*` classes.
- `js/script.js` - Navigation router (`goTo(page)`) and "coming soon" toast.
- `js/utils.js` - Shared constants. Currently exports `WA_NUMBER` for WhatsApp integration.
- `js/supabase-client.js` - Shared Supabase client and `window.NappanDB` API.

### Section Pages (Independent Modules in `pages/` folder)

| File | Section | Status |
|---|---|---|
| `pages/nappan-lunchbox.html` | Lunch Box - events & birthdays | Live |
| `pages/nappan-box.html` | Nappan Box + Premium Box - custom pancake art | Live |
| `pages/nappan-fitbar.html` | Protein Fit Bar - coffee, shots, pancakes, combos | Live |
| `pages/nappan-eventos.html` | Eventos en Vivo - live pancake art at events | Live |

### Page Pattern

Each section page is self-contained (located in `pages/` folder):
1. Imports `../css/styles.css` for global design system
2. Imports `../js/utils.js` for shared constants (`WA_NUMBER`)
3. Contains section-specific CSS in `<style>` and JS in `<script>` inline
4. Has its own back-navigation to `../index.html` (button inside the unified header)
5. Loads Google Fonts (Inter + Montserrat) independently

### Header Pattern (Unified Across All Pages)

All section pages use an identical header structure:

```html
<header>
  <button class="back-btn" onclick="window.location.href='index.html'">← Inicio</button>
  <img src="images/logo-dorado.webp" alt="Nappan" class="logo-img" />
  <div><!-- right slot: cart button or empty spacer --></div>
</header>
```

- CSS uses `display: grid; grid-template-columns: 1fr auto 1fr` to keep the logo centered.
- Background: `#1A1008` (dark), height `130px`, `position: fixed`.

## Design System (NAPPAN Brand)

### Typography
- **Montserrat** - exclusively for H1 headings
- **Inter** - H2, H3, body, labels, buttons, prices

Full spec in `TYPOGRAPHY_SYSTEM.md`.

### Colors

| Variable | Hex | Usage |
|---|---|---|
| `--gold` | `#DAA520` | Primary brand color |
| `--yellow` | `#FFD93D` | Accents, CTAs, prices |
| `--dark` | `#1A1008` | Dark backgrounds |
| `--cream` | `#FFF8ED` | Light backgrounds, text on dark |
| `--brown` | `#2D1B0E` | Primary text |
| `--green-light` | `#A8E6CF` | Fit Bar accent |
| `--pink` | `#FFB3C6` | Nappan Box accent |

### Principle

Minimalist, high-end boutique feel. Mobile-first responsive design.

## Supabase Integration (Phases 1-5)

Backend: **Supabase PostgreSQL + Auth + RLS**

### Core Tables
- `orders` - Every order (anon `INSERT`, admin `SELECT` / `UPDATE`)
- `customers` - Recurring customers with membership tiers (admin CRUD)
- `products` - Dynamic catalog with pricing (anon `SELECT`, admin CRUD)
- `product_extras` - Add-ons per product (anon `SELECT`, admin CRUD)
- `app_config` - Key-value config (anon `SELECT`, admin `UPDATE`)
- `event_gallery` - Dynamic gallery photos (anon `SELECT`, admin CRUD)
- `order_items` - Long-term normalized line items for analytics

### Client API: `window.NappanDB`

All functions are exported from `supabase-client.js`.

- **Public:** `saveOrder()`, `loadProducts()`, `loadExtras()`, `loadAppConfig()`, `findCustomerByPhone()`
- **Admin:** `loadCustomers()`, `updateCustomer()`, `insertCustomer()`, `deleteCustomer()`, `updateOrderStatus()`, and related dashboard methods
- **Analytics (Phase 7):** `getStatsKpis()`, `getOrdersBySection()`, `getOrdersByStatus()`, `getRevenueBySection()`, `getOrdersByHour()`, `getTopProducts(limit)`, `getTopCustomers(limit)` — all RPC-backed

### Tier Pricing

- Customers are detected by phone on blur
- Membership tiers: `individual`, `premium`, `business`
- Discounts are configurable from Admin > Configuración > Descuentos por Membresía

## Environment Configuration & Script Loading Order (Phase 8 - Vercel Deployment)

**Critical:** Deployment uses Vercel serverless functions to inject environment variables securely. The following loading order is essential and must not be changed.

### Architecture

1. **`/api/config`** (Vercel serverless function)
   - Returns JSON with 4 env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GOOGLE_MAPS_API_KEY`, `WHATSAPP_NUMBER`
   - Reads from Vercel Environment Variables (not .env files)
   - Disables caching to ensure fresh values on deploys

2. **`js/config.js`** (Client-side bootstrap)
   - Initializes `window.NappanConfig` with hardcoded fallback defaults (localhost)
   - Calls `loadConfig()` which fetches `/api/config` asynchronously
   - Sets `window.NappanConfig.READY = true` when done (success or fallback)
   - Calls `window.reinitializeSupabase()` to init Supabase client with real credentials
   - Calls `initGoogleMapsAPI()` to load Google Maps script (only once globally)
   - **Guard:** If already READY or currently loading, returns early to prevent duplicate executions across page navigations

3. **`js/supabase-client.js`** (Supabase client init)
   - Exports `window.reinitializeSupabase()` function that `config.js` calls
   - **Guard:** Skips init if URL is localhost AND config.READY !== true (prevents exposing broken client with fallback values)
   - Only exposes `window.NappanDB` after successful client creation with real credentials
   - Getter-based property `.supabase` for auth methods (compatibility with modules)

4. **Page scripts** (All section pages + admin)
   - Include `js/config.js` first (loads and fetches config)
   - Include `js/supabase-client.js` second
   - Poll for `window.NappanDB` (max 10 seconds) before using it:
     ```javascript
     let maxAttempts = 100;
     while (!window.NappanDB && maxAttempts > 0) {
       await new Promise(r => setTimeout(r, 100));
       maxAttempts--;
     }
     ```
   - This prevents race conditions where pages try to use NappanDB before config finishes loading

5. **Admin modules** (`js/admin-modules/`)
   - Auth module (`auth.js`) has async `getDb()` that waits for `window.NappanDB`
   - Main module (`nappan-admin-v2.js`) also has async `getDb()` with polling
   - Both modules wait up to 5 seconds for `window.Auth` to be exposed by module script

6. **Google Maps** (`js/config.js` + `js/chatbot.js`)
   - `config.js` loads Google Maps via `initGoogleMapsSDK()` (guard prevents duplicates)
   - `chatbot.js` waits for `window.google.maps` instead of loading its own script
   - Prevents "Multiple Google Maps API" warnings and internal errors

### Why This Matters

- **Vercel env vars** are only available at request time; they cannot be bundled with static assets
- **Race conditions** occur when async config loading competes with sync supabase-client initialization
- **Module script timing** causes `window.Auth` to be exposed asynchronously after nappan-admin-v2.js runs
- **Page navigation** reloads config.js multiple times; guards prevent duplicate script injections

### When Making Changes

1. Never hardcode credentials in JavaScript or HTML
2. Never remove the guards in `loadConfig()`, `initializeSupabaseClient()`, or `initGoogleMapsAPI()`
3. Always ensure polling loops wait for both `window.NappanDB` and `window.Auth` before using them
4. Test page navigation between sections to verify no duplicate script loads
5. Verify `/api/config` returns correct Vercel env vars before debugging client-side issues

## WhatsApp Integration

The business phone number is dynamic and should be loaded from `app_config` at runtime:

```javascript
const WA_NUMBER = await NappanDB.getConfigValue('whatsapp_number', '528123509768');
```

Fallback in `utils.js` if Supabase is unavailable:

```javascript
const WA_NUMBER = '528123509768';
```

All pages should reference this constant for orders.

## Admin Dashboard (`pages/nappan-admin-v2.html`)

Current admin includes:
- Pedidos - filters, status updates, expandable details, delivery time display, pagination, CSV export
- Productos - inline price editing
- Clientes - CRUD operations
- Configuración - WhatsApp, shipping, extras, gallery, tier discounts, Lunch Box extra labels
- Estadísticas - RPC-backed KPIs and analytics

**Access:** Discrete admin link in `index.html` footer (not visible on section pages).

### Admin Architecture Priority

Current baseline after Phase 7 (Analytics Backend Migration):

- `pages/nappan-admin-v2.html` is the admin shell/layout
- `js/admin-modules/nappan-admin-v2.js` contains admin logic, state handling, rendering, CRUD flows
- `css/admin-v2.css` contains extracted admin-specific styles
- `window.NappanAdminState` is the shared dashboard state surface
- `js/supabase-client.js` already exposes:
  - `loadProductsForSections()`
  - `loadProductsWithExtras()`
  - `onAuthStateChange()`
  - RPC methods for analytics: `getStatsKpis()`, `getOrdersBySection()`, `getRevenueBySection()`, etc.

- ✅ **Security & RLS Fix**: Resolved "new row violates row-level security policy" error (42501) occurring with new Supabase `sb_publishable_` keys.
  - Replaced direct `INSERT...RETURNING` (which required public SELECT access) with a `SECURITY DEFINER` RPC function `public_save_order`.
  - This allows anonymous users to save orders and receive the order number safely without compromising database security.
  
- ✅ **Directory Cleanup**: Audited and removed 17 obsolete files (~2.7 MB) to maintain repository hygiene.
  - Deleted: `nappan-admin.html` (V1), obsolete images, redundant docs, and old SQL migration scripts.
  - Updated `.gitignore` to prevent tracking of Windows system files like `desktop.ini`.
- ✅ **Admin order editing polish**
  - `Editar Pedido` now edits and persists `delivery_time` for manual delivery-time overrides.
  - Expanded order details now show `Hora Aproximada` for Lunch Box, Fit Bar, and Eventos en Vivo.
- ✅ **Lunch Box extra label overrides**
  - Admin `Configuración` now allows editing the visible text for Lunch Box 1 and Lunch Box 2 extras.
  - Labels are stored in `app_config` and read at runtime by `nappan-lunchbox.html`.

### Admin Modules (Phase 6.3 - Completed, Phase 7 - RPC Optimization)

8 domain-specific modules now handle all admin logic (located in `js/admin-modules/`):

**`js/admin-modules/state.js`** (244 lines)
- Centralized state store with all admin data (orders, products, customers, config, stats, auth)
- Cache invalidation rules with dependency tracking (products/orders → stats)
- Safe getters that return deep copies to prevent mutations
- Exported as both named (`AdminState`) and default export

**`js/admin-modules/ui.js`** (150 lines)
- `showToast(message, type)` - Toast notifications (info/success/error)
- `escapeHtml(text)` - XSS prevention for user data
- `clearElement()`, `setLoading()`, `setEmpty()`, `setError()` - State indicators

**`js/admin-modules/auth.js`** (98 lines)
- `init()` - Auth state listener setup
- `login(email, password)` - Sign-in with AdminState tracking
- `logout()` - Sign-out + full state invalidation
- `showDashboard()` / `showLogin()` - UI visibility toggle

**`js/admin-modules/orders.js`** (176 lines)
- `load()` - Fetch + cache orders
- `applyFilters()` / `setFilter()` - Search, section, status, deleted flag
- `getCurrentPageOrders()` / `nextPage()` / `previousPage()` - Pagination (20 per page)
- `updateStatus()` / `saveEdit()` / `delete()` / `recover()` - CRUD operations
- `exportCSV()` - Download filtered orders as CSV

**`js/admin-modules/products.js`** (147 lines)
- `load()` - Fetch all products + extras in parallel
- `updatePrice(productId, newPrice)` - Inline price editing
- Exports all to `window.Products`

**`js/admin-modules/customers.js`** (72 lines)
- `load()` / `insert()` / `update()` / `delete()` - Full CRUD
- Cache + state management via AdminState
- Exports to `window.Customers`

**`js/admin-modules/config.js`** (99 lines)
- `load()` - Fetch all 5 config sections in parallel (WhatsApp, shipping, extras, gallery, tier discounts)
- `saveWhatsapp()` / `saveShipping()` / `saveTierDiscounts()` - Save mutations
- Safe JSON parsing with fallbacks

**`js/admin-modules/stats.js`** (147 lines — Phase 7 optimized with RPC)
- `load()` - Ensure dependencies, fetch KPIs from RPC functions
- `computeStats()` - Calls 7 RPC functions in parallel (async), returns: totalOrders, totalRevenue, averageOrder, ordersBySection, revenueBySection, ordersByStatus, ordersByHour, topProducts (top 10), topCustomers (top 10)
- All client-side helper methods removed (computation now in PostgreSQL via RPC)

**`js/admin-modules/nappan-admin-v2.js`** (Main admin logic)
- Admin logic, state handling, rendering, CRUD flows
- All UI rendering and interactions
- Exposes functions to `window` for backward compatibility with inline onclick handlers

**Integration:**
- All modules expose to `window` for backward compatibility
- Imported via `<script type="module">` in HTML (`pages/nappan-admin-v2.html`)
- Existing `nappan-admin-v2.js` functions still used for all UI rendering/interactions
- No breaking changes to dashboard functionality

### Future Implementation Priority (Phase 7.2+)

Next work should prioritize:

- **Phase 7.2: Event handler refactor** - Replace 50+ inline `onclick` handlers with centralized event listeners
- **Phase 7.3: CSS extraction** - Pull admin-specific styles from global `styles.css` into `admin-modules/` scope
- **Phase 7.4: Rendering phase** - Add `render()` methods to each module, convert innerHTML patterns to safe DOM builders
- **Phase 7.5: Parallelization** - Identify remaining sequential operations and parallelize where safe

✅ **Phase 7.1 Complete:** Analytics backend migrated to Supabase RPC functions. Stats.js now orchestrates 7 parallel RPC calls instead of computing KPIs client-side.

### Admin Development Rules

When modifying the admin:
1. Do not add new large features directly inside `nappan-admin-v2.html` unless they are strictly presentational.
2. Prefer adding or extending methods in `supabase-client.js` for dashboard-oriented data access.
3. Avoid sequential per-section fetch loops when batch or parallel loading is possible.
4. Reuse loaded dashboard state whenever possible and define explicit cache invalidation after writes.
5. In Phase 6.2, keep analytics client-side but make them consume cached canonical `orders` data only.
6. Keep auth/session handling centralized and deterministic.
7. Refactor each tab toward one `ensureXLoaded({ force })` data path plus one render path.
8. Prefer bundled admin fetches such as `loadAdminBootstrap()` and `loadAdminConfigBundle()` over scattered top-level reads.

## Development Rules

1. **Clean CSS:** Do not add redundant styles. Always check `styles.css` before adding new classes. Page-specific styles go in `body.page-*` scope.
2. **Modular Growth:** To add a new business line, create a new `nappan-[seccion].html` instead of modifying the landing content structure.
3. **Navigation:** Always update the `goTo()` function in `script.js` when adding new pages.
4. **Typography:** Follow the Inter + Montserrat system. Never use Montserrat for anything below H1.
5. **Images:** Prefer WebP assets for new product imagery.
6. **WhatsApp number:** Always reference `WA_NUMBER` from shared config/constants. Never hardcode the number in page scripts.
7. **Header:** All section pages should preserve the unified header pattern.

