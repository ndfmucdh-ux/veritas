# VERITAS Production Forensic Audit

## Business Architecture Summary
VERITAS is an offline-first Bible reading, study, prayer, and personal library app. The core data model is user-owned devotional data around scripture references: bookmarks, highlights, notes, reading progress, custom plans, prayer journal entries, audio reflections, collections, folders, XP, and notifications.

## ERD Structure

```text
User
 ├─ UserXP (1:1 logical)
 ├─ ReadingProgress (1:N)
 ├─ Bookmark (1:N)
 ├─ UserHighlight (1:N)
 ├─ UserNote (1:N)
 ├─ PrayerJournal (1:N)
 │   └─ PrayerReminder (1:N via prayer_journal_id)
 ├─ VerseAudioReflection (1:N)
 ├─ VerseCollection (1:N)
 ├─ VerseFolder (1:N)
 ├─ AudioPlaylist (1:N)
 ├─ CustomPlan (1:N)
 ├─ Flashcard (1:N)
 └─ PlanInvite / PlanProgressComment (collaboration layer)

Scripture Reference Pattern
 Bookmark/UserHighlight/UserNote/VerseAudioReflection/PrayerJournal
 └─ keyed logically by book + chapter + verse + translation + verse_ref
```

## Database Schema Strategy

### User-owned private entities
The following entities must be user-scoped with RLS:
- `UserNote`
- `PrayerJournal`
- `UserHighlight`
- `ReadingProgress`
- `UserXP`
- Existing protected entities: `Bookmark`, `Flashcard`, `AudioPlaylist`, `VerseCollection`

### Recommended logical uniqueness constraints
Base44 entities do not expose SQL-style unique indexes directly, so enforce these at write paths:
- `UserXP`: one record per user
- `ReadingProgress`: one record per user + book + chapter + translation + optional plan_id
- `Bookmark`: one record per user + verse_ref
- `UserHighlight`: one record per user + verse_ref
- `UserNote`: allow many notes unless UX intends one note per verse

## Indexing Strategy
Base44 query optimization should align with the most frequent filters/sorts:

| Entity | Hot Queries | Recommended Index Shape |
|---|---|---|
| ReadingProgress | user dashboard, plans, daily goal | `created_by`, `plan_id`, `book`, `chapter`, `created_date` |
| UserNote | library/search | `created_by`, `verse_ref`, `updated_date`, `tags` |
| UserHighlight | reader annotations/library | `created_by`, `verse_ref`, `created_date`, `color` |
| Bookmark | reader/library | `created_by`, `verse_ref`, `created_date`, `tags` |
| PrayerJournal | prayer filters | `created_by`, `answered`, `mood`, `created_date` |
| CustomPlan | plans list/detail | `created_by`, `created_date` |
| UserXP | profile/load | `created_by`, `updated_date` |

## Query Optimization
Implemented or recommended:
- Parallelized independent entity loads with `Promise.all`.
- Added per-request failure isolation so one failed entity does not block whole pages.
- Limited search query length to reduce LLM cost and prompt-injection surface.
- Avoid full dataset reads; use paginated/limited list calls.
- Offline Bible cache uses IndexedDB instead of localStorage for large scripture payloads.

## Data Consistency Rules
- XP awards are now server-controlled by action whitelist; client can no longer submit arbitrary XP.
- Personal entities now have RLS to prevent cross-user reads/writes.
- UI uses optimistic updates for delete/answered/bookmark/note actions, with backend persistence after.
- Custom plan local settings moved from title-keyed storage to ID-keyed storage to avoid duplicate-name collisions.

## Scalability Plan
1. Keep scripture text in IndexedDB client-side and external/cache-backed APIs server-side.
2. Keep personal user data row-level scoped.
3. Enforce write-path idempotency for progress/bookmark/highlight creation.
4. Move heavy exports and reports to backend functions.
5. Keep AI calls bounded by short inputs and structured schemas.
6. Add future maintenance job to dedupe legacy XP/progress records.

## Migration Applied
The following schema hardening was applied:
- Added user-owned RLS to `UserNote`.
- Added user-owned RLS to `PrayerJournal`.
- Added user-owned RLS to `UserHighlight`.
- Added user-owned RLS to `ReadingProgress`.
- Added user-owned RLS to `UserXP`.

## Production Code Review Findings

### Critical fixed
- Arbitrary XP escalation: `updateXP` no longer trusts client-provided `xp_amount`.
- Personal data privacy gap: key personal entities now have RLS.
- Search cost/prompt surface: search query and translation are now normalized and length-limited.
- Automation spoof risk: `syncReadingProgressOnAction` now blocks direct signed-in users from spoofing another `created_by`.
- PDF layout overflow: export boxes now calculate height from wrapped lines.

### Important fixed earlier in audit
- `verseRef` runtime ordering bug in `VerseRow`.
- Audio race condition in `ChapterAudioPlayer`.
- Random chart render thrash in `Profile`.
- Stale effect dependencies in `VerseSidePanel`.
- Custom plan duplicate-title storage collision.
- File download reliability in `Library`.
- Loading state deadlocks in exports and LLM devotional generation.

## Frontend Architecture Review

### Current strengths
- React components are separated by domain: reader, plans, prayer, library, profile.
- Uses responsive Tailwind classes and native buttons/anchors in most places.
- Loading states exist for major async actions.
- Offline-first Bible cache is isolated in `lib/offlineBible.js`.

### Remaining recommendations
- Split very large pages (`Profile`, `Plans`, `Library`) into route containers + section components.
- Add explicit `aria-label` to icon-only buttons.
- Add a skip link in app layout.
- Prefer shadcn `Tabs/Dialog` for custom tabs/modals to get ARIA/focus trapping automatically.
- Replace placeholder-only inputs with visible labels or `aria-label`.
- Respect `prefers-reduced-motion` for heavy Framer Motion animations.

## Suggested Clean Architecture Folder Structure

```text
src/
  features/
    reader/
      components/
      hooks/
      services/
    library/
      components/
      services/
    prayer/
      components/
      services/
    plans/
      components/
      services/
    profile/
      components/
      services/
  shared/
    components/
    hooks/
    utils/
  lib/
    offlineBible.js
    bibleData.js
    query-client.js
  pages/
    thin route wrappers only
```

## Production Migration Script Pattern
Base44 entity schema migrations are represented by JSON schema updates in `entities/*.json`. For data repair, create admin-only backend functions with this guard:

```js
const base44 = createClientFromRequest(req);
const user = await base44.auth.me();
if (user?.role !== 'admin') {
  return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
}
```

Then paginate records, repair duplicates, and avoid loading unbounded datasets.

## Final Status
The audit identified and fixed critical security, privacy, data consistency, rendering, export, search, and async-state bugs. Remaining work is mostly structural refactoring and accessibility hardening, not core functionality blockers.