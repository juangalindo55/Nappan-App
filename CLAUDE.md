# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nappan** is a lifestyle brand app (Coffee & Fitbar) built with pure HTML5, CSS3, and Vanilla JavaScript — no build tools, no frameworks, no package manager.

## Running Locally

Start the local static server on port 8080:

```bash
# From project root (Windows)
.claude/serve.bat
```

Or directly with PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File ".claude/serve.ps1"
```

Then open `http://localhost:8080` in the browser.

There are no tests, no build step, and no lint commands.

## Architecture

All logic is self-contained in a small set of large files:

- **`index.html`** — Main landing page (entry point). Contains the full homepage UI inline.
- **`script.js`** — Global JS shared across pages. Includes:
  - `goTo(page)` — navigation router; routes to `nappan-lunchbox.html` or `nappan-fitbar.html`, shows a "Próximamente" toast for all other pages.
  - `initNappanBox()` — cart and WhatsApp order logic for the Lunchbox section.
- **`styles.css`** — Global styles shared across pages.
- **`nappan-fitbar.html`** — Fitbar page; fully self-contained (inline CSS + JS), no external dependencies.
- **`nappan-app.html`** — Coffee page (in progress).

### Page pattern
Each section page (fitbar, lunchbox, etc.) is a **standalone HTML file** with its own inline `<style>` and `<script>` blocks. This keeps pages independent and avoids external dependencies.

### WhatsApp integration
Orders are submitted by opening a WhatsApp URL. The business phone number is hardcoded as:
```javascript
const WA_NUMBER = '528123509768'; // Format: 52 + number without leading 0
```
This constant appears in both `script.js` (NappanBox) and `nappan-fitbar.html` (Fitbar cart).

## Design System

- **Fonts:** Playfair Display (headings) + Lora (body/italic) — loaded from Google Fonts
- **Colors:** `#DAA520` gold (primary), `#1a1a1a` dark background, `#FFF8ED` warm white, `#2D1B0E` deep brown
- **Principle:** Lightweight and minimalist — avoid heavy libraries or large images

## Adding a Product

In any section page, duplicate an existing `.product-card` and update:

```html
<h3>PRODUCT NAME</h3>
<p class="product-desc">DESCRIPTION</p>
<div class="product-price">PRICE</div>
<button class="add-btn" onclick="addToCart('NAME', PRICE, 'category')">+ Agregar</button>
```

## Enabling a New Page

To make a page accessible from the home menu, add a branch in `goTo()` in `script.js`:

```javascript
} else if (page === 'nappan-newpage.html') {
  window.location.href = page;
}
```
