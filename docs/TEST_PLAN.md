# Nappan MVP Test Plan

## Purpose

Define the smoke tests that prove the MVP is safe enough to move forward.

## Core Smoke Tests

### Product browsing

- Open the home/catalog page.
- Confirm products render.
- Confirm inactive products do not appear.
- Confirm category filtering changes the visible list.

### Cart flow

- Add a product to cart.
- Increase and decrease quantity.
- Remove an item.
- Reload the page.
- Confirm the cart still exists after refresh.

### Profile flow

- Enter a phone number.
- Confirm lookup returns a customer when one exists.
- Confirm the active profile is stored and reused.
- Confirm missing customer data shows a safe empty state.

### Discount flow

- Load a profile with a known membership tier.
- Confirm the discount percent matches `app_config`.
- Confirm the cart total updates accordingly.

### Shipping quote

- Enter a valid postal code.
- Confirm a quote returns a distance and price.
- Enter an invalid postal code.
- Confirm the UI shows a controlled failure state.

### Booking draft

- Enter live-event draft details.
- Navigate away and back.
- Confirm the draft is preserved.
- Reset the draft and confirm the fields clear.

## Safety Checks

- No screen should crash on missing data.
- No screen should show raw API errors to the user.
- No pricing should be calculated only from uncontrolled client input.
- No shared state should disappear on normal navigation.

## Pre-merge Checklist

- `npm run lint`
- `npm run build`
- Manual smoke test of cart persistence
- Manual smoke test of profile lookup
- Manual smoke test of shipping quote

