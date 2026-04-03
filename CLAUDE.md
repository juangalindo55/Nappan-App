# CLAUDE.md - Nappan App Architecture & Guidelines

This file provides guidance to Claude Code when working with the **Nappan** repository.

## Project Overview

**Nappan** is a lifestyle brand app (Lunch Box, Nappan Box, Protein Fit Bar & Eventos en Vivo) built with pure HTML5, CSS3, and Vanilla JavaScript.
**Status:** Modular multi-page public site. 4 sections fully functional. **Phases 1-5 complete: Supabase integration, order capture, dynamic pricing, admin dashboard, recurring tier discounts.** Current priority: **Admin V2 optimization + analytics hardening**.

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

### Shared Resources

- `styles.css` - Global design system. CSS variables (colors, fonts), shared layout rules, and page-specific styles scoped via `body.page-*` classes.
- `script.js` - Navigation router (`goTo(page)`) and "coming soon" toast.
- `utils.js` - Shared constants. Currently exports `WA_NUMBER` for WhatsApp integration.
- `supabase-client.js` - Shared Supabase client and `window.NappanDB` API.

### Section Pages (Independent Modules)

| File | Section | Status |
|---|---|---|
| `nappan-lunchbox.html` | Lunch Box - events & birthdays | Live |
| `nappan-box.html` | Nappan Box + Premium Box - custom pancake art | Live |
| `nappan-fitbar.html` | Protein Fit Bar - coffee, shots, pancakes, combos | Live |
| `nappan-eventos.html` | Eventos en Vivo - live pancake art at events | Live |

### Page Pattern

Each section page is self-contained:
1. Imports `styles.css` for global design system
2. Imports `utils.js` for shared constants (`WA_NUMBER`)
3. Contains section-specific CSS in `<style>` and JS in `<script>` inline
4. Has its own back-navigation to `index.html` (button inside the unified header)
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

### Tier Pricing

- Customers are detected by phone on blur
- Membership tiers: `individual`, `premium`, `business`
- Discounts are configurable from Admin > Configuracion > Descuentos por Membresia

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

## Admin Dashboard (`nappan-admin-v2.html`)

Current admin includes:
- Pedidos - filters, status updates, expandable details, pagination, CSV export
- Productos - inline price editing
- Clientes - CRUD operations
- Configuracion - WhatsApp, shipping, extras, gallery, tier discounts
- Estadisticas - client-rendered KPIs and charts (to be optimized)

**Access:** Discrete admin link in `index.html` footer (not visible on section pages).

### Admin Architecture Priority

`nappan-admin-v2.html` currently contains too much UI, state, rendering, analytics and CRUD logic in one file. Future work should prioritize:

- Splitting admin logic into modules by domain:
  - `auth`
  - `orders`
  - `products`
  - `customers`
  - `config`
  - `stats`
  - `ui`
  - `state`
- Keeping the HTML file as a dashboard shell, not the main implementation surface
- Replacing inline event handlers with centralized listeners
- Reducing direct `innerHTML` rendering for complex dynamic views
- Avoiding repeated full-table reloads when only one domain changed
- Moving heavy analytics work to Supabase RPC / aggregated queries
- Treating `order_items` as the long-term analytics source over `raw_cart`

### Admin Development Rules

When modifying the admin:
1. Do not add new large features directly inside `nappan-admin-v2.html` unless they are strictly presentational.
2. Prefer adding or extending methods in `supabase-client.js` for dashboard-oriented data access.
3. Avoid sequential per-section fetch loops when batch or parallel loading is possible.
4. Reuse loaded dashboard state whenever possible and define explicit cache invalidation after writes.
5. For analytics, prefer normalized or server-side aggregation instead of parsing `raw_cart` in multiple places.
6. Keep auth/session handling centralized and deterministic.

## Development Rules

1. **Clean CSS:** Do not add redundant styles. Always check `styles.css` before adding new classes. Page-specific styles go in `body.page-*` scope.
2. **Modular Growth:** To add a new business line, create a new `nappan-[seccion].html` instead of modifying the landing content structure.
3. **Navigation:** Always update the `goTo()` function in `script.js` when adding new pages.
4. **Typography:** Follow the Inter + Montserrat system. Never use Montserrat for anything below H1.
5. **Images:** Prefer WebP assets for new product imagery.
6. **WhatsApp number:** Always reference `WA_NUMBER` from shared config/constants. Never hardcode the number in page scripts.
7. **Header:** All section pages should preserve the unified header pattern.
