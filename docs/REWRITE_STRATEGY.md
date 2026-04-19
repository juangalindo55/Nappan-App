# 🔄 Rewrite Strategy — Nappan

## 🎯 Goal

Convert current UI-driven implementation into a **real scalable product architecture**

---

## 🔥 Current Reality

The app currently:
- Looks premium
- Is not structurally scalable
- Has logic inside UI
- Has no real data flow

---

## 🧠 Strategy Phases

### Phase 1 — Separation

- Move `products` out of components
- Create `/lib/products.ts`
- Introduce `useHomeData` hook

---

### Phase 2 — State Management

Introduce global state:

- cart
- user
- booking

👉 Recommended: Zustand

---

### Phase 3 — Data Layer

Create:

/lib/api/products.ts

- prepare for Supabase
- isolate data logic

---

### Phase 4 — UI Cleanup

Convert components into:

- presentational only
- no business logic
- no filtering logic

---

## ⚠️ Constraints

- Keep MVP simplicity
- Avoid overengineering
- Do not optimize prematurely

---

## 🧠 Challenge Mode

If current approach is flawed:
- challenge it
- propose better alternative
- justify clearly

---

## ❌ Anti-Goals

Avoid:

- rewriting UI only
- keeping bad architecture
- mixing logic + UI again

## 🧭 Execution Order (IMPORTANT)

Follow this order strictly:

1. Extract data from UI (products → /lib)
2. Create hooks for logic (useHomeData)
3. Introduce global state (cart, user)
4. Connect data layer (Supabase)
5. Clean UI components

Do NOT skip steps.

## 🚫 Do Not Do

- Do not refactor UI before extracting logic
- Do not introduce state before defining data flow
- Do not connect backend before architecture is clean

## 🔄 Data Flow (CRITICAL)

Data should flow like this:

API / Supabase → /lib/api → hooks → components

NOT:

Component → direct fetch → UI

---

State should flow like this:

Store → hooks → components

NOT:

Component → local state duplication

unless situation calls for it, justify first

