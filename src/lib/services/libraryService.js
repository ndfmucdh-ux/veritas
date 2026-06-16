// Library domain service.
//
// Owns all reads/writes for user verse interactions (bookmarks, highlights,
// notes) against the consolidated `UserVerseInteraction` entity, with a legacy
// fallback while the migration rolls out. This is the ONLY place that knows the
// consolidated-vs-legacy shape — pages, components and hooks depend on these
// functions, never on base44.entities directly.
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

// --- Chapter-scoped annotations (Reader) -------------------------------------
// Returns { highlights: {verse: {color}}, bookmarks: {verse: true}, notes: {verse: text} }
// from the consolidated source, with legacy fallback.
export async function loadChapterAnnotations({ book, chapter }) {
  const consolidated = await base44.entities.UserVerseInteraction
    .filter({ book, chapter }, "-last_interacted_at", 200).catch(() => []);

  if (consolidated && consolidated.length > 0) {
    const highlights = {}, bookmarks = {}, notes = {};
    for (const i of consolidated) {
      if (i.highlight_color && i.highlight_color !== "none") highlights[i.verse] = { color: i.highlight_color };
      if (i.is_bookmarked) bookmarks[i.verse] = true;
      if (i.has_note || i.note_text) notes[i.verse] = i.note_text;
    }
    return { highlights, bookmarks, notes, source: "consolidated" };
  }

  const [hl, bm, nt] = await Promise.all([
    base44.entities.UserHighlight.filter({ book, chapter }).catch(() => []),
    base44.entities.Bookmark.filter({ book, chapter }).catch(() => []),
    base44.entities.UserNote.filter({ book, chapter }).catch(() => []),
  ]);
  const highlights = {}; (hl || []).forEach(h => { highlights[h.verse] = { color: h.color }; });
  const bookmarks = {}; (bm || []).forEach(b => { bookmarks[b.verse] = true; });
  const notes = {}; (nt || []).forEach(n => { notes[n.verse] = n.note_text; });
  return { highlights, bookmarks, notes, source: "legacy" };
}

// Read a single verse's note text (side panel), consolidated-first.
export async function getNote({ book, chapter, verse, translation }) {
  const key = verseKey(translation, book, chapter, verse);
  const c = await base44.entities.UserVerseInteraction.filter({ verse_key: key }).catch(() => []);
  if (c && c[0]) return c[0].note_text || "";
  const legacy = await base44.entities.UserNote
    .filter({ verse_ref: `${book} ${chapter}:${verse} ${translation}` }).catch(() => []);
  return legacy?.[0]?.note_text || "";
}

// Recent library items for the profile (consolidated first, capped).
export async function listRecentLibrary({ limit = 20 } = {}) {
  const interactions = await listInteractions({ limit });
  if (interactions.length > 0) return deriveViews(interactions);
  const [bm, hl, nt] = await Promise.all([
    base44.entities.Bookmark.list("-created_date", limit).catch(() => []),
    base44.entities.UserHighlight.list("-created_date", limit).catch(() => []),
    base44.entities.UserNote.list("-created_date", limit).catch(() => []),
  ]);
  return { bookmarks: bm || [], highlights: hl || [], notes: nt || [] };
}

// Consolidated-aware note delete (used by note managers).
export async function deleteNoteItem(item) {
  if (item?._interaction) return base44.entities.UserVerseInteraction.update(item.id, { note_text: "", has_note: false });
  return base44.entities.UserNote.delete(item.id);
}