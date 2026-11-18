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

  // Consolidated rows carry _interaction:true. Bookmarks/highlights/notes that
  // come from a single interaction row are cleared field-wise, not row-deleted,
  // so other interactions on the same verse survive.
  const deleteBookmark = async (id) => {
    if (source === "consolidated") await base44.entities.UserVerseInteraction.update(id, { is_bookmarked: false, tags: [] });
    else await base44.entities.Bookmark.delete(id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const deleteHighlight = async (id) => {
    if (source === "consolidated") await base44.entities.UserVerseInteraction.update(id, { highlight_color: "none" });
    else await base44.entities.UserHighlight.delete(id);
    setHighlights(prev => prev.filter(h => h.id !== id));
  };

  const deleteNote = async (id) => {
    if (source === "consolidated") await base44.entities.UserVerseInteraction.update(id, { note_text: "", has_note: false });
    else await base44.entities.UserNote.delete(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const updateBookmarkTags = async (id, tags) => {
    if (source === "consolidated") await base44.entities.UserVerseInteraction.update(id, { tags });
    else await base44.entities.Bookmark.update(id, { tags });
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, tags } : b));
  };

  const updateNoteTags = async (id, tags) => {
    if (source === "consolidated") await base44.entities.UserVerseInteraction.update(id, { tags });
    else await base44.entities.UserNote.update(id, { tags });
    setNotes(prev => prev.map(n => n.id === id ? { ...n, tags } : n));
  };

  return {
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