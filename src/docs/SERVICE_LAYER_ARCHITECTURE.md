# Service Layer Architecture

A clean-architecture pass that strengthens the data/service layer, decouples
components from the database SDK, and adds performance fields — **without
changing behavior or breaking any import paths** (conservative refactor).

## Layers

```
UI (pages/ + components/)        ← rendering only, no DB knowledge
        │  imports hooks / services
        ▼
Hooks (hooks/)                   ← stateful glue (useLibraryData, usePlansData…)
        │  imports services
        ▼
Services (lib/services/)         ← domain logic, the ONLY layer touching base44.entities
        │
        ├─ libraryService.js          ← bookmarks / highlights / notes (UserVerseInteraction)
        ├─ readingService.js          ← reading sessions, history, activity (ReadingSession)
        ├─ plansService.js            ← preset + custom plan progress (ReadingProgress/CustomPlan)
        └─ audioReflectionService.js  ← per-verse voice reflections (VerseAudioReflection)
        │  imports key helpers
        ▼
Domain helpers (lib/verseKeys.js)  ← canonical keys + book ordering
        ▼
Persistence (entities/ via @/api/base44Client)
```

## Key decisions

- **Separation of concerns** — `lib/dataAccess.js` was a flat grab-bag mixing
  library, reading, plan, and stats logic. It is now split into three focused,
  single-responsibility domain services.
- **Backwards compatibility** — `lib/dataAccess.js` is now a thin **re-export
  barrel**. Every existing `@/lib/dataAccess` import keeps working unchanged.
  New code should import the specific service (e.g. `@/lib/services/plansService`).
- **Reduced coupling** — components no longer call `base44.entities.*` directly
  for these domains. Decoupled consumers:
  - `StudyProgressMap` → `loadPlanDashboard()`
  - `usePlansData` → `plansService` (preset progress reads + writes, custom-plan writes)
  - `VerseRow`, `VerseSidePanel`, `AudioReflectionRecorder`, `AudioReflectionPlayback`
    → `audioReflectionService` (the `VerseAudioReflection` shape now lives in one place)
  - `usePlansData.toggleCustomChapter` now also maintains the denormalized
    `completed_count` on `CustomPlan`.

  File uploads (`Core.UploadFile`) and AI calls (`functions.invoke`) intentionally
  remain inline — they are integrations, not database domains.

## Production-readiness sweep

- **Bounded queries** — every service read is sorted + capped. The previously
  unbounded plan-session filters (`listPlanSessions`, `listPlanProgress`) and the
  legacy chapter-annotation fallback are now limited (500 / 200 rows).
- **Notes archive** — `NotesArchive` reads through new
  `libraryService.listNotesArchive()` (consolidated `has_note` first, legacy
  `UserNote` fallback) instead of a legacy-only `base44.entities.UserNote.list`,
  so it now surfaces consolidated notes too.
- **Resilience** — async entity reads in `NotesArchive` and `AudioSummary` now
  `.catch()` so a failed fetch resolves the loading state instead of hanging.
- **Single source of consolidated-vs-legacy logic** — only the library/reading
  services know about the migration fallback shape.

## Database performance additions (additive only)

| Entity | New field | Why |
| --- | --- | --- |
| `ReadingSession` | `reading_day` (date) | Indexed YYYY-MM-DD for fast day-range / streak queries without parsing `session_key`. |
| `CustomPlan` | `completed_count` (number) | Denormalized progress count — read plan progress without loading the full `completed_chapters` array. |
| `UserVerseInteraction` | `book_order`, `has_note` (pre-existing) | Indexed canonical ordering + fast noted-verse filtering. |

All additions are additive and default-valued, so existing records and the live
migration remain valid (zero-breakage rollout).