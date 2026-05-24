# App Context — Nappan

## What this app is

Nappan is an ordering and experience platform for:

- Artistic pancakes and food products
- Event-based experiences (live events, catering)
- Fitness / community integrations

## Current State

The rewrite is a production-ready Next.js application with:

- Real data layer backed by Supabase
- Centralized state management via Zustand (cart, user, booking, order flow)
- Clean architecture separating UI, hooks, services, and domain logic
- Customer profile lookup by phone with membership tier discounts
- Shipping quote via Google Maps APIs
- Persistent cart, user profile, and booking draft across navigation

## Architecture

See `ARCHITECTURE.md` for the full layer breakdown.

Data flows:

```
Supabase / external API → service layer → hook or store → component
```

State persists via Zustand with localStorage:

- `nappan-cart` — cart items, extras, pricing summary
- `nappan-user` — active customer profile
- `nappan-booking` — live-event inquiry draft
- `nappan-order-flow` — selected order category and type

## Core Flows

1. Browse products by category
2. Add items to cart with extras
3. Identify customer by phone (lookup or create)
4. Apply membership tier discount
5. Estimate shipping by postal code
6. Complete or save a live-event inquiry draft

## Success Criteria

The app is considered correct when:

- Product catalog renders from Supabase
- Cart persists across navigation and refresh
- Customer lookup works from phone input
- Discount logic matches `app_config` values
- Shipping quote returns a bounded result or a clear failure state
- Booking draft survives navigation and refresh
