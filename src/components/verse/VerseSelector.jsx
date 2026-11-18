import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { BIBLE_BOOKS, getTranslatedBookName } from "@/lib/bibleData";
import { base44 } from "@/api/base44Client";

function BookIcon({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}

export default function VerseSelector({ onSelect, lang }) {
  const [open, setOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredBooks = BIBLE_BOOKS.filter(b =>
    getTranslatedBookName(b.name, lang).toLowerCase().includes(bookSearch.toLowerCase())
  );

  const fetchAndSelect = async (book, chapter, verse) => {
    setLoadingVerse(true);
    setOpen(false);
    try {
      const res = await base44.functions.invoke("getChapter", { book, chapter, translation: lang === "es" ? "RVR1960" : "KJV" });
      const v = res.data?.verses?.find(v => v.verse === verse);
      if (v) {
        const bookDisplay = getTranslatedBookName(book, lang);
        onSelect({ ref: `${bookDisplay} ${chapter}:${verse}`, text: v.text });
      }
    } finally {
      setLoadingVerse(false);
      setSelectedBook(null);
      setSelectedChapter(null);
    }
  };

  const bookData = selectedBook ? BIBLE_BOOKS.find(b => b.name === selectedBook) : null;
  const totalChapters = bookData?.chapters || 1;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-cinzel text-sm transition-all"
        style={{ background: "var(--fill-2)", border: "1px solid rgb(var(--ink) / 0.1)", color: "rgb(var(--ink) / 0.75)" }}>
        <span className="flex items-center gap-2">
          <BookIcon className="w-4 h-4" style={{ color: "#fbbf24" }} />
          {loadingVerse ? "Loading…" : lang === "es" ? "Seleccionar versículo…" : "Select a verse…"}
        </span>
        <ChevronDown className="w-4 h-4" style={{ color: "rgb(var(--ink) / 0.3)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden"
            style={{ background: "var(--popover-surface)", border: "1px solid rgba(251,191,36,0.2)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)", maxHeight: "60vh", overflowY: "auto" }}>

            <div className="sticky top-0 px-3 py-2.5" style={{ background: "var(--popover-surface)", borderBottom: "1px solid rgb(var(--ink) / 0.05)" }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--fill-3)" }}>
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgb(var(--ink) / 0.3)" }} />
                <input value={bookSearch} onChange={e => setBookSearch(e.target.value)}
                  placeholder={lang === "es" ? "Buscar libro…" : "Search book…"}
                  className="flex-1 bg-transparent text-sm font-inter focus:outline-none"
                  style={{ fontSize: "16px", color: "rgb(var(--ink) / 0.8)" }} />
              </div>
            </div>

            <div className="p-3">
              {!selectedBook && (
                <>
                  <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2 px-1" style={{ color: "rgb(var(--ink) / 0.25)" }}>
                    {lang === "es" ? "Libro" : "Book"}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {filteredBooks.map(b => (
                      <button key={b.name} onClick={() => { setSelectedBook(b.name); setBookSearch(""); }}
                        className="px-2 py-2 rounded-xl text-xs font-cinzel text-left transition-all"
                        style={{ background: "var(--fill-2)", color: "rgb(var(--ink) / 0.65)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
                        {getTranslatedBookName(b.name, lang)}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedBook && !selectedChapter && (
                <>
                  <button onClick={() => setSelectedBook(null)} className="flex items-center gap-1 text-xs font-cinzel mb-3" style={{ color: "#fbbf24" }}>
                    ← {lang === "es" ? "Volver" : "Back"}
                  </button>
                  <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2 px-1" style={{ color: "rgb(var(--ink) / 0.25)" }}>
                    {getTranslatedBookName(selectedBook, lang)} — {lang === "es" ? "Capítulo" : "Chapter"}
                  </p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: totalChapters }, (_, i) => i + 1).map(ch => (
                      <button key={ch} onClick={() => setSelectedChapter(ch)}
                        className="aspect-square rounded-xl text-xs font-cinzel flex items-center justify-center transition-all"
                        style={{ background: "var(--fill-2)", color: "rgb(var(--ink) / 0.6)", border: "1px solid rgb(var(--ink) / 0.08)" }}>
                        {ch}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedBook && selectedChapter && (
                <>
                  <button onClick={() => setSelectedChapter(null)} className="flex items-center gap-1 text-xs font-cinzel mb-3" style={{ color: "#fbbf24" }}>
                    ← {lang === "es" ? "Volver" : "Back"}
                  </button>
                  <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2 px-1" style={{ color: "rgb(var(--ink) / 0.25)" }}>
                    {getTranslatedBookName(selectedBook, lang)} {selectedChapter} — {lang === "es" ? "Versículo" : "Verse"}
                  </p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {Array.from({ length: 40 }, (_, i) => i + 1).map(v => (
                      <button key={v} onClick={() => fetchAndSelect(selectedBook, selectedChapter, v)}
                        className="aspect-square rounded-xl text-xs font-cinzel flex items-center justify-center transition-all"
                        style={{ background: "rgba(251,191,36,0.07)", color: "rgb(var(--ink) / 0.6)", border: "1px solid rgba(251,191,36,0.15)" }}>
                        {v}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}