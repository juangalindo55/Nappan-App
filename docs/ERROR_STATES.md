# Nappan MVP Error States

## Purpose

Define the expected user experience when the app cannot complete an operation.

## Standard Error Patterns

- Use a short human-readable message.
- Avoid raw stack traces.
- Show a retry path when the action can be retried.
- Preserve the user’s current input when possible.

## Required States

### Empty state

Use when there is no data to show.

Examples:

- no products available
- no customer found
- no cart items yet

### Loading state

Use while waiting for data.

Examples:

- initial catalog load
- customer lookup
- shipping quote request

### Validation error

Use when the user input is malformed.

Examples:

- invalid phone number
- invalid postal code
- missing required booking field

### Service failure

Use when an external service or database call fails.

Examples:

- Supabase unavailable
- shipping API unavailable
- config lookup fails

## UI Rules

- Do not hide the failure state behind a spinner forever.
- Do not clear user input after a recoverable failure.
- Do not claim success when the backend call failed.
- Do not expose internal error objects directly to the user.

