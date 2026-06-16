// Optimized, single-source data-access layer for user verse interactions.
//
// Reads the CONSOLIDATED `UserVerseInteraction` entity (one row per verse) and
// derives bookmarks / highlights / notes from it — replacing 3 separate reads
// with 1. Falls back to the legacy entities when the consolidated source is
// empty (i.e. the migration hasn't been run for this user yet), so nothing
// breaks during rollout.
//
// All reads are explicitly sorted + bounded (paginated) per the indexing
// strategy in docs/DATABASE_ARCHITECTURE.md.

import { base44 } from "@/api/base44Client";
import { verseKey, buildInteractionBase } from "@/lib/verseKeys";

const PAGE = 50;

// --- Consolidated reads ------------------------------------------------------

export async function listInteractions({ limit = PAGE, skip = 0 } = {}) {
  return base44.entities.UserVerseInteraction
    .list("-last_interacted_at", limit, skip)
    .catch(() => []);
}

// Derive the three legacy-shaped views from one consolidated fetch.
export function deriveViews(interactions = []) {
  const bookmarks = [];
  const highlights = [];
  const notes = [];
  for (const i of interactions) {
    if (i.is_bookmarked) {
      bookmarks.push({ id: i.id, verse_ref: i.verse_ref, book: i.book, chapter: i.chapter, verse: i.verse, translation: i.translation, tags: i.tags || [], _interaction: true });
    }
    if (i.highlight_color && i.highlight_color !== "none") {
      highlights.push({ id: i.id, verse_ref: i.verse_ref, book: i.book, chapter: i.chapter, verse: i.verse, translation: i.translation, color: i.highlight_color, _interaction: true });
    }
    if (i.has_note || i.note_text) {
      notes.push({ id: i.id, verse_ref: i.verse_ref, book: i.book, chapter: i.chapter, verse: i.verse, translation: i.translation, note_text: i.note_text, tags: i.tags || [], _interaction: true });
    }
  }
  return { bookmarks, highlights, notes };
}

// Legacy fallback (pre-migration) — still bounded + sorted.
export async function listLegacyViews({ limit = PAGE } = {}) {
  const [bm, hl, nt] = await Promise.all([
    base44.entities.Bookmark.list("-created_date", limit).catch(() => []),
    base44.entities.UserHighlight.list("-created_date", limit).catch(() => []),
    base44.entities.UserNote.list("-created_date", limit).catch(() => []),
  ]);
  return { bookmarks: bm || [], highlights: hl || [], notes: nt || [] };
}

// Single entry point used by hooks: consolidated first, legacy fallback.
export async function loadLibraryViews() {
  const interactions = await listInteractions({ limit: PAGE });
  if (interactions.length > 0) {
    return { ...deriveViews(interactions), source: "consolidated" };
  }
  return { ...(await listLegacyViews()), source: "legacy" };
}

// --- Consolidated upsert (idempotent on verse_key) ---------------------------

async function upsertInteraction(descriptor, patch) {
  const key = verseKey(descriptor.translation, descriptor.book, descriptor.chapter, descriptor.verse);
  const existing = await base44.entities.UserVerseInteraction.filter({ verse_key: key }).catch(() => []);
  const data = {
    ...buildInteractionBase(descriptor),
    last_interacted_at: new Date().toISOString(),
    ...patch,
  };
  if (existing && existing[0]) {
    return base44.entities.UserVerseInteraction.update(existing[0].id, data);
  }
  return base44.entities.UserVerseInteraction.create(data);
}

export const setBookmark = (descriptor, isBookmarked, tags = []) =>
  upsertInteraction(descriptor, { is_bookmarked: isBookmarked, tags });

export const setHighlight = (descriptor, color) =>
  upsertInteraction(descriptor, { highlight_color: color || "none" });

export const setNote = (descriptor, noteText, tags = []) =>
  upsertInteraction(descriptor, { note_text: noteText, has_note: !!noteText, tags });