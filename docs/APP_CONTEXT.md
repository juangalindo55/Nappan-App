# 📱 App Context — Nappan

## What this app is

Nappan is an interactive product + experience platform:

- Artistic pancakes (products)
- Event-based experiences
- Fitness / community integrations

---

## Current State (IMPORTANT)

The current rewrite:
- Focuses heavily on UI/visual experience
- Uses hardcoded product data
- Has logic embedded in UI components
- Does not yet use backend (Supabase)

👉 It behaves like a **design prototype**, not a real system.

---

## Target State

The app should evolve into:

- Product browsing system
- Event booking platform
- Future commerce flow (cart + purchase)

---

## Core Flows (to be implemented)

1. Browse products
2. Filter by category
3. View product detail
4. Add to cart
5. Book event / request quote

---

## Current Problems

- No data layer
- No state architecture
- Logic tied to UI
- No real user flow persistence

---

## Rewrite Goal

Transform UI demo into:

- Scalable app
- Clean architecture
- Logic separated from UI
- Ready for backend integration

## 🧠 State Management Reality

The app currently has:

- No centralized state
- No persistence across screens
- No shared data (cart, user, booking)

👉 Each component manages its own local state only.

---

## ⚠️ Problem

This prevents the app from behaving like a real product:

- Cart cannot persist
- User context does not exist
- Booking flow cannot be maintained
- Data is lost between interactions

---

## 🎯 Requirement

The app must introduce:

- A single source of truth for shared state
- Persistent state across navigation
- Clear separation between UI state and app state

## ✅ Success Criteria

The app is considered correct when:

- Users can browse products with real data
- Cart persists across navigation
- User context exists globally
- Booking flow can be completed without losing state
- UI reflects real backend data

👉 If these are not met, the app is incomplete