import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, BookOpen, Trash2, Sparkles, Loader2, X, Share2, Tag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AudioStreakChart from "@/components/library/AudioStreakChart";
import VerseNoteFolderManager from "@/components/library/VerseNoteFolderManager";
import SocialShareModal from "@/components/library/SocialShareModal";
import TagManager from "@/components/library/TagManager";
import ReadingHistory from "@/components/library/ReadingHistory";
import LibraryCollections from "@/components/library/LibraryCollections";
import LibraryAssistant from "@/components/library/LibraryAssistant";
import LibraryHeaderActions from "@/components/library/LibraryHeaderActions.jsx";
import LibraryTabs from "@/components/library/LibraryTabs.jsx";
import TagFilterBar from "@/components/library/TagFilterBar.jsx";
import useLibraryData from "@/hooks/useLibraryData";
import { LoadingState, EmptyState } from "@/components/ui/states";
import { useLang } from "@/lib/LanguageContext";

const HIGHLIGHT_COLOR_HEX = {
  yellow: "#fbbf24", cyan: "#00e5ff", purple: "#a78bfa",
  green: "#34d399", red: "#f87171", orange: "#fb923c", pink: "#f472b6",
};

export default function Library() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("bookmarks");
  const {
    bookmarks,
    highlights,
    notes,
    loading,
    deleteBookmark,
    deleteHighlight,
    deleteNote,
    updateBookmarkTags,
    updateNoteTags,
  } = useLibraryData();
  const [hlDevotional, setHlDevotional] = useState(null);
  const [hlDevLoading, setHlDevLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [shareItem, setShareItem] = useState(null); // { verseRef, verseText }
  const [tagManagerItem, setTagManagerItem] = useState(null); // { id, type, tags }
  const [activeTagFilter, setActiveTagFilter] = useState(null);
  const [showAI, setShowAI] = useState(false);

  const exportLibrary = async () => {
    setExporting(true);
    try {
      const res = await base44.functions.invoke("exportLibraryData", {});
      const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data, null, 2);
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `veritas-biblioteca-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const exportPdf = async () => {
    setExportingPdf(true);
    try {
      const res = await base44.functions.invoke("exportLibraryPDF", {});
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `veritas-biblioteca-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExportingPdf(false);
    }
  };


  const saveItemTags = async (tags) => {
    if (!tagManagerItem) return;
    const { id, type } = tagManagerItem;
    if (type === "bookmark") {
      await updateBookmarkTags(id, tags);
    } else if (type === "note") {
      await updateNoteTags(id, tags);
    }
  };

  // Collect all tags for filter bar
  const allTags = [...new Set([
    ...bookmarks.flatMap(b => b.tags || []),
    ...notes.flatMap(n => n.tags || []),
  ])].sort();

  const renderBookmarks = () => {
    const filtered = activeTagFilter
      ? bookmarks.filter(b => (b.tags || []).includes(activeTagFilter))
      : bookmarks;
    return (
      <div className="space-y-3">
        <TagFilterBar tags={allTags} activeTag={activeTagFilter} onSelect={setActiveTagFilter} />
        {filtered.length === 0 && !loading && (
          <EmptyState icon="🔖" title={activeTagFilter ? `No bookmarks tagged "${activeTagFilter}"` : "No bookmarks yet"} description="Tap any verse while reading to bookmark it" />
        )}
        {filtered.map((bm, i) => (
          <motion.div key={bm.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
                <Bookmark className="w-4 h-4 text-gold fill-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-cinzel text-sm text-foreground">{bm.verse_ref}</p>
                {bm.label && <p className="text-xs text-muted-foreground truncate">{bm.label}</p>}
                <p className="text-xs text-muted-foreground/60">{bm.translation}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setTagManagerItem({ id: bm.id, type: "bookmark", tags: bm.tags || [] })}
                  className="p-1.5 rounded-lg transition-colors hover:bg-cyan/10"
                  style={{ color: (bm.tags?.length > 0) ? "#00f5ff" : "rgb(var(--ink) / 0.25)" }}>
                  <Tag className="w-3.5 h-3.5" />
                </button>
                <a href={`/read?book=${bm.book}&chapter=${bm.chapter}`}
                  className="text-xs text-cyan hover:text-cyan/80 p-1.5 rounded-lg hover:bg-cyan/10 transition-colors">
                  <BookOpen className="w-3.5 h-3.5" />
                </a>
                <button onClick={() => deleteBookmark(bm.id)}
                  className="text-xs text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {bm.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 pl-12">
                {bm.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-inter"
                    style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.2)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const generateHighlightDevotional = async (hl) => {
    setHlDevLoading(true);
    setHlDevotional({ ref: hl.verse_ref, text: null });
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a short, personal devotional for the Bible verse "${hl.verse_ref}". Include: 1) A warm 2-sentence reflection, 2) A short first-person prayer, 3) One practical "living it today" application. Be intimate, not generic. Format with clear sections.`,
      });
      // InvokeLLM returns a string when no response_json_schema is given
      setHlDevotional({ ref: hl.verse_ref, text: typeof res === "string" ? res : (res?.text || String(res)) });
    } finally {
      setHlDevLoading(false);
    }
  };

  const renderHighlights = () => (
    <div className="space-y-3">
      {highlights.length === 0 && !loading && (
        <EmptyState icon="✨" title="No highlights yet" description="Tap any verse to highlight it in your favourite color" />
      )}

      {/* Devotional panel */}
      <AnimatePresence>
        {hlDevotional && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl p-4 mb-2"
            style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.2)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-cinzel text-xs" style={{ color: "#a78bfa" }}>✦ Devotional · {hlDevotional.ref}</p>
              <button onClick={() => setHlDevotional(null)}><X className="w-3.5 h-3.5" style={{ color: "rgb(var(--ink) / 0.3)" }} /></button>
            </div>
            {hlDevLoading
              ? <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" style={{ color: "#a78bfa" }} /><span className="text-xs font-inter" style={{ color: "rgb(var(--ink) / 0.4)" }}>Seeking wisdom…</span></div>
              : <p className="text-sm font-inter leading-relaxed whitespace-pre-line" style={{ color: "rgb(var(--ink) / 0.75)" }}>{hlDevotional.text}</p>
            }
          </motion.div>
        )}
      </AnimatePresence>

      {highlights.map((hl, i) => {
        const borderColor = HIGHLIGHT_COLOR_HEX[hl.color] || "#fbbf24";
        return (
          <motion.div key={hl.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-xl p-4 border-l-4 flex items-center gap-3 glass"
            style={{ borderLeftColor: borderColor, background: `${borderColor}10` }}>
            <div className="flex-1 min-w-0">
              <p className="font-cinzel text-sm text-foreground">{hl.verse_ref}</p>
              <p className="text-xs text-muted-foreground capitalize">{hl.color} highlight · {hl.translation}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => generateHighlightDevotional(hl)} title="Reflexión devocional"
                className="p-1.5 rounded-lg transition-colors hover:bg-purple-400/10"
                style={{ color: "#a78bfa" }}>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setShareItem({ verseRef: hl.verse_ref, verseText: "" })} title="Compartir"
                className="p-1.5 rounded-lg transition-colors hover:bg-cyan/10"
                style={{ color: "#00f5ff" }}>
                <Share2 className="w-3.5 h-3.5" />
              </button>
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
        );
      })}
    </div>
  );

  const renderNotes = () => {
    const filtered = activeTagFilter
      ? notes.filter(n => (n.tags || []).includes(activeTagFilter))
      : notes;
    return (
      <div className="space-y-3">
        <TagFilterBar tags={allTags} activeTag={activeTagFilter} onSelect={setActiveTagFilter} />
        {filtered.length === 0 && !loading && (
          <EmptyState icon="✍️" title={activeTagFilter ? `No notes tagged "${activeTagFilter}"` : "No notes yet"} description="Tap any verse and add a personal note or reflection" />
        )}
        {filtered.map((note, i) => (
          <motion.div key={note.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass rounded-xl p-4 border border-border/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-cinzel text-xs text-cyan mb-2">{note.verse_ref}</p>
                <p className="text-sm text-foreground/90 leading-relaxed font-inter">{note.note_text}</p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  {new Date(note.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                {note.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {note.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-inter"
                        style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.2)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setTagManagerItem({ id: note.id, type: "note", tags: note.tags || [] })}
                  className="p-1.5 rounded-lg transition-colors hover:bg-cyan/10"
                  style={{ color: (note.tags?.length > 0) ? "#00f5ff" : "rgb(var(--ink) / 0.25)" }}>
                  <Tag className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setShareItem({ verseRef: note.verse_ref, verseText: note.note_text })}
                  className="p-1.5 rounded-lg transition-colors hover:bg-cyan/10"
                  style={{ color: "#00f5ff" }}>
                  <Share2 className="w-3.5 h-3.5" />
                </button>
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
  };

  return (
    <div className="md:ml-16 min-h-screen px-4 pt-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-cinzel text-3xl font-semibold text-foreground mb-1">{t.myLibrary}</h1>
          <p className="text-muted-foreground text-sm">{t.librarySub}</p>
        </div>
        <LibraryHeaderActions
          showAI={showAI}
          onToggleAI={() => setShowAI(v => !v)}
          exportingPdf={exportingPdf}
          onExportPdf={exportPdf}
          exporting={exporting}
          onExportLibrary={exportLibrary}
        />
      </div>

      <LibraryTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* Content */}
      <div className="pb-8">
        {loading && ["bookmarks", "highlights", "notes"].includes(activeTab) && (
          <LoadingState label="Loading your library…" size="lg" />
        )}
        {activeTab === "bookmarks" && renderBookmarks()}
        {activeTab === "highlights" && renderHighlights()}
        {activeTab === "notes" && renderNotes()}
        {activeTab === "history" && <ReadingHistory />}
        {activeTab === "folders" && (
          <VerseNoteFolderManager highlights={highlights} notes={notes} />
        )}
        {activeTab === "collections" && (
          <LibraryCollections bookmarks={bookmarks} highlights={highlights} notes={notes} />
        )}
        {activeTab === "audio" && <AudioStreakChart />}
      </div>

      {/* Library AI Assistant */}
      <AnimatePresence>
        {showAI && <LibraryAssistant open={showAI} onClose={() => setShowAI(false)} />}
      </AnimatePresence>

      {/* Social Share Modal */}
      <AnimatePresence>
        {shareItem && (
          <SocialShareModal
            verseRef={shareItem.verseRef}
            verseText={shareItem.verseText}
            onClose={() => setShareItem(null)}
          />
        )}
        {tagManagerItem && (
          <TagManager
            currentTags={tagManagerItem.tags}
            onSave={saveItemTags}
            onClose={() => setTagManagerItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}