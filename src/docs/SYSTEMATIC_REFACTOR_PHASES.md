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
- Search input, source tabs, result sections, and highlight matching moved into focused components.
- Discover category filter, verse cards, and devotional panel moved into focused components.
- Review remaining top-level pages for inline components that should be extracted.

## Phase 3 — Library/Profile/Plans — Completed
- Split large dashboard pages into data hooks, presentational sections, and action components.
- Library header actions, tabs, empty states, and tag filters moved into focused components.
- Library data loading and mutations moved into `useLibraryData`.
- Plans progress and custom-plan mutations moved into `usePlansData`.
- Study Center tabs, depth selector, explain panel, and voice notes moved into focused components.
- Profile data loading/mutations moved into `useProfileData`; hero header and shared list items extracted.
- Prayer Journal prayer card extracted into a focused component.

## Phase 4 — Dashboard Pages — Completed
- Audio Dashboard split into `useAudioDashboard` hook plus overview, history, bookmarks, and settings tab components.
- Prayer Journal, Community Hub, and Notification Studio reviewed; cards/sections extracted where needed.

## Phase 5 — Final Hardening
- Accessibility pass, loading/error state consistency, and dead-code cleanup.
- All major route pages now delegate data loading to hooks and rendering to focused components.