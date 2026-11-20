import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { loadLibraryViews } from "@/lib/dataAccess";

// Reads the consolidated UserVerseInteraction source (one fetch → bookmarks,
// highlights, notes), with automatic legacy fallback when the migration hasn't
// run yet. Public API is unchanged for consumers.
export default function useLibraryData() {
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const [source, setSource] = useState("consolidated");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const views = await loadLibraryViews();
      setBookmarks(views.bookmarks || []);
      setHighlights(views.highlights || []);
      setNotes(views.notes || []);
      setSource(views.source);
    } finally {
      setLoading(false);
    }
  };

  // Optimistic: the list changes instantly; if the save fails the previous list is restored.
  const optimistic = async (setter, change, save) => {
    let prev;
    setter(cur => { prev = cur; return change(cur); });
    try { await save(); } catch (e) { setter(prev); throw e; }
  };

  // Consolidated rows carry _interaction:true. Bookmarks/highlights/notes that
  // come from a single interaction row are cleared field-wise, not row-deleted,
  // so other interactions on the same verse survive.
  const deleteBookmark = (id) => optimistic(setBookmarks, l => l.filter(b => b.id !== id), () =>
    source === "consolidated" ? base44.entities.UserVerseInteraction.update(id, { is_bookmarked: false, tags: [] }) : base44.entities.Bookmark.delete(id));

  const deleteHighlight = (id) => optimistic(setHighlights, l => l.filter(h => h.id !== id), () =>
    source === "consolidated" ? base44.entities.UserVerseInteraction.update(id, { highlight_color: "none" }) : base44.entities.UserHighlight.delete(id));

  const deleteNote = (id) => optimistic(setNotes, l => l.filter(n => n.id !== id), () =>
    source === "consolidated" ? base44.entities.UserVerseInteraction.update(id, { note_text: "", has_note: false }) : base44.entities.UserNote.delete(id));

  const updateBookmarkTags = (id, tags) => optimistic(setBookmarks, l => l.map(b => b.id === id ? { ...b, tags } : b), () =>
    source === "consolidated" ? base44.entities.UserVerseInteraction.update(id, { tags }) : base44.entities.Bookmark.update(id, { tags }));

  const updateNoteTags = (id, tags) => optimistic(setNotes, l => l.map(n => n.id === id ? { ...n, tags } : n), () =>
    source === "consolidated" ? base44.entities.UserVerseInteraction.update(id, { tags }) : base44.entities.UserNote.update(id, { tags }));

  // Edit a note's title, text and topics in place (works for new and older notes).
  const updateNote = (id, { title, text, tags }) => optimistic(setNotes, l => l.map(n => n.id === id ? { ...n, note_text: text, note_title: title, tags } : n), () =>
    source === "consolidated"
      ? base44.entities.UserVerseInteraction.update(id, { note_text: text, note_title: title || "", tags, has_note: true, last_interacted_at: new Date().toISOString() })
      : base44.entities.UserNote.update(id, { note_text: text, tags }));

  return {
    updateNote,
    bookmarks,
    highlights,
    notes,
    loading,
    source,
    deleteBookmark,
    deleteHighlight,
    deleteNote,
    updateBookmarkTags,
    updateNoteTags,
    reload: loadAll,
  };
}