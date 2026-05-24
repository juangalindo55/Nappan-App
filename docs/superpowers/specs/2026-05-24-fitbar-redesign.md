# Fitbar Redesign Spec — 2026-05-24

## Goal

Redesign `FitbarOrderScreen` to be visually appealing and UX-friendly on both mobile and desktop, replacing the current plain stepper list with a layout that combines the best of two explored directions.

## Layout Strategy

**Mobile (< md breakpoint):** Horizontal list cards — image on the left (wide ~90px), product name + short description + price in the center, stacked +/− buttons on the right.

**Desktop (≥ md breakpoint):** 2-column grid — image on top (~100px tall), name + price below, inline stepper (−·qty·+) at the bottom of the card.

Both share the same header, tabs, and CTA. Responsive switch is handled with Tailwind `md:` breakpoint classes.

## Sections

### 1. Header

Dark gradient (`#2A1710 → #6B3A2A`) replacing the current radial gradient. Contains:
- Eyebrow label: "BARRA BIENESTAR"
- Title: "Barra Fitbar"
- Subtitle: "Arma tu selección — mínimo $1,000 MXN"
- Progress bar: gold fill, shows `(total / 1000) * 100%` width, capped at 100%
- Progress label: "$X seleccionado" left · "$Y para completar" right (disappears when minimum is met)

### 2. Category Tabs

Sticky below header. Three tabs: ☕ Café · ⚡ Shots · 🥞 Comida. Active tab has gold underline + gold text. Inactive tabs are muted. Clicking a tab filters the visible product list — no page reload, pure state.

### 3. Product Cards (Mobile — list)

Each card is a horizontal row:
- **Left:** color gradient block ~90px wide, full card height (acts as image placeholder until real images are added)
- **Center:** `name` (bold, 13px), `description` from local SKU map (muted, 11px), `$price` (gold, 12px bold)
- **Right:** stacked vertically — `+` button (gold circle, 28px), quantity number, `−` button (cream circle, 28px). `−` is visually disabled (lighter) when qty = 0.

SKU is not shown to the user.

### 4. Product Cards (Desktop — grid)

2-column grid, each card:
- **Top:** color gradient block, full width, ~90px tall. If qty > 0, a gold badge with the count is overlaid top-right.
- **Body:** `name` (bold, 12px), `$price` (gold, 12px)
- **Bottom:** inline stepper row — `−` · qty · `+` on a cream pill background

### 5. Product Descriptions (Local Map)

Since `description` is null in the DB for all fitbar products, a local constant maps SKU → short description string (≤ 40 chars). Shown on mobile cards only (desktop cards are too compact). If a SKU has no mapping, the description line is omitted.

```
FITBAR-BLACK-COFFEE  → "Americano concentrado"
FITBAR-COLD-BREW     → "Frío · extracción lenta 12h"
FITBAR-COLD-LATTE    → "Con proteína · sin azúcar"
FITBAR-DETOX-GLOW    → "Jengibre · limón · cúrcuma"
FITBAR-ENERGY-BOOST  → "Cafeína + vitamina B"
FITBAR-GOLDEN-POWER  → "Cúrcuma · pimienta · miel"
FITBAR-COMBO-SHOTS   → "3 shots a elegir"
FITBAR-COMBO-FIT     → "Bebida + snack proteico"
FITBAR-POWER-PANCAKES→ "Mini pancakes de avena"
FITBAR-PROTEIN-MINIS → "Bocados proteicos sin azúcar"
```

### 6. Sticky CTA Bar

Replaces the current sticky summary bar. Simpler: one line showing total on the left, one gold button on the right ("Agregar al carrito"). When total < $1,000 the button is greyed and shows "Faltan $X" instead of the total. After a successful add, shows a brief success state with a "Ir al carrito" link before resetting.

### 7. Removed

- Bottom "Selección final" summary card — redundant with the header progress bar and CTA.
- SKU display on product cards.
- The wide `<input type="number">` stepper — replaced with stacked buttons on mobile and inline pill on desktop.

## Files Changed

| File | Change |
|---|---|
| `src/features/orders/fitbar/FitbarOrderScreen.tsx` | Full redesign |
| `src/features/orders/fitbar/fitbar.service.ts` | Add `description` to select (optional, will be null) |

No new files. No route changes. No DB changes.

## Color Reference (from global tokens)

- `--bg-primary: #FFF8EA`
- `--gold: #D89B2B`
- `--surface-1: rgba(255,252,245,0.86)`
- `--surface-2: rgba(245,239,222,0.6)`
- `--text-primary: #2A1710`
- `--text-secondary: #765E4B`
- `--text-tertiary: #9A7A61`
- `--border: rgba(88,55,34,0.13)`
