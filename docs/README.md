# Nappan Docs Index (Planning Room)

This folder is the working reference set for the rewrite MVP. It is part of Layer 2 (The Planning Room) of the Folder-as-Workspace architecture. See `claude.md` for global orientation and `routing.md` for this room's routing logic.

Use these files in this order when making changes:

1. `PRD.md`
2. `ARCHITECTURE.md`
3. `DATA_MODEL.md`
4. `API_CONTRACTS.md`
5. `ENV_VARS.md`
6. `TEST_PLAN.md`
7. `ERROR_STATES.md`
8. `SECURITY.md`
9. `MIGRATIONS.md`
10. `DECISIONS.md`
11. `SEED_DATA.md`
12. `RELEASE_CHECKLIST.md`
13. `APP_CONTEXT.md`
14. `DESIGN_HARMONY_PLAN.md`

## How to use this set

- Start with `PRD.md` to confirm the MVP scope.
- Use `ARCHITECTURE.md` to keep the layer boundaries intact.
- Use `DATA_MODEL.md` and `API_CONTRACTS.md` before changing Supabase or server contracts.
- Use `ENV_VARS.md` before touching deployment or environment configuration.
- Use `TEST_PLAN.md` and `RELEASE_CHECKLIST.md` before merging or shipping.
- Use `ERROR_STATES.md` and `SECURITY.md` to keep the app safe and predictable.
- Use `DECISIONS.md` for architecture decisions that should not be re-litigated.
- Use `SEED_DATA.md` to keep local development and QA reproducible.
- Use `MIGRATIONS.md` whenever the schema changes.

## Rule of thumb

If a change affects scope, data shape, flow, or deployment, update the relevant document before or alongside the code change.

## Quick Reference Matrix

| File | Purpose | When to Read | Dependencies |
|------|---------|--------------|--------------|
| PRD.md | MVP scope & user stories | Before any feature work | — |
| ARCHITECTURE.md | System layers & boundaries | Before coding any feature | PRD.md |
| DATA_MODEL.md | Database schema & types | Before touching queries/migrations | ARCHITECTURE.md |
| API_CONTRACTS.md | Server endpoint signatures | Before client/server work | DATA_MODEL.md |
| ENV_VARS.md | Configuration & secrets | Before deployment or env changes | — |
| TEST_PLAN.md | Test coverage & QA gates | Before code review | PRD.md |
| ERROR_STATES.md | Error codes & handling | When designing error flows | ARCHITECTURE.md |
| SECURITY.md | Auth, permissions, secrets | When touching auth or sensitive data | ARCHITECTURE.md |
| MIGRATIONS.md | Schema change history | When modifying database | DATA_MODEL.md |
| DECISIONS.md | Architecture decisions (immutable) | When re-evaluating prior choices | All docs |
| SEED_DATA.md | Local dev fixtures | Before running local tests | DATA_MODEL.md |
| RELEASE_CHECKLIST.md | Pre-ship validation | Before merging to main | TEST_PLAN.md |
| APP_CONTEXT.md | Current project state | Onboarding or context gaps | PRD.md |
| DESIGN_HARMONY_PLAN.md | Visual/UX direction | Before UI/component work | — |

