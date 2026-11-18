import { base44 } from "@/api/base44Client";
import { BIBLE_BOOKS } from "@/lib/bibleData";

// Creates a note on demand for any verse. If the verse already has saved activity
// (bookmark, highlight or an older note) the same record is updated, so nothing is duplicated or lost.
export async function createNote({ title, book, chapter, verse, text, tag }) {
  const translation = localStorage.getItem("veritas_translation") || "KJV";
  const verseKey = `${translation}|${book}|${chapter}|${verse}`;
  const tags = tag ? [tag] : [];
  const now = new Date().toISOString();

  const existing = await base44.entities.UserVerseInteraction.filter({ verse_key: verseKey }, { limit: 1 });
  const found = (existing?.items || existing || [])[0];
  if (found) {
    return base44.entities.UserVerseInteraction.update(found.id, {
      note_text: found.note_text ? `${found.note_text}\n\n${text}` : text,
      note_title: found.note_title || title || undefined,
      tags: [...new Set([...(found.tags || []), ...tags])],
      has_note: true,
      last_interacted_at: now,
    });
  }

  return base44.entities.UserVerseInteraction.create({
    verse_key: verseKey,
    verse_ref: `${book} ${chapter}:${verse} ${translation}`,
    book,
    book_order: BIBLE_BOOKS.find((b) => b.name === book)?.num || 0,
    chapter,
    verse,
    translation,
    note_text: text,
    note_title: title || undefined,
    has_note: true,
    tags,
    last_interacted_at: now,
  });
}