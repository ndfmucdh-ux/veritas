import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, Loader2, BookOpen, Sparkles, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FEATURED_VERSES } from "@/lib/sampleVerses";

const SUGGESTED_TOPICS = [
  "faith", "love", "peace", "hope", "fear not", "strength",
  "forgiveness", "prayer", "wisdom", "grace", "purpose", "joy"
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [aiMode, setAiMode] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = async (q) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      const res = await base44.functions.invoke("searchVerses", {
        query: searchQuery,
        translation: "KJV"
      });
      setResults(res.data?.results || []);
    } catch (e) {
      // Fallback: filter from featured verses
      const filtered = FEATURED_VERSES.filter(v =>
        v.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.theme.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered.map(v => ({ ...v, relevance: "Matches your search" })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:ml-16 min-h-screen px-4 pt-6">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="font-cinzel text-2xl font-bold mb-1">Search Scripture</h1>
        <p className="text-muted-foreground text-sm">Find verses by topic, keyword, or phrase</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && doSearch()}
          placeholder="Search by topic, keyword, or verse..."
          className="w-full glass rounded-xl pl-12 pr-12 py-4 text-sm font-inter placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan/50 transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => doSearch()}
          disabled={loading || !query.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-cyan/20 hover:bg-cyan/30 text-cyan flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* AI Mode Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setAiMode(!aiMode)}
          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-colors ${
            aiMode ? "bg-purple/20 border-purple/40 text-purple" : "bg-muted border-border text-muted-foreground"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          AI Topical Search
        </button>
        <span className="text-xs text-muted-foreground">{aiMode ? "Finding thematically related verses" : "Keyword search"}</span>
      </div>

      {/* Suggested Topics */}
      {!searched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-3">Explore Topics</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {SUGGESTED_TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => { setQuery(topic); doSearch(topic); }}
                className="text-sm px-4 py-2 glass rounded-full border border-border/50 text-muted-foreground hover:text-cyan hover:border-cyan/30 transition-colors capitalize"
              >
                {topic}
              </button>
            ))}
          </div>

          <p className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-3">Popular Verses</p>
          <div className="space-y-3">
            {FEATURED_VERSES.map((v, i) => (
              <motion.div
                key={v.ref}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4 border border-border/50 hover:border-cyan/20 transition-colors cursor-pointer"
                onClick={() => {
                  const [book, ref] = v.ref.split(" ").reduce((acc, p, i, arr) => {
                    if (i === arr.length - 1) return [acc[0], p];
                    return [acc[0] + (i > 0 ? " " : "") + p, acc[1]];
                  }, ["", ""]);
                  const chapter = ref?.split(":")[0];
                  window.location.href = `/read?book=${encodeURIComponent(book)}&chapter=${chapter}`;
                }}
              >
                <p className="font-playfair text-sm text-foreground/90 italic mb-2 leading-relaxed">
                  "{v.text.length > 100 ? v.text.slice(0, 100) + "…" : v.text}"
                </p>
                <span className="text-xs font-cinzel text-gold">{v.ref}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-cyan/20 animate-pulse" />
            <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-cyan animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm font-cinzel">Searching scripture...</p>
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No results found for "{query}"</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Try a different topic or keyword</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-4">{results.length} verse{results.length !== 1 ? "s" : ""} found</p>
              <div className="space-y-3 pb-8">
                {results.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass rounded-xl p-4 border border-border/50 hover:border-cyan/20 transition-colors"
                  >
                    <p className="font-playfair text-base text-foreground leading-relaxed mb-3">
                      {v.text}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-cinzel text-gold">{v.ref || `${v.book} ${v.chapter}:${v.verse}`}</span>
                      <a
                        href={`/read?book=${v.book}&chapter=${v.chapter}`}
                        className="flex items-center gap-1 text-xs text-cyan hover:text-cyan/80 transition-colors"
                      >
                        <BookOpen className="w-3 h-3" /> Read
                      </a>
                    </div>
                    {v.relevance && (
                      <p className="text-xs text-muted-foreground mt-2 italic">{v.relevance}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}