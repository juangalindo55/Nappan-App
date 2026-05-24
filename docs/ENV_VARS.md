# Nappan MVP Environment Variables

## Purpose

Document every required environment variable and what depends on it.

## Required Variables

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Used by:

- client-side Supabase access
- customer lookup
- app config reads

### Shipping

- `SHIPPING_ORIGIN_POSTAL_CODE`
- `GOOGLE_MAPS_API_KEY`

Used by:

- shipping quote endpoint
- geocoding
- distance calculation

## Optional Variables

- `NEXT_PUBLIC_CUSTOMER_TABLES`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Environment Rules

- Local development should use a committed `.env.local` template with blank values, not hardcoded secrets.
- Production and preview environments must be configured separately in the deployment platform.
- Missing required variables should fail fast with a clear message.
- Client-exposed variables must be prefixed with `NEXT_PUBLIC_`.

## Safety Notes

- Never store service-role credentials in client-exposed variables.
- Never assume a missing env var is safe to ignore if the feature depends on it.
- If a feature is optional, the UI should degrade cleanly rather than crash.

