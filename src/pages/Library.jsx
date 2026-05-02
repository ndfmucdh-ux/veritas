import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bookmark, StickyNote, Highlighter, BookOpen, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TABS = [
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { id: "highlights", label: "Highlights", icon: Highlighter },
  { id: "notes", label: "Notes", icon: StickyNote },
];

const HIGHLIGHT_COLORS = {
  yellow: "border-l-yellow-400 bg-yellow-400/10",
  cyan: "border-l-cyan-400 bg-cyan-400/10",
  purple: "border-l-purple-400 bg-purple-400/10",
  green: "border-l-green-400 bg-green-400/10",
  red: "border-l-red-400 bg-red-400/10",
};

export default function Library() {
  const [activeTab, setActiveTab] = useState("bookmarks");
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
        base44.entities.Bookmark.list("-created_date", 50),
        base44.entities.UserHighlight.list("-created_date", 50),
        base44.entities.UserNote.list("-created_date", 50),
      ]);
      setBookmarks(bm || []);
      setHighlights(hl || []);
      setNotes(nt || []);
    } catch (e) {}
    setLoading(false);
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

  const renderBookmarks = () => (
    <div className="space-y-3">
      {bookmarks.length === 0 && !loading && (
        <EmptyState icon="🔖" text="No bookmarks yet" sub="Tap any verse while reading to bookmark it" />
      )}
      {bookmarks.map((bm, i) => (
        <motion.div key={bm.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
          className="glass rounded-xl p-4 border border-border/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
            <Bookmark className="w-4 h-4 text-gold fill-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-cinzel text-sm text-foreground">{bm.verse_ref}</p>
            {bm.label && <p className="text-xs text-muted-foreground truncate">{bm.label}</p>}
            <p className="text-xs text-muted-foreground/60">{bm.translation}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/read?book=${bm.book}&chapter=${bm.chapter}`}
              className="text-xs text-cyan hover:text-cyan/80 p-1.5 rounded-lg hover:bg-cyan/10 transition-colors">
              <BookOpen className="w-3.5 h-3.5" />
            </a>
            <button onClick={() => deleteBookmark(bm.id)}
              className="text-xs text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderHighlights = () => (
    <div className="space-y-3">
      {highlights.length === 0 && !loading && (
        <EmptyState icon="✨" text="No highlights yet" sub="Tap any verse to highlight it in your favourite color" />
      )}
      {highlights.map((hl, i) => (
        <motion.div key={hl.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
          className={`rounded-xl p-4 border-l-4 flex items-center gap-3 glass ${HIGHLIGHT_COLORS[hl.color] || HIGHLIGHT_COLORS.yellow}`}>
          <div className="flex-1 min-w-0">
            <p className="font-cinzel text-sm text-foreground">{hl.verse_ref}</p>
            <p className="text-xs text-muted-foreground capitalize">{hl.color} highlight · {hl.translation}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/read?book=${hl.book}&chapter=${hl.chapter}`}
              className="text-xs text-cyan hover:text-cyan/80 p-1.5 rounded-lg hover:bg-cyan/10 transition-colors">
              <BookOpen className="w-3.5 h-3.5" />
            </a>
            <button onClick={() => deleteHighlight(hl.id)}
              className="text-xs text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-3">
      {notes.length === 0 && !loading && (
        <EmptyState icon="✍️" text="No notes yet" sub="Tap any verse and add a personal note or reflection" />
      )}
      {notes.map((note, i) => (
        <motion.div key={note.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
          className="glass rounded-xl p-4 border border-border/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-cinzel text-xs text-cyan mb-2">{note.verse_ref}</p>
              <p className="text-sm text-foreground/90 leading-relaxed font-inter">{note.note_text}</p>
              <p className="text-xs text-muted-foreground/60 mt-2">
                {new Date(note.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <a href={`/read?book=${note.book}&chapter=${note.chapter}`}
                className="text-xs text-cyan hover:text-cyan/80 p-1.5 rounded-lg hover:bg-cyan/10 transition-colors">
                <BookOpen className="w-3.5 h-3.5" />
              </a>
              <button onClick={() => deleteNote(note.id)}
                className="text-xs text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="md:ml-16 min-h-screen px-4 pt-6">
      <div className="mb-6">
        <h1 className="font-cinzel text-2xl font-bold mb-1">My Library</h1>
        <p className="text-muted-foreground text-sm">Your saved verses, highlights, and notes</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 glass rounded-xl p-1">
        {TABS.map(({ id, label, icon: TabIcon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all ${
              activeTab === id ? "bg-cyan/20 text-cyan font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TabIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="pb-8">
        {activeTab === "bookmarks" && renderBookmarks()}
        {activeTab === "highlights" && renderHighlights()}
        {activeTab === "notes" && renderNotes()}
      </div>
    </div>
  );
}

function EmptyState({ icon, text, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <span className="text-5xl">{icon}</span>
      <p className="font-cinzel text-foreground/60 text-sm">{text}</p>
      <p className="text-xs text-muted-foreground text-center max-w-xs">{sub}</p>
    </div>
  );
}