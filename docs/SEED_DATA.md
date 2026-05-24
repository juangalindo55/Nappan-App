# Nappan MVP Seed Data

## Purpose

Provide a practical baseline for local development and QA.

## Recommended Seed Records

### Products

- `Lunch Box`
- `Fit Bar`
- `Artistic Box`
- `Seasonal Box`

Each product should have:

- stable ID
- category
- price
- active flag
- sort order

### Customers

- one customer with `membership_tier = business`
- one customer with `membership_tier = premium`
- one customer with no membership tier

Each customer should have:

- name
- phone
- normalized phone variant for testing

### App Config

Recommended keys:

- `tier_business_discount`
- `tier_premium_discount`
- shipping tier values for the quote calculator

## QA Scenarios

- customer exists and gets a discount
- customer exists but has no tier
- customer does not exist
- shipping quote succeeds
- shipping quote fails due to invalid postal code

