# Nappan MVP Architecture

## System Overview

The rewrite should use a layered structure:

- UI components render state and dispatch actions
- hooks coordinate screen-level logic
- stores hold shared application state
- services handle data access and integrations
- domain modules hold business rules and pure calculations

## Recommended Flow

```text
Supabase / external API -> service layer -> hook or store -> component
```

Do not move data directly from component to network call unless the data is strictly local UI state.

## Main Layers

### `src/app`

- Route entry points
- Page composition
- API routes when the app exposes server endpoints

### `src/features`

- Screen-specific logic and UI
- Feature hooks
- Feature-local stores when needed

### `src/domain`

- Pricing rules
- Validation
- Cart calculations
- Other pure functions with no framework dependency

### `src/services`

- Supabase calls
- Customer lookup/create logic
- Shipping quote integration
- Configuration reads

### `src/store`

- Cross-screen state
- Cart
- User profile
- Booking drafts
- Order flow state

### `src/lib`

- Shared utilities
- Session helpers
- Parsing and normalization helpers

## Architecture Rules

- Keep UI components presentational when possible.
- Keep pricing and validation in domain code, not in the page component.
- Keep Supabase and third-party API calls in service modules.
- Keep shared state in stores, not duplicated across screens.
- Keep route handlers thin and defer logic to services or domain helpers.

## Data Ownership

- Product catalog data is owned by the product service and its backing data source.
- Cart totals are owned by cart domain calculations.
- Customer profile context is owned by the user store.
- Booking draft state is owned by the booking store.
- Shipping quote results are owned by the shipping service and API route.

## Boundary Rules

- Components may read state and dispatch actions.
- Components may not hardcode pricing rules that already exist in domain code.
- Services may call APIs and normalize responses.
- Services should not render UI or store React state.
- Domain helpers should remain pure and deterministic.

