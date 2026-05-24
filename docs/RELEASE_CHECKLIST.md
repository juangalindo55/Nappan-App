# Nappan MVP Release Checklist

## Before Merge

- Confirm the scope matches the MVP and no extra features slipped in.
- Confirm the data model and env vars are still accurate.
- Confirm new UI states have loading, empty, and failure handling.
- Confirm shared state changes still persist correctly.
- Confirm no secret values were added to the client bundle.

## Before Deploy

- Run lint.
- Run the production build.
- Verify the required env vars in the target environment.
- Confirm Supabase schema changes are deployed first if the code depends on them.
- Confirm the shipping API key and origin postal code are configured.

## After Deploy

- Open the app and verify the main catalog page loads.
- Add an item to cart and refresh.
- Run profile lookup.
- Run shipping quote.
- Verify the booking draft still persists.

## Rollback Criteria

Rollback if:

- checkout or cart state is broken
- profile lookup fails for known-good records
- the shipping quote endpoint returns systemic failures
- the production build succeeds but the app crashes at runtime

