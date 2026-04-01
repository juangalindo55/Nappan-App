# CLAUDE.md — Nappan App Architecture & Guidelines

This file provides guidance to Claude Code when working with the **Nappan** repository.

## Project Overview

**Nappan** is a lifestyle brand app (Lunch Box, Nappan Box, Protein Fit Bar & Eventos en Vivo) built with pure HTML5, CSS3, and Vanilla JavaScript.
**Status:** Modular multi-page architecture. 4 sections fully functional.

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

- `index.html` — Main landing page. Navigation hub to all sections via card grid.

### Shared Resources

- `styles.css` — Global design system. CSS variables (colors, fonts), shared layout rules, and page-specific styles scoped via `body.page-*` classes. (~2,100 lines, optimized).
- `script.js` — Navigation router (`goTo(page)`) and "coming soon" toast.
- `utils.js` — Shared constants. Currently exports `WA_NUMBER` for WhatsApp integration.

### Section Pages (Independent Modules)

Each section is a standalone file for isolated maintenance:

| File | Section | Status |
|---|---|---|
| `nappan-lunchbox.html` | Lunch Box — events & birthdays | ✅ Live |
| `nappan-box.html` | Nappan Box + Premium Box — custom pancake art | ✅ Live |
| `nappan-fitbar.html` | Protein Fit Bar — coffee, shots, pancakes, combos | ✅ Live |
| `nappan-eventos.html` | Eventos en Vivo — live pancake art at events | ✅ Live |

### Page Pattern

Each section page is self-contained:
1. Imports `styles.css` for global design system
2. Imports `utils.js` for shared constants (WA_NUMBER)
3. Contains section-specific CSS in `<style>` and JS in `<script>` inline
4. Has its own back-navigation to `index.html` (button inside the unified header)
5. Loads Google Fonts (Inter + Montserrat) independently

### Header Pattern (unified across all pages)

All section pages use an identical header structure:
```html
<header>
  <button class="back-btn" onclick="window.location.href='index.html'">← Inicio</button>
  <img src="images/logo-dorado.webp" alt="Nappan" class="logo-img"/>
  <div><!-- right slot: cart button or empty spacer --></div>
</header>
```
- CSS: `display: grid; grid-template-columns: 1fr auto 1fr` keeps logo perfectly centered.
- Background: `#1A1008` (dark), height `130px`, `position: fixed`.

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
5. **Images:** Use WebP format. Convert with `sharp -i input.png -o output.webp` (sharp-cli installed globally).
6. **WhatsApp number:** Always reference `WA_NUMBER` from `utils.js`. Never hardcode the number in page scripts.
7. **Header:** All section pages must use the unified header pattern (logo-dorado.webp, dark background, 3-column grid). Never diverge from this pattern.