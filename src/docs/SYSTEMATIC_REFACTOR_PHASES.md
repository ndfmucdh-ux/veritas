# Systematic Refactor Phases

## Goal
Move the whole app toward cleaner architecture without changing user-facing behavior.

## Phase 1 — App Shell + Home — Completed
- Extract shared user display/session logic into `useCurrentUserDisplay`.
- Move Home inline UI sections into focused components.
- Move AppLayout header controls into focused layout components.

## Phase 2 — Navigation + Route Surfaces — In Progress
- Centralize navigation item definitions in `lib/navigationItems.jsx`.
- Extract side and bottom nav item rendering into focused components.
- Review top-level pages for inline components that should be extracted.

## Phase 3 — Library/Profile/Plans
- Split large dashboard pages into data hooks, presentational sections, and action components.

## Phase 4 — Backend/Data Boundaries
- Review backend functions for duplication, security checks, and entity access consistency.

## Phase 5 — Final Hardening
- Accessibility pass, loading/error state consistency, and dead-code cleanup.