# Veritas — Database Architecture (Optimized, Additive)

> Senior-architect reference for the Veritas Bible app data layer.
> **Guiding constraint: ADDITIVE & ZERO-BREAKAGE.** No live entity or field is
> removed or renamed. Legacy entities remain as read-backups until a migration is
> verified in production. New code reads from the *consolidated* source of truth
> with a legacy fallback.

---

## 1. Domain Model — Three Data Planes

The app's data splits cleanly into three planes. Keeping them separate is the
single most important architectural decision: canonical scripture is huge,
shared, and read-only; user data is small, private, and write-heavy; reference
data is curated and rarely changes.

| Plane | Purpose | Volume | Access | Owner |
|-------|---------|--------|--------|-------|
| **Canonical Scripture** | Bible text + cache | Very large | Read-mostly, shared | Admin/system |
| **User Interaction** | Highlights, bookmarks, notes, progress, prayers, XP | Small per user | Read/write, private (RLS) | Per user |
| **Reference / Content** | Plans, devotionals, prayer wall, community | Medium | Read-mostly | Admin + community |

---

## 2. ERD (text)

```
                          ┌────────────────────────┐
                          │   BibleTranslation     │  (code PK-like)
                          │  code, language, source│
                          └───────────┬────────────┘
                                      │ 1
                                      │  translation
                                      │ N
                          ┌───────────▼────────────┐
                          │   BibleChapterCache    │  canonical scripture
                          │  translation, book,    │  (chapter-level payload)
                          │  book_order, chapter   │
                          └────────────────────────┘
                                      ▲ logical ref (verse_key)
                                      │
   ┌──────────────┐        ┌──────────┴───────────────┐        ┌──────────────┐
   │     User     │ 1    N │  UserVerseInteraction    │        │ ReadingSession│
   │ (built-in)   │────────┤  verse_key (canonical)   │        │ session_key   │
   │ email, role  │        │  is_bookmarked,          │  1   N │ book_order    │
   └──────┬───────┘        │  highlight_color,        │◄───────┤ created_by    │
          │                │  note_text, has_note,    │  user  └──────────────┘
          │ 1              │  tags, book_order        │
          │                └──────────────────────────┘
          │ N              ▲ CONSOLIDATES (additive)
          │      ┌─────────┴─────────┬──────────────┐
          │      │                   │              │
          │  ┌───┴────┐        ┌─────┴────┐   ┌─────┴─────┐   (LEGACY — kept as backup)
          │  │Bookmark│        │UserHigh- │   │ UserNote  │
          │  │        │        │ light    │   │           │
          │  └────────┘        └──────────┘   └───────────┘
          │
          ├── CustomPlan / DevotionalPlan (reference)
          ├── PrayerJournal / PrayerReminder / PrayerWallPost
          ├── VeritasAIConversation / Flashcard / StudyNote / VerseFolder
          ├── UserXP / UserAchievement (derived/aggregate)
          └── ReadingProgress (LEGACY → consolidates into ReadingSession)
```

### Consolidation map (additive)

| Legacy entity | Consolidated target | Strategy |
|---------------|---------------------|----------|
| `Bookmark` | `UserVerseInteraction.is_bookmarked + tags` | Migrate, keep legacy as backup |
| `UserHighlight` | `UserVerseInteraction.highlight_color` | Migrate, keep legacy as backup |
| `UserNote` | `UserVerseInteraction.note_text + has_note` | Migrate, keep legacy as backup |
| `ReadingProgress` | `ReadingSession` (idempotent `session_key`) | Migrate, keep legacy as backup |

One verse → one `UserVerseInteraction` row holding *all* user interaction for
that verse. This removes 3-way fan-out reads on the Library page and makes
"everything I did on John 3:16" a single-row lookup.

---

## 3. Schema Design Principles

1. **Canonical keys for idempotency & dedup**
   - `UserVerseInteraction.verse_key = TRANSLATION|Book|Chapter|Verse`
   - `ReadingSession.session_key = user|date|translation|book|chapter`
   - `BibleChapterCache.checksum` for cache validation.
   Upserts key on these → no duplicates, safe re-runs.

2. **Denormalized sort/filter fields** (added, additive):
   - `book_order` (1-66) on interaction & session rows → indexed canonical
     ordering and range scans without client-side sorting of book *names*.
   - `has_note` flag → filter noted verses without scanning `note_text`.

3. **Chapter-level payloads, never whole-Bible rows.** `BibleChapterCache`
   stores one chapter per record. A full translation is ~1,189 small rows, not
   one giant blob (avoids the field-size limit and enables partial caching).

4. **Files by URL, never inline.** Audio reflections / verse images store
   `file_url`/`audio_url` only.

5. **RLS as the consistency boundary.** All per-user entities scope every
   operation to `created_by == {{user.email}}`. Canonical/reference entities are
   world-readable, admin-writable.

---

## 4. Indexing Strategy

Base44 indexes `id`, `created_date`, `updated_date`, `created_by_id`
automatically. The strategy is to make every hot query a **prefix match on a
field we control**:

| Query | Index field used | Pattern |
|-------|------------------|---------|
| Verse interaction lookup | `verse_key` | exact match (`filter({verse_key})`) |
| Chapter's interactions | `book_order` + `chapter` | range/equality, sorted |
| Reading session dedup | `session_key` | exact match |
| Library list | `-updated_date` | sorted, **paginated** |
| Cache hit | `translation`+`book`+`chapter` | composite equality |

**Rules enforced in code (see `lib/dataAccess.js`):**
- Always pass an explicit sort + limit to `.list()` — never unbounded.
- Prefer `.filter({canonicalKey})` over `.list()` + client filtering.
- Page with `skip`/`limit`; default page size 50.

---

## 5. Query Optimization

- **Single-source reads.** Library/Reader read `UserVerseInteraction` once
  instead of `Bookmark` + `UserHighlight` + `UserNote` (3 round-trips → 1).
- **Pagination everywhere.** No `.list()` without a limit. Hot lists cap at 50
  and paginate.
- **Upsert via canonical key.** Writes look up by `verse_key`/`session_key`
  then update-or-create — O(1), idempotent, dedup-safe.
- **React Query caching.** Client caches keyed reads; mutations do optimistic
  updates then invalidate.
- **Batch independent reads** with `Promise.all`.

---

## 6. Data Consistency

- **Idempotent canonical keys** prevent duplicate rows on retries/automations.
- **RLS** guarantees a user can only ever read/write their own interaction rows.
- **Server-authored aggregates.** `UserXP`, `ReadingSession`, achievements are
  written via backend functions (service role) after validating the caller, so
  totals can't be spoofed from the client.
- **Migration is idempotent.** Re-running `migrateUserDataArchitecture` /
  `migrateAllUsersDataArchitecture` updates existing keyed rows rather than
  duplicating.

---

## 7. Scalability Planning

- **Read scaling:** canonical scripture is cached per chapter and served from
  `BibleChapterCache`; offline cache warms the client. Scripture reads never hit
  user tables.
- **Write scaling:** user writes are tiny, single-row, key-addressed upserts.
- **Hot-set bounding:** interactions collapse to one row per verse, so a power
  user with 5k highlights+notes+bookmarks on overlapping verses stores far fewer
  rows than the legacy 3-table model.
- **Archival:** `archiveOldHighlights` + `DataMigrationRecord` give a path to
  cold-store stale data without deleting.

---

## 8. Migration Scripts (backend functions)

| Function | Scope | Idempotent | Notes |
|----------|-------|------------|-------|
| `migrateUserDataArchitecture` | current user | yes | dry-run supported |
| `migrateAllUsersDataArchitecture` | all users (admin) | yes | paginates users, per-user backfill, writes `DataMigrationRecord` |

Both **only write to the consolidated targets**; legacy rows are never deleted.

### Rollout

1. Deploy schema additions (`book_order`, `has_note`) — additive, no backfill needed.
2. Run `migrateUserDataArchitecture` (dry-run) → review counts.
3. Run for real per user (or `migrateAllUsersDataArchitecture` as admin).
4. New reads use `lib/dataAccess.js` (consolidated source, legacy fallback).
5. After a verification window, optionally retire legacy entities (separate, opt-in change — NOT done here).

---

## 9. Production-Ready Implementation (in this codebase)

- `lib/verseKeys.js` — canonical key + `book_order` helpers (shared FE/intent).
- `lib/dataAccess.js` — optimized, paginated, single-source data-access layer.
- `entities/UserVerseInteraction.json` — `book_order`, `has_note` added.
- `functions/migrateAllUsersDataArchitecture` — admin-wide idempotent backfill.
- `hooks/useLibraryData.js` — reads consolidated interactions, derives
  bookmarks/highlights/notes, with legacy fallback when migration hasn't run.