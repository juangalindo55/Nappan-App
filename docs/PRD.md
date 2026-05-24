# Nappan MVP Product Requirements

## Purpose

Define the minimum product scope for the Nappan rewrite so implementation stays focused, safe, and testable.

## Product Goal

Ship a small but real ordering and inquiry flow for Nappan that lets a customer:

- browse products
- filter by category
- add items to cart
- see pricing update correctly
- identify or create a customer profile by phone
- request or estimate shipping
- preserve in-progress state across navigation

## MVP Scope

### In scope

- Product catalog browsing
- Category filtering
- Product detail view
- Cart management
- Customer profile lookup by phone
- Membership tier discount application
- Shipping quote by postal code
- Live event inquiry draft persistence
- Basic error and empty states

### Out of scope

- Full payment processing unless explicitly added later
- Multi-vendor marketplace behavior
- Admin back office features beyond what the MVP needs
- Loyalty program redesign
- Complex promotions engine
- Native mobile app

## Primary User

The MVP is designed for a customer who wants to:

- explore Nappan products
- build a small order
- estimate delivery cost
- leave contact details
- continue the flow later without losing progress

## Success Criteria

The MVP is successful if:

- product data renders consistently from the intended data layer
- cart state survives page refresh and navigation
- customer lookup works from phone input
- discount logic is deterministic
- shipping quote returns a clear result or a clear failure state
- booking or inquiry draft state is not lost unexpectedly

## Product Rules

- The UI must not own business logic that belongs in domain or service layers.
- Client code must not trust browser input for authoritative pricing.
- State used across screens must be persisted in a shared store or session layer.
- Empty, invalid, and failed states must be explicit in the UI.

## Acceptance Criteria

- A new user can browse products and add at least one item to cart.
- A returning user with a stored phone number can be identified.
- Discounts tied to membership tier can be applied without manual intervention.
- Shipping quote inputs produce a bounded success or failure result.
- Reloading the app does not discard cart or draft inquiry state.

