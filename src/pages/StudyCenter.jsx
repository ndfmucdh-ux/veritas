import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, BookMarked, Zap, Loader2, ChevronRight, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { BIBLE_BOOKS } from "@/lib/bibleData";

export default function StudyCenter() {
  const [selectedBook, setSelectedBook] = useState("John");
  const [outline, setOutline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [depth, setDepth] = useState("overview");
  const [notes, setNotes] = useState([]);

  const loadOutline = async (book) => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateBibleOutline", {
        book,
        depth
      });
      setOutline(res.data.outline);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOutline(selectedBook);
  }, [depth]);

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
        {/* Book selector */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3 text-white/40">Select Book</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {BIBLE_BOOKS.map(book => (
              <motion.button
                key={book.name}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedBook(book.name);
                  loadOutline(book.name);
                }}
                className="py-2 px-2 rounded-lg text-xs font-cinzel transition-all text-center"
                style={{
                  background: selectedBook === book.name ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)",
                  color: selectedBook === book.name ? "#00f5ff" : "rgba(255,255,255,0.4)",
                  border: selectedBook === book.name ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent"
                }}
              >
                {book.abbr}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Depth selector */}
        <div className="flex gap-2">
          {depths.map(d => (
            <motion.button
              key={d.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDepth(d.id)}
              className="flex-1 py-3 rounded-xl text-xs font-cinzel transition-all"
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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-cyan" />
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