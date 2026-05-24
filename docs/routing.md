# Routing Table: The Planning Room

This room is dedicated to architecture, feature specifications, and documentation.

## Context Logic
- **Read**: `APP_CONTEXT.md`, `ARCHITECTURE.md` to understand system rules.
- **Skip**: Execution code inside `src/`. Do not burn tokens loading React components while in the Planning Room.

## Task Pipeline
Follow this sequence for new features:
1. **Drafting**: Write initial specs in `docs/drafts/` using the `[Topic]-[Version]-[Status].md` naming convention.
2. **Review**: Seek approval on the draft.
3. **API Contract**: Create `API_CONTRACTS.md` definitions before coding.
4. **Handoff**: Only proceed to `src/` once the spec is finalized.

## Context Boundaries
- **Load**: docs/*, memory/*, drafts/
- **Do NOT load**: src/components/, src/hooks/, src/lib/, Nappan/
- **Rationale**: Engineering code is execution layer; the Planning Room designs contracts, not implementations.
