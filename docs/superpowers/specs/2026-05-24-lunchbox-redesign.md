# Lunchbox Order Page Redesign: Two-Phase Form

**Date:** 2026-05-24  
**Status:** In Implementation  
**Goal:** Transform Lunchbox ordering page into polished, conversion-first ecommerce experience with improved visual hierarchy, clarity, and premium feel.

## Problem Statement

Current Lunchbox page has three friction points:
1. **Premium feel isn't coming through** — layout feels utilitarian, not premium
2. **Product/pricing clarity** — key options not prominent enough upfront
3. **Configuration feels clunky** — five separate sections feel overwhelming

## Design Approach: Two-Phase Form

Split configuration into two visual phases:
- **Phase 1 (Essential):** Variant + Design selection → prominent, generous spacing, primary focus
- **Phase 2 (Optional):** Complement + Extras → visually lighter, secondary treatment, signals "nice-to-have"

## Layout & Structure

```
Hero Section
├─ Improved copy (benefit-driven, appetite-appealing)
├─ Warm gradient background (maintain brand harmony)
└─ Better spacing/breathing room

Phase 1: Essential Config ("Elige tu caja")
├─ Variants (Lunchbox 1 vs 2)
│  ├─ Larger cards with name, price, benefit description
│  ├─ Gold border on selected state
│  └─ Generous padding/spacing
├─ Design selection (Osito/Capibara)
│  └─ Same card treatment, clear visual hierarchy
└─ Clear pricing visibility throughout

Phase 2: Optional Refinement ("Personaliza - opcional")
├─ Complement (Fruta/Gelatina) → checkbox style, secondary weight
├─ Extras (Salchipulpos, Nucolato, Croissant) → toggles, visually lighter
└─ Disabled state for variant-restricted extras

Quantity & Summary
├─ Quantity input (with +/- buttons)
├─ Final review section (current selections summary)
└─ Order total calculation

Sticky/Bottom Checkout Bar
├─ "Agregar al carrito" button
├─ Error feedback (inline, red alert)
└─ Success feedback (inline, gold success state)
```

## Copy Improvements

**Hero:**
- Current: "Configura cajas para cumpleaños, colegios y celebraciones."
- New: "Cajas personalizadas para cualquier celebración. Mínimo 20 piezas."

**Variants:**
- Current: "Caja base para eventos. Permite agregar salchipulpos."
- New: "La clásica. Perfecta para eventos. Agrega tus extras favoritos."

**Extras:**
- Current: "Cambio a Nucolato" → "Upgrade a Nucolato"
- Current: "Croissant completo" → "Agrega un croissant delicioso"

## Visual Hierarchy

- **Phase 1:** Large cards (min-h-[126px] or larger), full width on mobile, gold accents on select
- **Phase 2:** Smaller visual weight, secondary section heading tone, optional label
- **Spacing:** Increased padding in Phase 1 (4-5 sections with clearer boundaries), tighter in Phase 2
- **Typography:** Bold section headers with eyebrow labels, benefit-driven descriptions

## Responsive Behavior

- **Mobile:** Single column, Phase 1 full width, Phase 2 compact, bottom-anchored checkout
- **Tablet:** Two-column variant grid, Phase sections stack
- **Desktop:** Generous padding, wider cards, elegant proportions maintained

## Brand Harmony

- Keep existing color palette (gold, cream, brown, dark surfaces)
- Maintain warm/cozy premium aesthetic
- Reuse existing component tokens (surface-1, surface-2, border, text colors)
- No new colors or dramatic style changes
- Avoid bento-heavy grid layouts

## Functional Requirements

- Preserve all existing cart/order state logic (useCartStore)
- Maintain variant-extra validation rules (e.g., Salchipulpos only for Lunchbox1)
- Keep disabled state handling for restricted options
- Error and success feedback flows remain intact
- All responsive breakpoints tested (mobile, tablet, desktop)

## Scope

- File: `src/features/orders/lunchbox/LunchboxConfiguratorScreen.tsx`
- No changes to data structures or store logic
- No changes to page route or BottomNav integration
- Component-level styling only (inline styles + className)

## Success Criteria

1. ✓ Visual hierarchy clearly shows Phase 1 > Phase 2
2. ✓ Pricing and product descriptions visible upfront
3. ✓ Page feels premium while maintaining warmth
4. ✓ Mobile-friendly and responsive at all breakpoints
5. ✓ All existing functionality preserved
6. ✓ Improved copy is benefit-driven, not technical
7. ✓ No unrelated refactors or code cleanup
8. ✓ Passed manual verification in browser
