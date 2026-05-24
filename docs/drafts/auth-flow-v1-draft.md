---
status: draft
version: 1
topic: auth-flow
created: 2026-05-24
---

# Authentication Flow — V1 Draft

## Scope
New user signup, login, and session management for Nappan MVP.

## Flow Overview

### Registration
1. User navigates to `/signup`
2. User submits email and password
3. Backend validates email format and password strength
4. Backend creates user in `users` table
5. Session token is generated and returned
6. Client stores token (localStorage or secure cookie)
7. User is redirected to dashboard

### Login
1. User navigates to `/login`
2. User submits email and password
3. Backend queries user by email
4. Backend verifies password hash
5. If valid: generate session token, return to client
6. If invalid: return 401 with error message
7. Client stores token and redirects to dashboard

### Protected Routes
1. Client includes token in Authorization header for API calls
2. Middleware verifies token on each request
3. If valid: proceed to route handler
4. If invalid/expired: return 401, client redirects to login

## Open Questions
- [ ] Should we use JWT or session cookies?
- [ ] How long should tokens live (expiration)?
- [ ] Do we need refresh token rotation?
- [ ] Should password reset be MVP or v2?
- [ ] Should email verification be required?

## Data Model (Preliminary)

```typescript
// users table
{
  id: UUID (primary key)
  email: string (unique, not null)
  password_hash: string (not null)
  created_at: timestamp
  updated_at: timestamp
}

// sessions table (if using session-based auth)
{
  id: UUID (primary key)
  user_id: UUID (foreign key to users)
  token: string (unique, not null)
  expires_at: timestamp
  created_at: timestamp
}
```

## Acceptance Criteria
- [ ] Auth page renders without errors
- [ ] Users can sign up with valid email/password
- [ ] Users can log in with valid credentials
- [ ] Invalid credentials return 401 error
- [ ] Session persists across page reload
- [ ] Invalid/expired tokens are rejected
- [ ] Protected routes redirect unauthenticated users to login
- [ ] Error messages are user-friendly and match `docs/ERROR_STATES.md`

## Next Steps
1. Get approval on this draft
2. Create `docs/SECURITY.md` section documenting auth architecture
3. Design token refresh strategy (if needed)
4. Create `docs/API_CONTRACTS.md` entries for `/auth/signup`, `/auth/login`, `/auth/verify`
5. Define error codes in `docs/ERROR_STATES.md`
6. Add test cases to `docs/TEST_PLAN.md`
7. Proceed to implementation in `src/`

## Dependencies
- See `docs/DATA_MODEL.md` for schema context
- See `docs/ARCHITECTURE.md` for system boundaries
- See `docs/API_CONTRACTS.md` (will create after approval)
- See `docs/SECURITY.md` (will create after approval)
