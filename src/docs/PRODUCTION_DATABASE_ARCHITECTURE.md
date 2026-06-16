# Veritas Production Database Architecture

## 1. Architectural Goals

The app needs a scalable, offline-first Bible data layer that supports:

- Fast chapter reading by translation, book, and chapter.
- User-owned spiritual study data: highlights, bookmarks, notes, folders, prayers, reading progress, audio reflections, and AI conversations.
- Safe offline sync and future migration from several narrow interaction tables into a canonical interaction model.
- Public scripture/catalog reads with private user annotations.
- High-volume read paths optimized for mobile and offline use.

The production data layer should separate **canonical scripture/catalog data** from **user interaction data** and **derived analytics/progress data**.

---

## 2. ERD Structure

```text
User
 ├── UserVerseInteraction 1:N
 │    └── Canonical verse key: translation|book|chapter|verse
 │
 ├── ReadingSession 1:N
 │    └── BibleTranslation / BibleChapterCache by translation + book + chapter
 │
 ├── VerseFolder 1:N
 │    └── verse_refs[] / future normalized FolderVerse join table
 │
 ├── PrayerJournal 1:N
 ├── VerseAudioReflection 1:N
 ├── VeritasAIConversation 1:N
 ├── Flashcard 1:N
 └── AudioPlaylist 1:N

BibleTranslation 1:N BibleChapterCache
BibleChapterCache 1:N logical verses inside chapter payload

DataMigrationRecord tracks architecture migrations and backfills.
```

### Relationship Notes

| Relationship | Type | Purpose |
|---|---:|---|
| `BibleTranslation.code -> BibleChapterCache.translation` | 1:N | Translation catalog to cached chapters. |
| `User -> UserVerseInteraction` | 1:N | One canonical per-user record per verse. |
| `User -> ReadingSession` | 1:N | Idempotent chapter/session completion tracking. |
| `User -> PrayerJournal` | 1:N | Private prayer records. |
| `User -> VeritasAIConversation` | 1:N | Private AI guidance history. |
| `UserVerseInteraction.verse_key` | logical unique | Prevents fragmented highlight/bookmark/note data. |

---

## 3. Production Schema Design

### Canonical Scripture Layer

#### `BibleTranslation`
Stores translation catalog metadata.

Primary logical key:

```text
code
```

Recommended query paths:

```js
BibleTranslation.filter({ status: "active" })
BibleTranslation.filter({ language: "es", status: "active" })
```

#### `BibleChapterCache`
Stores chapter-level scripture payloads only. Never store a whole Bible translation in a single record.

Primary logical key:

```text
translation|book|chapter
```

Recommended query path:

```js
BibleChapterCache.filter({ translation, book, chapter })
```

This supports:

- Fast chapter reads.
- Offline warming.
- Provider fallback caching.
- Chapter checksum validation.

---

### User Interaction Layer

#### `UserVerseInteraction`
Canonical replacement/aggregation target for:

- `UserHighlight`
- `Bookmark`
- `UserNote`

Primary logical key:

```text
verse_key = TRANSLATION|Book|Chapter|Verse
```

This avoids querying three separate entities every time the reader loads a chapter.

Recommended query path:

```js
UserVerseInteraction.filter({ book, chapter, translation })
```

Then build maps in memory:

```js
highlights[verse] = interaction.highlight_color
bookmarks[verse] = interaction.is_bookmarked
notes[verse] = interaction.note_text
```

#### `ReadingSession`
Canonical replacement/aggregation target for high-volume `ReadingProgress` records.

Primary logical key:

```text
session_key = userId|YYYY-MM-DD|translation|book|chapter
```

This prevents repeated duplicate completion records and supports analytics by date, plan, book, and chapter.

---

### Migration Tracking Layer

#### `DataMigrationRecord`
Tracks migration/backfill status, counts, and failures.

Used by:

- `migrateUserDataArchitecture`
- Future schema migrations
- Admin migration dashboard if needed

---

## 4. Indexing Strategy

Base44 entities are queryable by field filters. The practical indexing strategy is to design stable, low-cardinality query fields and canonical keys that mirror app access patterns.

### Recommended Logical Indexes

| Entity | Logical Index | Query Supported |
|---|---|---|
| `BibleTranslation` | `code` | Fetch translation metadata by code. |
| `BibleTranslation` | `language,status` | Translation picker by language. |
| `BibleChapterCache` | `translation,book,chapter` | Reader chapter load. |
| `BibleChapterCache` | `translation,book_order,chapter` | Sequential reading / export. |
| `UserVerseInteraction` | `created_by,book,chapter,translation` | Reader annotations for one chapter. |
| `UserVerseInteraction` | `created_by,verse_key` | Upsert-style verse interaction. |
| `UserVerseInteraction` | `created_by,last_interacted_at` | Library recents. |
| `ReadingSession` | `created_by,completed_at` | Progress dashboard. |
| `ReadingSession` | `created_by,plan_id,completed_at` | Plan progress. |
| `ReadingSession` | `created_by,session_key` | Idempotent completion writes. |
| `VeritasAIConversation` | `created_by,last_message_at` | Conversation history. |
| `PrayerJournal` | `created_by,answered,mood` | Prayer journal filters. |

### Canonical Key Rules

Use stable deterministic keys instead of display text when possible:

```text
verse_key: TRANSLATION|Book|Chapter|Verse
chapter_key: TRANSLATION|Book|Chapter
session_key: userId|date|translation|book|chapter
```

This keeps writes idempotent and makes migrations safe to rerun.

---

## 5. Query Optimization Strategy

### Reader Load Path

Current path often needs:

1. Chapter verses.
2. Highlights.
3. Bookmarks.
4. Notes.

Optimized path:

```text
1 query: BibleChapterCache.filter({ translation, book, chapter })
1 query: UserVerseInteraction.filter({ translation, book, chapter })
```

Result:

- Fewer network calls.
- Less state reconciliation.
- Faster mobile loading.
- Easier offline sync.

### Library Path

Use `last_interacted_at` for recents rather than scanning highlights, bookmarks, and notes separately.

```js
UserVerseInteraction.list("-last_interacted_at", 50)
```

### Progress Path

Use `ReadingSession` instead of repeatedly creating `ReadingProgress` rows.

Recommended dashboard queries:

```js
ReadingSession.list("-completed_at", 100)
ReadingSession.filter({ plan_id }, "-completed_at", 500)
```

---

## 6. Data Consistency Rules

### User Annotations

`UserVerseInteraction` is the source of truth for future annotation reads.

Legacy entities can remain temporarily for compatibility:

- `UserHighlight`
- `Bookmark`
- `UserNote`

Migration approach:

1. Backfill into `UserVerseInteraction`.
2. Read from unified entity in new reader versions.
3. Dual-write during transition if needed.
4. Archive legacy entities after confidence window.

### Idempotency

All high-volume write operations should check canonical keys first:

```text
verse_key
session_key
chapter_key
```

### Privacy

Private user entities must keep owner-scoped RLS:

```json
"read": { "created_by": "{{user.email}}" }
```

Public catalog/cache entities should be readable by everyone but writable only by admins.

---

## 7. Scalability Planning

### Near-Term

- Keep scripture content chapter-scoped.
- Keep user interactions canonical and per-verse.
- Store large files externally and only keep file URLs/URIs on entities.
- Use IndexedDB for offline chapter storage and Base44 entities for syncable user data.

### Medium-Term

- Add normalized join entities if folder/playlist arrays become too large:
  - `VerseFolderItem`
  - `AudioPlaylistItem`
  - `VerseCollectionItem`
- Add sync queue/outbox for offline writes:
  - `SyncOutbox`
  - fields: `operation`, `entity_name`, `payload`, `status`, `retry_count`

### Long-Term

- Precompute daily/weekly user aggregates:
  - `UserReadingDailyAggregate`
  - `UserPrayerDailyAggregate`
- Move analytics dashboards to aggregate entities instead of scanning raw sessions.
- Keep AI conversations summarized and avoid repeatedly loading full message histories for dashboard views.

---

## 8. Migration Scripts

Implemented migration function:

```text
functions/migrateUserDataArchitecture.js
```

It safely migrates the authenticated user's legacy records into:

- `UserVerseInteraction`
- `ReadingSession`
- `DataMigrationRecord`

It is idempotent because it checks canonical keys before creating records.

Recommended rollout:

1. Deploy schemas.
2. Run migration for internal/admin users.
3. Add unified reads to reader/library in a later UI release.
4. Dual-write annotation changes temporarily.
5. Remove legacy reads once migration coverage is verified.

---

## 9. Production-Ready Implementation Checklist

- [x] Add canonical scripture catalog entity.
- [x] Add chapter-scoped cache entity.
- [x] Add unified user verse interaction entity.
- [x] Add idempotent reading session entity.
- [x] Add migration tracking entity.
- [x] Add safe migration/backfill function.
- [ ] Update reader read path to use `UserVerseInteraction` after migration verification.
- [ ] Add dual-write during transition.
- [ ] Add admin migration dashboard if needed.
- [ ] Add aggregate entities once analytics volume grows.

---

## 10. Final Target Architecture

The ideal production read model is:

```text
BibleChapterCache        -> scripture text
UserVerseInteraction    -> all per-verse user data
ReadingSession          -> progress and analytics
PrayerJournal           -> devotional/prayer records
VeritasAIConversation   -> AI spiritual guidance history
```

This architecture reduces duplicate data, improves reader performance, and provides a stable foundation for offline sync and future analytics.