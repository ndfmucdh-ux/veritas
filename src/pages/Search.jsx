import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, Loader2, BookOpen, Sparkles, X, StickyNote, Heart, FileText, Filter } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FEATURED_VERSES } from "@/lib/sampleVerses";

const SUGGESTED_TOPICS = [
  "faith", "love", "peace", "hope", "fear not", "strength",
  "forgiveness", "prayer", "wisdom", "grace", "purpose", "joy"
];

const SOURCE_TABS = [
  { id: "all",     label: "All",          icon: SearchIcon },
  { id: "bible",   label: "Scripture",    icon: BookOpen },
  { id: "notes",   label: "My Notes",     icon: StickyNote },
  { id: "prayers", label: "Prayers",      icon: Heart },
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ bible: [], notes: [], prayers: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeSource, setActiveSource] = useState("all");
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q) => {
    const searchQuery = (q || query).trim();
    if (!searchQuery) return;

    setLoading(true);
    setSearched(true);

    // Run all three searches in parallel
    const [bibleRes, notesData, prayersData] = await Promise.all([
      base44.functions.invoke("searchVerses", { query: searchQuery, translation: "KJV" })
        .then(r => r.data?.results || [])
        .catch(() => FEATURED_VERSES.filter(v =>
          v.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.ref.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(v => ({ ...v, relevance: "Matches search" }))),

      base44.entities.UserNote.list("-updated_date", 200)
        .then(notes => (notes || []).filter(n =>
          n.note_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.verse_ref?.toLowerCase().includes(searchQuery.toLowerCase())
        ))
        .catch(() => []),

      base44.entities.PrayerJournal.list("-created_date", 200)
        .then(prayers => (prayers || []).filter(p =>
          p.prayer_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.verse_ref?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
        ))
        .catch(() => []),
    ]);

    setResults({ bible: bibleRes, notes: notesData, prayers: prayersData });
    setLoading(false);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") doSearch();
  };

  const clearSearch = () => {
    setQuery("");
    setResults({ bible: [], notes: [], prayers: [] });
    setSearched(false);
    inputRef.current?.focus();
  };

  const totalResults = results.bible.length + results.notes.length + results.prayers.length;

  const visibleBible = activeSource === "all" || activeSource === "bible";
  const visibleNotes = activeSource === "all" || activeSource === "notes";
  const visiblePrayers = activeSource === "all" || activeSource === "prayers";

  return (
    <div className="md:ml-16 min-h-screen px-4 pt-6 pb-28">
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-cinzel text-2xl font-bold mb-1">Search</h1>
        <p className="text-muted-foreground text-sm">Scripture · Notes · Prayers — all in one place</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search verses, notes, prayers..."
          className="w-full glass rounded-xl pl-12 pr-12 py-4 text-sm font-inter placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan/50 transition-all"
        />
        {query && (
          <button onClick={clearSearch} className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => doSearch()} disabled={loading || !query.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-cyan/20 hover:bg-cyan/30 text-cyan flex items-center justify-center transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* Source Filter Tabs */}
      {searched && !loading && (
        <div className="flex gap-1.5 mb-5 overflow-x-auto scrollbar-hide">
          {SOURCE_TABS.map(tab => {
            const count = tab.id === "all" ? totalResults : tab.id === "bible" ? results.bible.length : tab.id === "notes" ? results.notes.length : results.prayers.length;
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveSource(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-cinzel whitespace-nowrap flex-shrink-0 transition-all"
                style={{
                  background: activeSource === tab.id ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.04)",
                  color: activeSource === tab.id ? "#00f5ff" : "rgba(255,255,255,0.4)",
                  border: activeSource === tab.id ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.07)",
                }}>
                <Icon className="w-3 h-3" />
                {tab.label}
                <span className="px-1.5 py-0.5 rounded-full text-[9px]"
                  style={{ background: activeSource === tab.id ? "rgba(0,245,255,0.2)" : "rgba(255,255,255,0.08)", color: activeSource === tab.id ? "#00f5ff" : "rgba(255,255,255,0.4)" }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Suggested Topics — pre-search */}
      {!searched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-3">Explore Topics</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {SUGGESTED_TOPICS.map(topic => (
              <button key={topic}
                onClick={() => { setQuery(topic); doSearch(topic); }}
                className="text-sm px-4 py-2 glass rounded-full border border-border/50 text-muted-foreground hover:text-cyan hover:border-cyan/30 transition-colors capitalize">
                {topic}
              </button>
            ))}
          </div>
          <p className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-3">Popular Verses</p>
          <div className="space-y-3">
            {FEATURED_VERSES.map((v, i) => (
              <motion.a key={v.ref} href={`/read?book=${encodeURIComponent(v.ref.split(" ").slice(0,-1).join(" "))}&chapter=${v.ref.split(" ").slice(-1)[0]?.split(":")[0]}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="block glass rounded-xl p-4 border border-border/50 hover:border-cyan/20 transition-colors cursor-pointer">
                <p className="font-playfair text-sm text-foreground/90 italic mb-2 leading-relaxed">
                  "{v.text.length > 100 ? v.text.slice(0, 100) + "…" : v.text}"
                </p>
                <span className="text-xs font-cinzel text-gold">{v.ref}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-cyan animate-spin" />
          <p className="text-muted-foreground text-sm font-cinzel">Searching scripture, notes & prayers...</p>
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">
          {totalResults === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No results found for "{query}"</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Try a different keyword</p>
            </div>
          )}

          {/* Scripture Results */}
          {visibleBible && results.bible.length > 0 && (
            <ResultSection title="Scripture" icon={BookOpen} count={results.bible.length} color="#00f5ff">
              {results.bible.map((v, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="glass rounded-xl p-4 border border-border/50 hover:border-cyan/20 transition-colors">
                  <p className="font-playfair text-base text-foreground leading-relaxed mb-3">{v.text}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-cinzel text-gold">{v.ref || `${v.book} ${v.chapter}:${v.verse}`}</span>
                    <a href={`/read?book=${encodeURIComponent(v.book || v.ref?.split(" ")[0])}&chapter=${v.chapter || v.ref?.split(" ").slice(-1)[0]?.split(":")[0]}`}
                      className="flex items-center gap-1 text-xs text-cyan hover:text-cyan/80 transition-colors">
                      <BookOpen className="w-3 h-3" /> Read
                    </a>
                  </div>
                </motion.div>
              ))}
            </ResultSection>
          )}

          {/* Notes Results */}
          {visibleNotes && results.notes.length > 0 && (
            <ResultSection title="My Notes" icon={StickyNote} count={results.notes.length} color="#a78bfa">
              {results.notes.map((n, i) => (
                <motion.div key={n.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="rounded-xl p-4 border transition-colors"
                  style={{ background: "rgba(167,139,250,0.06)", borderColor: "rgba(167,139,250,0.2)" }}>
                  {n.verse_ref && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-cinzel" style={{ color: "#a78bfa" }}>{n.verse_ref}</span>
                      <a href={`/read?book=${encodeURIComponent(n.book || "")}&chapter=${n.chapter || 1}`}
                        className="text-[10px] text-cyan/60 hover:text-cyan flex items-center gap-1 transition-colors">
                        <BookOpen className="w-3 h-3" /> Open
                      </a>
                    </div>
                  )}
                  <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                    <Highlight text={n.note_text || ""} query={query} />
                  </p>
                </motion.div>
              ))}
            </ResultSection>
          )}

          {/* Prayer Results */}
          {visiblePrayers && results.prayers.length > 0 && (
            <ResultSection title="Prayer Journal" icon={Heart} count={results.prayers.length} color="#34d399">
              {results.prayers.map((p, i) => {
                const moodColors = { grateful: "#34d399", confessing: "#f87171", interceding: "#00f5ff", celebrating: "#fbbf24" };
                const c = moodColors[p.mood] || "#a78bfa";
                return (
                  <motion.div key={p.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="rounded-xl p-4 border"
                    style={{ background: `${c}08`, borderColor: `${c}25` }}>
                    <div className="flex items-center gap-2 mb-2">
                      {p.mood && <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full capitalize"
                        style={{ background: `${c}18`, color: c, border: `1px solid ${c}33` }}>{p.mood}</span>}
                      {p.verse_ref && <span className="text-[10px] font-cinzel" style={{ color: "rgba(255,255,255,0.35)" }}>{p.verse_ref}</span>}
                    </div>
                    <p className="text-sm font-playfair italic leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                      "<Highlight text={p.prayer_text || ""} query={query} />"
                    </p>
                  </motion.div>
                );
              })}
            </ResultSection>
          )}
        </motion.div>
      )}
    </div>
  );
}

function ResultSection({ title, icon: Icon, count, color, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <p className="text-[10px] font-cinzel uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.3)" }}>{title}</p>
        <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{count}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// Highlight matched query text
function Highlight({ text, query }) {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: "rgba(0,245,255,0.2)", color: "#00f5ff", borderRadius: "3px", padding: "0 2px" }}>{part}</mark>
      : part
  );
}