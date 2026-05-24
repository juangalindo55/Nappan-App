# Nappan-App Workspace Map (Layer 1)

Welcome to the Nappan-App workspace. This project is a Next.js web application.

**This is the global entry point.** For room-specific routing, see:
- **Planning Room details** → `docs/README.md`
- **Engineering Room details** → `src/routing.md`

## Folder Architecture & Natural Language Routing

- **`docs/` (The Planning Room)**: Architecture, product specs, API contracts, and conceptual work. Start here for new features. See `docs/README.md` for routing details.
- **`src/` (The Engineering Room)**: Implementation and code execution. See `src/routing.md` for routing details.
- **`public/`**: Static assets.
- **`Nappan/`**: User's Obsidian vault (personal notes). Ignore for code execution unless explicitly asked.

## Naming Conventions for Output (Zero-Code Database)
When saving drafts or temporary work in `docs/drafts/`, use: `[Topic]-[Version]-[Status].md` (e.g., `auth-flow-v1-draft.md`).

## High-Level Pipeline
1. **Brief/Concept** in `docs/drafts/` (use naming convention above).
2. **Finalized Spec** in `docs/`.
3. **Execution** in `src/`.

## Context Hierarchy
- Start here (claude.md) for orientation
- Route to `docs/routing.md` when planning
- Route to `src/routing.md` when coding
