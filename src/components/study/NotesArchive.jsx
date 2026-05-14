import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, StickyNote, BookOpen, X, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function NotesArchive() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bookFilter, setBookFilter] = useState("");

  useEffect(() => {
    base44.entities.UserNote.list("-created_date", 100)
      .then(n => setNotes(n || []))
      .finally(() => setLoading(false));
  }, []);

  const allBooks = [...new Set(notes.map(n => n.book).filter(Boolean))].sort();

  const filtered = notes.filter(n => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      n.note_text?.toLowerCase().includes(q) ||
      n.verse_ref?.toLowerCase().includes(q) ||
      n.book?.toLowerCase().includes(q);
    const matchesBook = !bookFilter || n.book === bookFilter;
    return matchesSearch && matchesBook;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes, verses, keywords…"
            className="flex-1 bg-transparent text-sm font-inter focus:outline-none"
            style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}
          />
          {search && (
            <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} /></button>
          )}
        </div>
        <select
          value={bookFilter}
          onChange={e => setBookFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm font-cinzel focus:outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: bookFilter ? "#00f5ff" : "rgba(255,255,255,0.4)" }}
        >
          <option value="">All Books</option>
          {allBooks.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Count */}
      <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
        {filtered.length} {filtered.length === 1 ? "note" : "notes"}{bookFilter ? ` in ${bookFilter}` : ""}{search ? ` matching "${search}"` : ""}
      </p>

      {/* Notes feed */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <StickyNote className="w-10 h-10" style={{ color: "rgba(255,255,255,0.12)" }} />
          <p className="font-cinzel text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No notes found</p>
          {(search || bookFilter) && (
            <button onClick={() => { setSearch(""); setBookFilter(""); }}
              className="text-xs font-inter" style={{ color: "#00f5ff" }}>Clear filters</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((note, i) => (
              <motion.div key={note.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl p-4"
                style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.14)" }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(167,139,250,0.15)" }}>
                      <StickyNote className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
                    </div>
                    <p className="font-cinzel text-xs font-semibold" style={{ color: "#a78bfa" }}>{note.verse_ref}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {new Date(note.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    {note.book && note.chapter && (
                      <a href={`/read?book=${note.book}&chapter=${note.chapter}`}
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff" }}
                        title="Open in reader">
                        <BookOpen className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {note.note_text}
                </p>
                {note.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {note.tags.map(tag => (
                      <span key={tag} onClick={() => setSearch(tag)}
                        className="text-[10px] px-2 py-0.5 rounded-full font-inter cursor-pointer"
                        style={{ background: "rgba(0,245,255,0.07)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.18)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}