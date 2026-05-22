# Rewrite Home Polishing Plan with Stitch Skills

> **For Hermes:** Use this plan only after user approval. Stay in the rewrite worktree and do not touch production.

**Goal:** Use the newly installed Stitch skills to refine item 1 (home page polish) in the rewrite app, then validate the result visually and with lint before the user reviews it.

**Architecture:** Start by turning the current home-page feedback into a sharper design brief, then use Stitch-oriented skills to define the visual direction and the design system language. Apply the resulting UI changes only inside the rewrite worktree, keeping the implementation focused on the home route and its immediate components. Finish with lint + browser review so the user can judge the updated home page directly.

**Tech Stack:** Next.js App Router, React, Tailwind, existing home feature components, Stitch skills, local dev server, ESLint, browser visual review.

---

## Skills I will use

Primary skills:
- `stitch-design` — turn the home-page feedback into a Stitch-ready design direction and keep the visual outcome premium and intentional.
- `enhance-prompt` — rewrite the vague “make the home page feel better” feedback into a sharper prompt with clear hierarchy, spacing, contrast, and CTA guidance.
- `taste-design` — use its premium UI constraints to avoid generic layouts and keep the brand dark/gold aesthetic polished rather than heavy.
- `design-md` — document the intended design language and component behavior in a structured way so the implementation has a stable target.

Implementation/helpful skills:
- `react:components` — if any Stitch output needs to be translated into React component structure or validated against the current app’s component patterns.
- `shadcn-ui` — only if a new UI primitive or interaction pattern is needed and it fits the existing stack cleanly.
- `stitch-loop` — only if we decide to generate a broader multi-screen polish pass; not needed for a home-only refinement.

---

## Plan

### 1) Reframe the home-page brief into a design target
**Objective:** Convert the current feedback into a precise visual direction before making more code changes.

**Steps:**
1. Take the existing home-page concerns: crowded lower sections, low contrast, heavy card stacking, and unclear hierarchy.
2. Use `enhance-prompt` to turn that into a concise, Stitch-friendly prompt.
3. Use `stitch-design` to define the desired direction: stronger hierarchy, more breathing room, clearer CTA priority, and a lighter-feeling lower section.
4. Apply `taste-design` principles to keep the look premium, calm, and brand-consistent.

**Output:** A clear design brief for the home page, not code yet.

---

### 2) Formalize the design language for the home screen
**Objective:** Make the intended visual system explicit so implementation stays consistent.

**Steps:**
1. Use `design-md` to capture the home-page design language in a structured document.
2. Document the treatment for:
   - top bar
   - greeting/hero
   - featured card
   - section headers
   - product grid
   - promo card
   - spacing and contrast rules
3. Keep the document narrow: only what the home screen needs right now.

**Expected files:**
- `.hermes/plans/...` for the plan itself
- A design reference file only if it is actually useful for implementation, otherwise keep it in planning notes

---

### 3) Apply the home-page polish only in the rewrite worktree
**Objective:** Implement the visual improvements without widening scope.

**Steps:**
1. Review the home feature components that control the visible structure.
2. Update the existing home components to match the design target.
3. Prefer small, targeted component edits over broad rewrites.
4. Keep the app’s current navigation and commerce flow intact.

**Likely files:**
- `src/features/home/HomeScreen.tsx`
- `src/features/home/components/HomeTopBar.tsx`
- `src/features/home/components/HomeGreeting.tsx`
- `src/features/home/components/HomeSectionHeader.tsx`
- `src/features/home/components/FeaturedProductCard.tsx`
- `src/features/home/components/ProductGrid.tsx`
- `src/features/home/components/EventPromo.tsx`

**Optional files if needed:**
- `src/features/home/components/ProductCard.tsx`
- `src/components/Footer.tsx`

---

### 4) Use React/component translation only if a Stitch concept needs it
**Objective:** Keep the implementation faithful if Stitch suggests a component pattern that improves the layout.

**Steps:**
1. If a Stitch concept produces a cleaner component structure, use `react:components` to translate it into React/Tailwind-friendly pieces.
2. Keep generated structure aligned with existing app conventions.
3. Avoid introducing a new design system unless the current one is clearly insufficient.

**When to use:**
- only if a visual improvement requires new component structure or a reusable UI primitive

**When not to use:**
- if the change is just spacing, typography, contrast, or hierarchy tweaks

---

### 5) Validate the result before the user reviews it
**Objective:** Confirm the home page is actually better, not just technically different.

**Steps:**
1. Run targeted ESLint on the modified home files.
2. Open the rewrite app locally and review the home page visually.
3. Check the hero, card hierarchy, lower-section contrast, and CTA emphasis.
4. If the page still feels heavy, refine only the home components.

**Validation commands:**
- `npx eslint src/features/home/components/HomeTopBar.tsx src/features/home/components/HomeGreeting.tsx src/features/home/components/HomeSectionHeader.tsx src/features/home/components/FeaturedProductCard.tsx src/features/home/components/ProductGrid.tsx src/features/home/components/EventPromo.tsx src/features/home/HomeScreen.tsx`
- local browser review on the rewrite dev server

---

## Risks / tradeoffs

- Stitch-oriented skills can bias toward polished mockup thinking; the implementation still has to fit the existing codebase.
- `shadcn-ui` is optional and should not be introduced unless it clearly improves the home UI.
- `stitch-loop` is more powerful than needed for a single-screen polish pass, so I would avoid it unless the scope expands.
- The main risk is over-designing the home page; the goal is calmer and clearer, not busier.

---

## What I need from you

If you approve this plan, I’ll continue in the rewrite worktree only and implement the home polish using the skills above, starting with the design brief phase and then applying the resulting UI changes.

If you want, I can also narrow this to a smaller skill set before implementation:
- minimal: `enhance-prompt`, `stitch-design`, `taste-design`
- broader: add `design-md` and `react:components`
- widest: include `shadcn-ui` only if needed
