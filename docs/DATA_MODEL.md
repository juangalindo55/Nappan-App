# Nappan MVP Data Model

## Purpose

Document the minimum data model needed for the rewrite so schema assumptions stay explicit.

## Core Entities

### Product

Represents an item that can be browsed and added to cart.

Expected fields:

- `id`
- `name`
- `slug`
- `category`
- `description`
- `price`
- `active`
- `image_url`
- `sort_order`

### Customer

Represents a customer profile identified primarily by phone.

Expected fields:

- `id`
- `name`
- `phone`
- `membership_tier`
- `created_at`
- `updated_at`

### App Config

Represents runtime configuration stored in the database.

Expected fields:

- `key`
- `value`
- `updated_at`

Examples:

- `tier_business_discount`
- `tier_premium_discount`
- `shipping_tier_0_km`
- `shipping_tier_1_price`

### Cart Item

Represents an item in the user’s cart state.

Expected fields:

- `id`
- `productId`
- `name`
- `quantity`
- `unitPrice`
- `extras`
- `notes`

### User Profile

Represents the currently active customer context in the app.

Expected fields:

- `name`
- `phone`
- `tierName`
- `tierSlug`
- `discountPercent`

### Live Event Draft

Represents the in-progress inquiry form.

Expected fields:

- `name`
- `phone`
- `guestCount`
- `eventDate`

## Data Rules

- `phone` should be normalized before lookup.
- `membership_tier` should be treated as nullable and optional.
- App config values used for money or discounts should be parsed explicitly.
- Cart pricing should not depend on raw client-controlled values alone.
- IDs used in the UI should not be assumed to be sequential.

## Source of Truth

- Product catalog values come from the product service.
- Customer records come from Supabase or the configured customer source.
- Discount percentages come from `app_config`.
- Cart state comes from the Zustand cart store.
- Draft inquiry state comes from the booking store.

