# Nappan MVP Security Notes

## Purpose

Capture the minimum security posture required for the rewrite.

## Trust Boundaries

- Do not trust browser-supplied pricing as authoritative.
- Do not trust client-side profile claims as the only source of truth.
- Do not expose service-role credentials to the browser.
- Do not assume a UI-only check is an authorization check.

## Data Sensitivity

Treat as sensitive:

- customer phone numbers
- customer profiles
- shipping-related inputs
- any future payment or order data

## Required Practices

- Validate inputs before calling external services.
- Keep secrets in server or deployment environment variables only.
- Use the least-privilege key possible on the client.
- Keep server-side writes behind controlled routes or services.
- Prefer explicit allowlists for supported values such as categories, tiers, and quote inputs.

## Operational Safety

- Log enough to debug failures without leaking secrets.
- Return safe error messages to the browser.
- Recheck RLS and access policies whenever a new table is added.

