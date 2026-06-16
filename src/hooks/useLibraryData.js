import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function useLibraryData() {
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [bm, hl, nt] = await Promise.all([
        base44.entities.Bookmark.list("-created_date", 50).catch(() => []),
        base44.entities.UserHighlight.list("-created_date", 50).catch(() => []),
        base44.entities.UserNote.list("-created_date", 50).catch(() => []),
      ]);
      setBookmarks(bm || []);
      setHighlights(hl || []);
      setNotes(nt || []);
    } finally {
      setLoading(false);
    }
  };

  const deleteBookmark = async (id) => {
    await base44.entities.Bookmark.delete(id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const deleteHighlight = async (id) => {
    await base44.entities.UserHighlight.delete(id);
    setHighlights(prev => prev.filter(h => h.id !== id));
  };

  const deleteNote = async (id) => {
    await base44.entities.UserNote.delete(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const updateBookmarkTags = async (id, tags) => {
    await base44.entities.Bookmark.update(id, { tags });
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, tags } : b));
  };

  const updateNoteTags = async (id, tags) => {
    await base44.entities.UserNote.update(id, { tags });
    setNotes(prev => prev.map(n => n.id === id ? { ...n, tags } : n));
  };

  return {
    bookmarks,
    highlights,
    notes,
    loading,
    deleteBookmark,
    deleteHighlight,
    deleteNote,
    updateBookmarkTags,
    updateNoteTags,
  };
}