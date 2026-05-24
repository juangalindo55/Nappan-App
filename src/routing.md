# Routing Table: The Engineering Room

This room is dedicated to implementation and code execution. It is part of Layer 3 (The Workspace) of the Folder-as-Workspace architecture. See `claude.md` for global orientation and `docs/routing.md` for the Planning Room.

## Context Logic

### Always Read Before Coding
- `docs/ARCHITECTURE.md` — system layers, boundaries
- `docs/API_CONTRACTS.md` — server endpoint signatures
- `docs/DATA_MODEL.md` — schema, types, database structure
- `docs/ENV_VARS.md` — configuration, environment variables

### Read When Touching (Context-Specific)
| Change | Required Reading |
|--------|-----------------|
| Auth flows, login, sessions | `docs/SECURITY.md` |
| Database queries, schema | `docs/MIGRATIONS.md` |
| Error messages, error handling | `docs/ERROR_STATES.md` |
| Testing, code review | `docs/TEST_PLAN.md` |
| Deployment, releases | `docs/RELEASE_CHECKLIST.md` |
| UI/styling, components | `docs/DESIGN_HARMONY_PLAN.md` |

### Do NOT Load
- `docs/drafts/` — incomplete ideas; skip unless explicitly asking
- `Nappan/` — personal notes, not part of engineering scope
- Docs marked "TBD" or "IN_REVIEW" — wait for finalization

## Core Engineering Constraints (Global Rules)
- **TypeScript**: Strict mode only. The use of `any` is strictly forbidden. Define interfaces/types.
- **React/Next.js**: Use Server Components by default. Only use `'use client'` at the leaves of the component tree.
- **Styling**: Tailwind CSS exclusively (no `.css` modules unless required by 3rd party).
- **Data Fetching**: Use React Query/SWR instead of raw `useEffect`.
- **Forms**: Use `react-hook-form` + `zod` for all form handling and validation.
- **Testing (TDD)**: Write or update tests that reproduce failures before implementing fixes.

## Task Pipeline

1. **Scope Check**: Verify your change aligns with `docs/ARCHITECTURE.md`. If in doubt, re-read it.
2. **Contract Check**: Confirm API signatures and data shapes in `docs/API_CONTRACTS.md`.
3. **Implementation**: Write code in `src/`, following Core Engineering Constraints above.
4. **Schema Changes**: If modifying database, update `docs/MIGRATIONS.md` alongside code changes.
5. **Error Handling**: Test against error cases defined in `docs/ERROR_STATES.md`.
6. **Testing**: Verify against test plan in `docs/TEST_PLAN.md` before code review.
7. **Review Gate**: All changes must pass the `docs/RELEASE_CHECKLIST.md` before merge.

## Context Boundaries
- **Load**: src/*, docs/ARCHITECTURE.md, docs/API_CONTRACTS.md, docs/DATA_MODEL.md, docs/ENV_VARS.md + context-specific docs (see table above), memory/
- **Do NOT load**: docs/PRD.md, docs/DECISIONS.md (unless re-evaluating architecture), docs/drafts/, Nappan/
- **Rationale**: Focus on contracts and execution. PRD decisions are already codified in ARCHITECTURE.md and API_CONTRACTS.md; avoid re-litigating design choices during implementation.

## MCP Skills Integration
When in the Engineering Room, you are authorized to utilize the following MCP capabilities:
- **Design System Integration**: Use design tools to generate or update UI components and screens directly from design files.
- **Web App Testing**: Use the `chrome-devtools-mcp` tools to audit the app, take screenshots, run browser-based tests, or debug performance.

## Quick Checklist Before Submitting Code
- [ ] Read `docs/ARCHITECTURE.md` (did boundaries change?)
- [ ] Read `docs/API_CONTRACTS.md` (does my code match the contract?)
- [ ] Read `docs/DATA_MODEL.md` (is my data shape correct?)
- [ ] Run tests against `docs/TEST_PLAN.md` criteria
- [ ] Check error handling against `docs/ERROR_STATES.md`
- [ ] Update `docs/MIGRATIONS.md` if schema changed
- [ ] Review `docs/RELEASE_CHECKLIST.md` before merge
