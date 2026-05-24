---
status: draft
version: 1
topic: product-sections-redesign
created: 2026-05-24
---

# Product Sections Redesign — V1 Draft

## Problem Statement

Current state: Four product sections (Nappan Box, Lunch Box, Fit Bar, Eventos) are displayed as identical 2-column grid cards with small images (160px). This creates:
- **Visual flatness**: No hierarchy or differentiation
- **Weak storytelling**: Images are too small to convey emotion or context
- **Unclear intent**: Users don't inherently know which product is for which occasion
- **Missing vibe**: Design feels utilitarian, not "cozy/fun/comfortable"

---

## Proposed Section Order & User Journey

**Recommendation: Option A — By Occasion (Gift → Social → Daily → Engagement)**

This flow mirrors how users discover and choose Nappan:
1. **Nappan Box** → *Gifting moments* (special, intentional, premium)
2. **Lunch Box** → *Group moments* (social, sharing, celebration)
3. **Fit Bar** → *Daily moments* (personal, wellness, routine)
4. **Eventos** → *Experiences* (memorable, premium, transformative)

**Why this order:**
- Moves from intimate (1 person gifting) → social (groups) → daily (individual routine) → premium experience (brand/enterprise)
- Each step answers: "What's the occasion? Who's involved? What's the vibe?"
- Natural progression makes browsing feel guided, not random

---

## Layout & Visual Differentiation Strategy

Each section gets a distinct layout to communicate its personality. All maintain brand coherence through:
- Warm brown + cream palette from `DESIGN_HARMONY_PLAN.md`
- Cormorant italic headings, DM Sans body
- Rounded cards (16px) with subtle borders
- Golden accents for CTAs

### 1. Nappan Box — "Personalized Gifting Experience"

**Visual Vibe:** Elegant, intimate, premium → Understated luxury

```
┌─────────────────────────────────────┐
│                                     │
│  [IMAGE: Full-bleed, tall]          │
│  (3:2 ratio, 320px height)          │
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │ Badge: "EXPERIENCIA DE GIFTING" ││
│  │ Heading: "Nappan Box"           ││
│  │ Copy: Personalized for...       ││
│  │                                 ││
│  │ CTA: Personaliza tu caja →      ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Layout**: Featured card (full width or near-full) with large image + text overlay on bottom
**Image**: `/images/nappan/gallery-1.jpg` (currently used, but sized larger: 320px+ height)
**Styling**: Light cream background, semi-transparent dark overlay on image to make text readable
**Font**: Larger heading (3.5rem+), elegant serif

**Why this works:**
- Takes up visual real estate → signals "this is special"
- Image showcases the artistry and personalization
- Text overlay creates intimate feel
- Premium positioning makes gifting feel intentional

**Breakpoints:**
- Mobile: Full-width stack (image 100%, text overlay at bottom)
- Tablet+: Hero treatment as shown above

---

### 2. Lunch Box — "Social, Abundant Sharing"

**Visual Vibe:** Warm, inviting, abundant → "Come together"

```
┌──────────────────────┬──────────────────────┐
│                      │                      │
│  [IMAGE: Left]       │  Badge: "EVENTOS"    │
│  (280px, 2:3 ratio)  │  Heading: "Lunch Box"│
│  Smaller, cozy       │  Copy: Cajas para    │
│  (shows abundance)    │  grupos, brunchs...  │
│                      │                      │
│                      │  • Detail bullet 1   │
│                      │  • Detail bullet 2   │
│                      │                      │
│                      │  CTA: Ordenar ahora→ │
└──────────────────────┴──────────────────────┘
```

**Layout**: 2-column split (image left, text right) with subtle detail bullets
**Image**: `/images/nappan/lunchbox.jpg` (left side, 280px width)
**Styling**: Cream background, warm brown border, slight accent color band at top
**Typography**: Warm, approachable heading, body text with bullet points for "why share"

**Details to include:**
- Visual hierarchy: "Groups" or quantity callout
- Small icons or bullets showing social benefits (easy to share, looks great together, perfect for 4-6 people)

**Why this works:**
- Side-by-side layout is familiar/comfortable
- Bullets help users understand when to order this
- Not oversized like Nappan Box (more accessible, relatable)
- Image on left draws eye naturally

**Breakpoints:**
- Mobile: Stack vertically (image full-width, text below)
- Tablet: Side-by-side as shown
- Desktop: Slightly larger, extra padding

---

### 3. Fit Bar — "Clean, Daily, Personal"

**Visual Vibe:** Fresh, energetic, minimal → "Treat yourself"

```
┌──────────────────────────────────────┐
│  ┌─ Badge: "PROTEÍNA"  ──────┐      │
│  │ [IMAGE: Small, square]      │      │
│  │ (200px, minimal framing)    │      │
│  │ Heading: "Fit Bar"          │      │
│  │ Copy: Pancakes proteicos... │      │
│  │                             │      │
│  │ • Protein-packed           │      │
│  │ • Clean ingredients        │      │
│  │ • No compromise            │      │
│  │                             │      │
│  │ CTA: Ordenar ahora →       │      │
│  └─────────────────────────────┘      │
└──────────────────────────────────────┘
```

**Layout**: Compact card (smaller than others, reflects "daily" not "special occasion") with image at top, text below
**Image**: `/images/nappan/protein-minipancakes.webp` (top, 200px height, square crop)
**Styling**: Minimal design, clean borders, light background, maybe slight green accent (wellness color)
**Typography**: Approachable, energetic heading; concise copy with wellness benefits

**Why this works:**
- Smallest layout signals "quick, easy, routine"
- Compact sizing makes it feel unpretentious
- Image size is still impactful but not commanding
- Benefits-focused copy (protein, clean, no compromise)

**Breakpoints:**
- All sizes: Consistent card size (doesn't expand as much on desktop)

---

### 4. Eventos — "Experience, Premium, Memorable"

**Visual Vibe:** Dynamic, celebratory, immersive → "Make it special"

```
┌──────────────────────────────────────┐
│ Background: Dark brown gradient       │
│                                      │
│  Badge: "LIVE PANCAKE ART" (gold)   │
│  Heading: "Catering con alma..."    │
│  Copy: (white/light text)            │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ • Eventos Corporativos         │ │
│  │ • Bodas & Brunch               │ │
│  │ • Cumpleaños Temáticos         │ │
│  │ • Activaciones de Marca        │ │
│  └────────────────────────────────┘ │
│                                      │
│  CTA: Solicitar presupuesto... →   │
│                              [Image]│
└──────────────────────────────────────┘
```

**Layout**: Full-width banner with dark background, left text + right image (follows EventPromo pattern)
**Image**: `/images/nappan/stand.webp` (right side, tall image showing the stand/experience)
**Styling**: Dark brown gradient background (#2A1710 → #5B3924), gold accents, white text
**Typography**: Large italic heading, light text, gold badge

**Why this works:**
- Dark background stands out from light cards above it → visual break
- Creates "premium" feeling (dark = luxury/premium)
- Image on right shows the actual experience/stand setup
- Category tags help B2B/event planners understand scope
- Different design language signals this is a different offering (B2B vs. B2C)

**Breakpoints:**
- Mobile: Stack vertically, dark bg spans full-width
- Tablet+: Side-by-side with dark gradient extending to image

---

## Image Strategy & Sizing

### Current vs. Proposed

| Section | Current | Proposed | Rationale |
|---------|---------|----------|-----------|
| Nappan Box | 160px | 320px+ (tall hero) | Showcase artistry, premium feel |
| Lunch Box | 160px | 280px (left column) | Approachable, inviting, part of composition |
| Fit Bar | 160px | 200px (compact) | Reflects "daily," doesn't overshadow |
| Eventos | (separate section) | 360px+ (right column) | Bold, experience-focused |

### Image Selection

- **Nappan Box**: `gallery-1.jpg` (personalized retrait, shows customization)
- **Lunch Box**: `lunchbox.jpg` (abundance, sharing, group-focused)
- **Fit Bar**: `protein-minipancakes.webp` (clean, minimal presentation)
- **Eventos**: `stand.webp` (shows actual experience/setup)

---

## Visual Coherence & "Family Feeling"

Despite different layouts, all sections stay cohesive through:

1. **Consistent Typography**: Cormorant italic for all headings, DM Sans for all body
2. **Unified Color Palette**: Warm browns (#2A1710, #765E4B), creams (#FFF8EA), gold accents (#D89B2B)
3. **Rounded Corners**: 16px border radius on cards, maintaining brand
4. **Spacing**: Consistent padding/margins (20px, 16px, 8px units)
5. **Border & Shadow**: Subtle borders (1px, rgba(88,55,34,0.13)) and consistent shadows

**The "cozy/fun" feeling comes from:**
- Warm color palette (no harsh blacks/whites)
- Generous whitespace (breathing room, not cramped)
- Image variety (different crops, orientations, mood)
- Layout rhythm (variety → not boring, but structured → not chaotic)
- Gold accents (cheerful, celebratory, inviting)

---

## Spacing & Grid Breakpoints

### Desktop (1024px+)
```
[Featured Nappan Box]                    (full-width, 320px image height)

[Lunch Box (left) | Fit Bar (right)]     (2-column grid)

[Eventos Dark Banner (full-width)]       (dark background, 360px image height)
```

### Tablet (768px - 1023px)
```
[Featured Nappan Box]                    (full-width, 280px image height)

[Lunch Box (left) | Fit Bar (right)]     (2-column grid, slightly smaller)

[Eventos Dark Banner]                    (responsive, images scale)
```

### Mobile (< 768px)
```
[Featured Nappan Box]                    (full-width stack, image responsive)

[Lunch Box]                              (full-width)
[Fit Bar]                                (full-width)

[Eventos Dark Banner]                    (full-width stack, image responsive)
```

---

## Component Changes Needed

### New Components
- `FeaturedProductBox` — Full-width hero with large image + overlay text (for Nappan Box)
- `TwoColumnProductSection` — Side-by-side layout with image left (for Lunch Box)
- `CompactProductCard` — Smaller card for daily offerings (for Fit Bar)
- (Eventos already has `EventPromo` component, may need slight refinement)

### Modified Components
- `ProductGrid` → New layout logic that alternates between different component types
- `ProductCard` → Remove (not used anymore) or repurpose for other pages

---

## "Stay Here" Vibe: How This Achieves It

1. **Visual Hierarchy**: Each section looks intentionally different → invites exploration
2. **Larger Images**: Product photography is more immersive, emotional
3. **Storytelling**: Layout + copy guide user through occasions (gift → social → daily → experience)
4. **Warmth**: Cozy colors + generous spacing + no harsh elements
5. **Diversity**: Different heights, widths, backgrounds → keeps design alive, not repetitive
6. **Gold Accents**: Celebratory touches (badges, CTAs) make user feel special

---

## Open Questions for Review

- [ ] Should Nappan Box be at the top, or should section order shift based on season (gifting prominent during holidays)?
- [ ] Do we want subtle animations (scroll-triggered reveals) for each section to enhance "discoverable" feeling?
- [ ] Should Fit Bar have a secondary color accent (e.g., soft green) to visually distinguish "wellness"?
- [ ] For mobile, should we use vertical scroll or cards? (Current proposal: vertical scroll, stacked sections)
- [ ] Should there be a "See all in category" link that groups these by use case?

---

## Next Steps

1. **Visual Mockup**: Create high-fidelity mockup in Figma or browser prototype showing all breakpoints
2. **Review & Approval**: Confirm layout choices, color accents, image selections
3. **API Contracts**: Update `docs/API_CONTRACTS.md` if new endpoints needed for product data
4. **Implementation**: Create new React components and update ProductGrid logic
5. **Testing**: Verify responsive behavior on mobile, tablet, desktop
6. **User Feedback**: A/B test if possible to confirm "stay here" feeling improves engagement

---

## Reference

- Design System: `docs/DESIGN_HARMONY_PLAN.md`
- Available Images: `/public/images/nappan/`
- Current Implementation: `src/features/home/components/ProductGrid.tsx`, `ProductCard.tsx`
- Existing Layout Reference: `src/features/home/components/EventPromo.tsx` (dark section pattern)
