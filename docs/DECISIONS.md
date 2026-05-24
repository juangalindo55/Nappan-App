# Nappan MVP Decisions

## Purpose

Record the small number of architecture decisions that should not be re-decided during the MVP.

## Decision Log

### 1. Use shared stores for cross-screen state

Decision:

- Use Zustand for cart, user, booking, and order-flow state.

Reason:

- It keeps screen logic simple and preserves state across navigation.

### 2. Keep pricing logic in domain code

Decision:

- Compute cart totals and discounts in domain modules, not in page components.

Reason:

- This makes pricing easier to test and harder to break during UI changes.

### 3. Keep service calls out of components

Decision:

- Put Supabase and API access in service modules.

Reason:

- This keeps the UI reusable and reduces the chance of duplicated fetch logic.

### 4. Treat phone as the customer lookup key

Decision:

- Use phone as the primary lookup path for customer identification.

Reason:

- It matches the current product flow and is the most practical MVP identifier.

### 5. Fail clearly on missing env vars

Decision:

- Features that require environment configuration should fail fast with a clear message.

Reason:

- Silent misconfiguration is more dangerous than an explicit setup failure.

## Future Decisions

Record later if needed:

- payment provider behavior
- admin workflow scope
- loyalty or rewards model
- marketing automation integrations

