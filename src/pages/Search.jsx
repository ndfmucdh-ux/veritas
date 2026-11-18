import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, BookOpen, StickyNote, Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FEATURED_VERSES } from "@/lib/sampleVerses";
import { LoadingState, EmptyState } from "@/components/ui/states";
import ThemeFilterTags from "@/components/search/ThemeFilterTags";
import SearchInput from "@/components/search/SearchInput.jsx";
import SourceFilterTabs from "@/components/search/SourceFilterTabs.jsx";
import ResultSection from "@/components/search/SearchResultSection.jsx";
import Highlight from "@/components/search/HighlightMatch.jsx";
import { useLang } from "@/lib/LanguageContext";

const SUGGESTED_TOPICS_EN = ["faith", "love", "peace", "hope", "fear not", "strength", "forgiveness", "prayer", "wisdom", "grace", "purpose", "joy"];
const SUGGESTED_TOPICS_ES = ["fe", "amor", "paz", "esperanza", "no temas", "fortaleza", "perdón", "oración", "sabiduría", "gracia", "propósito", "gozo"];

export default function Search() {
  const { t, lang } = useLang();
  const SUGGESTED_TOPICS = lang === "es" ? SUGGESTED_TOPICS_ES : SUGGESTED_TOPICS_EN;
  const SOURCE_TABS = [
    { id: "all",     label: lang === "es" ? "Todos" : "All",          icon: SearchIcon },
    { id: "bible",   label: t.scripture || "Scripture",    icon: BookOpen },
    { id: "notes",   label: t.myNotes || "My Notes",     icon: StickyNote },
    { id: "prayers", label: t.prayerJournalTab || "Prayers",      icon: Heart },
  ];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ bible: [], notes: [], prayers: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeSource, setActiveSource] = useState("all");
  const [selectedTheme, setSelectedTheme] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q) => {
    const searchQuery = (q !== undefined ? q : query).trim();
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
          p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        ))
        .catch(() => []),
    ]);

    setResults({ bible: bibleRes, notes: notesData, prayers: prayersData });
    setLoading(false);
  }, [query]);

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
        <h1 className="font-cinzel text-2xl font-bold mb-1">{t.search}</h1>
        <p className="text-muted-foreground text-sm">{t.scripture} · {t.myNotes} · {t.prayerJournalTab}</p>
      </div>

      <SearchInput
        inputRef={inputRef}
        query={query}
        onQueryChange={setQuery}
        onClear={clearSearch}
        onSearch={doSearch}
        loading={loading}
        placeholder={t.searchPlaceholder}
      />

      {searched && !loading && (
        <SourceFilterTabs
          tabs={SOURCE_TABS}
          activeSource={activeSource}
          onChange={setActiveSource}
          results={results}
          totalResults={totalResults}
        />
      )}

      {/* Theme filter — always visible */}
      {!searched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <ThemeFilterTags selectedTag={selectedTheme} onTagSelect={setSelectedTheme} />
        </motion.div>
      )}

      {/* Suggested Topics — pre-search */}
      {!searched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-3">{t.exploreTopic}</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {SUGGESTED_TOPICS.map(topic => (
              <button key={topic}
                onClick={() => { setQuery(topic); doSearch(topic); }}
                className="text-sm px-4 py-2 glass rounded-full border border-border/50 text-muted-foreground hover:text-cyan hover:border-cyan/30 transition-colors capitalize">
                {topic}
              </button>
            ))}
          </div>
          <p className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-3">{t.popularVerses}</p>
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
      {loading && <LoadingState label={t.searchingAll} size="xl" minHeight={240} />}

      {/* Results */}
      {searched && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">
          {totalResults === 0 && (
            <EmptyState icon={SearchIcon} title={`No results found for "${query}"`} description="Try a different keyword" />
          )}

          {/* Scripture Results */}
          {visibleBible && results.bible.length > 0 && (
            <ResultSection title={t.scripture} icon={BookOpen} count={results.bible.length} color="#00f5ff">
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
            <ResultSection title={t.myNotes} icon={StickyNote} count={results.notes.length} color="#a78bfa">
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
                  <p className="text-sm font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.75)" }}>
                    <Highlight text={n.note_text || ""} query={query} />
                  </p>
                </motion.div>
              ))}
            </ResultSection>
          )}

          {/* Prayer Results */}
          {visiblePrayers && results.prayers.length > 0 && (
            <ResultSection title={t.prayerJournal} icon={Heart} count={results.prayers.length} color="#34d399">
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
                      {p.verse_ref && <span className="text-[10px] font-cinzel" style={{ color: "rgb(var(--ink) / 0.35)" }}>{p.verse_ref}</span>}
                    </div>
                    <p className="text-sm font-playfair italic leading-relaxed" style={{ color: "rgb(var(--ink) / 0.72)" }}>
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