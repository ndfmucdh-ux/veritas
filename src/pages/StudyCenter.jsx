import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { BIBLE_BOOKS } from "@/lib/bibleData";

export default function StudyCenter() {
  const [selectedBook, setSelectedBook] = useState("John");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [outline, setOutline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [depth, setDepth] = useState("overview");
  const [expandedCategory, setExpandedCategory] = useState("Gospels");

  const loadOutline = async (book) => {
    setLoading(true);
    setOutline(null);
    try {
      const res = await base44.functions.invoke("generateBibleOutline", {
        book,
        depth
      });
      const outlineData = res.data?.outline?.response || res.data?.outline;
      setOutline(outlineData);
    } catch (err) {
      console.error("Error loading outline:", err);
      setOutline(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOutline(selectedBook);
  }, [selectedBook, depth]);

  const theologicalGroups = [
    { id: "Pentateuch", name: "📖 The Law (Pentateuch)", books: BIBLE_BOOKS.filter(b => [1,2,3,4,5].includes(b.num)) },
    { id: "Historical", name: "⚔️ Historical Books", books: BIBLE_BOOKS.filter(b => [6,7,8,9,10,11,12,13,14,15,16,17].includes(b.num)) },
    { id: "Wisdom", name: "💎 Wisdom & Poetry", books: BIBLE_BOOKS.filter(b => [18,19,20,21,22].includes(b.num)) },
    { id: "Prophetic", name: "🔥 Major Prophets", books: BIBLE_BOOKS.filter(b => [23,24,25,26,27].includes(b.num)) },
    { id: "MinorProphets", name: "⚡ Minor Prophets", books: BIBLE_BOOKS.filter(b => [28,29,30,31,32,33,34,35,36,37,38,39].includes(b.num)) },
    { id: "Gospels", name: "✝️ The Gospels", books: BIBLE_BOOKS.filter(b => [40,41,42,43].includes(b.num)) },
    { id: "Acts", name: "🌍 Acts & Epistles", books: BIBLE_BOOKS.filter(b => [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65].includes(b.num)) },
    { id: "Revelation", name: "👑 Revelation", books: BIBLE_BOOKS.filter(b => b.num === 66) }
  ];

  const depths = [
    { id: "overview", label: "Overview", icon: "📄" },
    { id: "detailed", label: "Detailed", icon: "📖" },
    { id: "advanced", label: "Advanced", icon: "🎓" }
  ];

  return (
    <div className="md:ml-16 min-h-screen pb-28 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto pt-6 mb-8">
        <h1 className="font-cinzel text-2xl font-bold text-white mb-2">Study Center</h1>
        <p className="text-sm text-white/50">Deep dive into scripture with AI-powered analysis</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Book selector - Theological organization with BIG mobile buttons */}
        <div className="rounded-2xl p-4 md:p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-4 text-white/40">Books of the Bible</p>
          <div className="space-y-3">
            {theologicalGroups.map(group => (
              <div key={group.id}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExpandedCategory(expandedCategory === group.id ? null : group.id)}
                  className="w-full flex items-center gap-2 px-3 py-3 md:py-2 rounded-lg transition-all text-left"
                  style={{
                    background: expandedCategory === group.id ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.05)",
                    borderLeft: expandedCategory === group.id ? "2px solid #00f5ff" : "2px solid transparent"
                  }}
                >
                  <ChevronDown
                    className="w-4 h-4 md:w-3.5 md:h-3.5 flex-shrink-0"
                    style={{
                      color: expandedCategory === group.id ? "#00f5ff" : "rgba(255,255,255,0.3)",
                      transform: expandedCategory === group.id ? "rotate(0deg)" : "rotate(-90deg)",
                      transition: "transform 0.2s"
                    }}
                  />
                  <span className="text-sm md:text-xs font-cinzel text-white flex-1">{group.name}</span>
                </motion.button>

                <AnimatePresence>
                  {expandedCategory === group.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pl-4 md:pl-6">
                        {group.books.map(book => (
                          <motion.button
                            key={book.name}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedBook(book.name);
                              setSelectedChapter(1);
                            }}
                            className="py-3 md:py-1.5 px-2 rounded-lg text-sm md:text-[10px] font-cinzel transition-all text-center font-semibold"
                            style={{
                              background: selectedBook === book.name ? "rgba(0,245,255,0.25)" : "rgba(255,255,255,0.08)",
                              color: selectedBook === book.name ? "#00f5ff" : "rgba(255,255,255,0.5)",
                              border: selectedBook === book.name ? "2px solid rgba(0,245,255,0.4)" : "1px solid rgba(255,255,255,0.1)"
                            }}
                          >
                            {book.abbr}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Chapter/Verse selector */}
        {selectedBook && (
          <div className="rounded-2xl p-4 md:p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3 text-white/40">Chapters</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {Array.from({ length: BIBLE_BOOKS.find(b => b.name === selectedBook)?.chapters || 1 }, (_, i) => i + 1).map(ch => (
                <motion.button
                  key={ch}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedChapter(ch)}
                  className="py-2 px-1 rounded-lg text-xs md:text-[10px] font-cinzel transition-all font-semibold"
                  style={{
                    background: selectedChapter === ch ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.06)",
                    color: selectedChapter === ch ? "#fbbf24" : "rgba(255,255,255,0.4)",
                    border: selectedChapter === ch ? "1px solid rgba(251,191,36,0.3)" : "1px solid transparent"
                  }}
                >
                  {ch}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Depth selector */}
        <div className="flex gap-2">
          {depths.map(d => (
            <motion.button
              key={d.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDepth(d.id)}
              className="flex-1 py-3 rounded-xl text-xs md:text-sm font-cinzel transition-all font-semibold"
              style={{
                background: depth === d.id ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)",
                color: depth === d.id ? "#00f5ff" : "rgba(255,255,255,0.4)",
                border: depth === d.id ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent"
              }}
            >
              {d.icon} {d.label}
            </motion.button>
          ))}
        </div>

        {/* Outline display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan mb-3" />
            <p className="text-sm text-white/60">Analyzing {selectedBook} Chapter {selectedChapter}...</p>
            <p className="text-xs text-white/30 mt-2">This may take a moment</p>
          </div>
        ) : outline ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="rounded-2xl p-6" style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.15)" }}>
              <h2 className="font-cinzel text-lg text-white mb-4">{outline.book}</h2>
              
              {outline.themes && (
                <div className="mb-6">
                  <p className="text-xs font-cinzel text-white/60 mb-2">THEMES</p>
                  <div className="flex flex-wrap gap-2">
                    {outline.themes?.map(theme => (
                      <span key={theme} className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff" }}>
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {outline.sections?.map((section, idx) => (
                <div key={idx} className="mb-4 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <p className="font-cinzel text-white mb-2">{section.title}</p>
                  <p className="text-xs text-white/50 leading-relaxed mb-2">{section.summary}</p>
                  {section.key_verses?.length > 0 && (
                    <div className="text-[10px] text-white/40">
                      <p className="font-inter font-semibold mb-1">Key verses:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {section.key_verses.map(v => <li key={v}>{v}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

              {outline.theology && (
                <div>
                  <p className="text-xs font-cinzel text-white/60 mb-2">THEOLOGICAL SIGNIFICANCE</p>
                  <p className="text-xs leading-relaxed text-white/60">{outline.theology}</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}