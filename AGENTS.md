# AGENTS.md — Nappan App Architecture & Guidelines

This file provides guidance to Codex when working with the **Nappan** repository.

## Project Overview

**Nappan** is a lifestyle brand app (Lunch Box, Nappan Box & Protein Fit Bar) built with pure HTML5, CSS3, and Vanilla JavaScript.
**Status:** Modular multi-page architecture. 4 sections functional, including Eventos en Vivo.

## Running Locally

Start the local static server on port 8080:

```bash
# From project root (Windows)
.Codex\serve.bat
```

Then open http://localhost:8080 in the browser.

## Architecture & File Structure

The project uses a **modular multi-page** structure. Each business line is a standalone HTML file.

### Entry Point

- `index.html` — Main landing page. Navigation hub to all sections via card grid.

### Shared Resources

- `css/styles.css` — Global design system. CSS variables (colors, fonts), shared layout rules, and page-specific styles scoped via `body.page-*` classes. (~2,680 lines, optimized).
- `js/script.js` — Navigation router (`goTo(page)`) and "coming soon" toast.
- `js/utils.js` — Shared constants. Currently exports `WA_NUMBER` for WhatsApp integration.

### Section Pages (Independent Modules in `pages/` folder)

Each section is a standalone file for isolated maintenance:

| File | Section | Status |
|---|---|---|
| `pages/nappan-lunchbox.html` | Lunch Box — events & birthdays | ✅ Live |
| `pages/nappan-box.html` | Nappan Box + Premium Box — custom pancake art | ✅ Live |
| `pages/nappan-fitbar.html` | Protein Fit Bar — coffee, shots, pancakes, combos | ✅ Live |
| `pages/nappan-eventos.html` | Eventos en Vivo — live pancake art at events | ✅ Live |

### Page Pattern

Each section page is self-contained:
1. Imports `styles.css` for global design system
2. Imports `utils.js` for shared constants (WA_NUMBER)
3. Contains section-specific CSS in `<style>` and JS in `<script>` inline
4. Has its own back-navigation to `index.html`
5. Loads Google Fonts (Inter + Montserrat) independently

### Current Admin Notes

- `pages/nappan-admin-v2.html` is the admin shell/layout.
- `js/admin-modules/nappan-admin-v2.js` contains the dashboard logic, including order details, editable delivery time, CSV export, and configuration forms.
- `js/supabase-client.js` exposes `updateConfigValue()` as an idempotent `upsert` over `app_config`.
- Analytics are now powered by Supabase RPC functions (`getStatsKpis()`, `getOrdersBySection()`, etc.) for performance optimization.
- Lunch Box extra labels can now be overridden from Admin > Configuración.
- The admin logo links to `pages/nappan-index.html`, which redirects to the public landing page.
- Admin modules (state.js, auth.js, orders.js, products.js, customers.js, config.js, stats.js, ui.js) are located in `js/admin-modules/` and handle all domain-specific logic.

## Design System (NAPPAN Brand)

### Typography
- **Montserrat** (sans-serif geométrica) → EXCLUSIVELY for H1 headings
- **Inter** (sans-serif) → Everything else: H2, H3, body, labels, buttons, prices

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
Minimalist, high-end "boutique" feel. Mobile-first responsive design.

## Environment Configuration & Script Loading Order (Vercel Deployment)

**Critical:** This app uses Vercel serverless functions to inject environment variables securely. Script loading order is essential.

### Key Files

- **`/api/config.js`** — Vercel function that returns JSON with 4 env vars (SUPABASE_URL, SUPABASE_ANON_KEY, GOOGLE_MAPS_API_KEY, WHATSAPP_NUMBER)
- **`js/config.js`** — Fetches from `/api/config`, initializes `window.NappanConfig`, reinitializes Supabase, loads Google Maps (once)
- **`js/supabase-client.js`** — Exports `window.NappanDB` only after real credentials are loaded (not localhost fallback)

### Loading Sequence

1. Browser loads HTML page
2. `js/config.js` runs (async fetch to `/api/config`)
3. `js/supabase-client.js` runs (waits for real config before exposing NappanDB)
4. Page scripts poll for `window.NappanDB` (max 10 sec timeout)
5. Admin modules use async `getDb()` to wait for client availability
6. Google Maps loads once globally via `config.js` (not duplicated by chatbot.js)

### Guards to Never Remove

- `loadConfig()` in config.js has early return if already READY or loading
- `initializeSupabaseClient()` skips if URL is localhost and config not READY
- `initGoogleMapsAPI()` skips if already loaded or loading in progress
- All page scripts and modules poll for `window.NappanDB` before using it

### Debugging Environment Issues

- Check `/api/config` endpoint directly (browser DevTools Network tab)
- Verify Vercel Environment Variables are set with "All Environments" scope
- Verify console messages: "✓ Configuration loaded from API" and "✓ Supabase client re-initialized"
- If localhost in console, check Vercel deployment URL (may differ from preview link)

## WhatsApp Integration

The business phone number for orders is centralized in `utils.js`:

```javascript
const WA_NUMBER = '528123509768'; // Format: 52 + number
```

All pages import `utils.js` and reference this constant.

## Development Rules

1. **Clean CSS:** Do not add redundant styles. Always check `styles.css` before adding new classes. Page-specific styles go in `body.page-*` scope.
2. **Modular Growth:** To add a new business line (e.g., "Bakery"), create a new `nappan-bakery.html` instead of modifying `index.html` content.
3. **Navigation:** Always update the `goTo()` function in `script.js` when adding new pages.
4. **Typography:** Follow the Inter + Montserrat system. Never use Montserrat for anything below H1. See `TYPOGRAPHY_SYSTEM.md`.
5. **Images:** Use WebP format with PNG fallback via `<picture>` element for new product images.
6. **WhatsApp number:** Always reference `WA_NUMBER` from `utils.js`. Never hardcode the number in page scripts.

