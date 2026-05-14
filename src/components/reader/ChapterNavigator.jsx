import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import { BIBLE_BOOKS, TRANSLATIONS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

const CATEGORY_STYLE = {
  "Law":          { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  img: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70" },
  "History":      { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70" },
  "Wisdom":       { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", img: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=70" },
  "Prophecy":     { color: "#34d399", bg: "rgba(52,211,153,0.12)",  img: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=70" },
  "Major Prophets": { color: "#34d399", bg: "rgba(52,211,153,0.12)", img: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=70" },
  "Minor Prophets": { color: "#86efac", bg: "rgba(134,239,172,0.12)", img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70" },
  "Gospels":      { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  img: "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70" },
  "Acts":         { color: "#f97316", bg: "rgba(249,115,22,0.12)",  img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70" },
  "Epistles":     { color: "#00f5ff", bg: "rgba(0,245,255,0.12)",   img: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70" },
  "Pauline":      { color: "#00f5ff", bg: "rgba(0,245,255,0.12)",   img: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70" },
  "General Epistles": { color: "#7dd3fc", bg: "rgba(125,211,252,0.12)", img: "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=400&q=70" },
  "Revelation":   { color: "#f472b6", bg: "rgba(244,114,182,0.12)", img: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=400&q=70" },
  "Apocalyptic":  { color: "#f472b6", bg: "rgba(244,114,182,0.12)", img: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=400&q=70" },
};

function getBookStyle(book) {
  const cat = book.category || book.testament || "History";
  return CATEGORY_STYLE[cat] || { color: "#00f5ff", bg: "rgba(0,245,255,0.1)", img: null };
}

// Groups books by their category/genre
function groupBooks(books) {
  const groups = {};
  books.forEach(b => {
    const key = b.category || (b.testament === "OT" ? "History" : "Epistles");
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  });
  return groups;
}

export default function ChapterNavigator({ book, chapter, translation, onNavigate, onTranslationChange }) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("books"); // "books" | "chapters" | "translation"
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookSearch, setBookSearch] = useState("");
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 320 });
  const triggerRef = useRef(null);

  const bookData = BIBLE_BOOKS.find(b => b.name === book);
  const totalChapters = bookData?.chapters || 1;

  const canPrev = chapter > 1 || BIBLE_BOOKS.findIndex(b => b.name === book) > 0;
  const canNext = chapter < totalChapters || BIBLE_BOOKS.findIndex(b => b.name === book) < BIBLE_BOOKS.length - 1;

  const prevChapter = () => {
    if (chapter > 1) { onNavigate(book, chapter - 1); }
    else {
      const idx = BIBLE_BOOKS.findIndex(b => b.name === book);
      if (idx > 0) { const pb = BIBLE_BOOKS[idx - 1]; onNavigate(pb.name, pb.chapters); }
    }
  };

  const nextChapter = () => {
    if (chapter < totalChapters) { onNavigate(book, chapter + 1); }
    else {
      const idx = BIBLE_BOOKS.findIndex(b => b.name === book);
      if (idx < BIBLE_BOOKS.length - 1) { onNavigate(BIBLE_BOOKS[idx + 1].name, 1); }
    }
  };

  const openMenu = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuW = Math.min(360, window.innerWidth - 24);
      let left = rect.left;
      if (left + menuW > window.innerWidth - 12) left = window.innerWidth - menuW - 12;
      setMenuPos({ top: rect.bottom + 6, left: Math.max(12, left), width: menuW });
    }
    setStep("books");
    setSelectedBook(null);
    setBookSearch("");
    setOpen(true);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        const menu = document.getElementById("chapter-nav-menu");
        if (!menu || !menu.contains(e.target)) setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filteredBooks = BIBLE_BOOKS.filter(b =>
    getTranslatedBookName(b.name, lang).toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.name.toLowerCase().includes(bookSearch.toLowerCase())
  );
  const groups = groupBooks(filteredBooks);

  const displayBook = getTranslatedBookName(book, lang);

  const menu = open && ReactDOM.createPortal(
    <motion.div
      id="chapter-nav-menu"
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: menuPos.top,
        left: menuPos.left,
        width: menuPos.width,
        zIndex: 9999,
        background: "rgba(6,9,20,0.98)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20,
        boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
        backdropFilter: "blur(24px)",
        maxHeight: "70vh",
        overflowY: "auto",
      }}
    >
      {/* Header tabs */}
      <div className="sticky top-0 z-10 flex gap-1 p-3 pb-2"
        style={{ background: "rgba(6,9,20,0.98)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {["books","chapters","translation"].map(s => (
          <button key={s} onClick={() => setStep(s)}
            className="flex-1 py-1.5 rounded-xl font-cinzel text-[10px] uppercase tracking-wider transition-all"
            style={{
              background: step === s ? "rgba(0,245,255,0.12)" : "transparent",
              color: step === s ? "#00f5ff" : "rgba(255,255,255,0.3)",
              border: step === s ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent",
            }}>
            {s === "books" ? "Book" : s === "chapters" ? "Chapter" : "Version"}
          </button>
        ))}
      </div>

      <div className="p-3 pt-2">
        {/* ── BOOKS ── */}
        {step === "books" && (
          <>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input value={bookSearch} onChange={e => setBookSearch(e.target.value)}
                placeholder="Search book…"
                className="flex-1 bg-transparent text-sm font-inter focus:outline-none"
                style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)" }} />
            </div>
            {Object.entries(groups).map(([groupName, books]) => {
              const style = CATEGORY_STYLE[groupName] || { color: "#00f5ff", bg: "rgba(0,245,255,0.1)", img: null };
              return (
                <div key={groupName} className="mb-4">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    {style.img && (
                      <div className="w-5 h-5 rounded-md overflow-hidden flex-shrink-0">
                        <img src={style.img} alt="" className="w-full h-full object-cover" style={{ opacity: 0.7 }} />
                      </div>
                    )}
                    <p className="text-[9px] font-cinzel uppercase tracking-[0.2em]"
                      style={{ color: style.color }}>{groupName}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {books.map(b => {
                      const bStyle = getBookStyle(b);
                      const isActive = b.name === book;
                      return (
                        <button key={b.name}
                          onClick={() => { setSelectedBook(b); setStep("chapters"); }}
                          className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-end pb-2 pt-0"
                          style={{
                            aspectRatio: "1/1.1",
                            background: bStyle.bg,
                            border: isActive ? `2px solid ${bStyle.color}` : "1px solid rgba(255,255,255,0.07)",
                            boxShadow: isActive ? `0 0 16px ${bStyle.color}40` : "none",
                          }}>
                          {bStyle.img && (
                            <img src={bStyle.img} alt="" className="absolute inset-0 w-full h-full object-cover"
                              style={{ opacity: isActive ? 0.35 : 0.18 }} />
                          )}
                          <span className="relative z-10 font-cinzel text-[9px] font-semibold text-center leading-tight px-1"
                            style={{ color: isActive ? bStyle.color : "rgba(255,255,255,0.7)" }}>
                            {getTranslatedBookName(b.name, lang)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── CHAPTERS ── */}
        {step === "chapters" && (
          <>
            {selectedBook && (
              <div className="mb-3">
                <button onClick={() => setStep("books")}
                  className="text-xs font-cinzel flex items-center gap-1 mb-2"
                  style={{ color: "#fbbf24" }}>
                  ← {lang === "es" ? "Volver" : "Back"}
                </button>
                <p className="text-sm font-cinzel font-semibold text-white mb-1">
                  {getTranslatedBookName(selectedBook.name, lang)}
                </p>
              </div>
            )}
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: (selectedBook || bookData)?.chapters || totalChapters }, (_, i) => i + 1).map(ch => {
                const isActive = (selectedBook ? selectedBook.name === book : true) && ch === chapter;
                return (
                  <button key={ch}
                    onClick={() => {
                      onNavigate(selectedBook ? selectedBook.name : book, ch);
                      setOpen(false);
                    }}
                    className="aspect-square rounded-xl flex items-center justify-center font-cinzel text-xs transition-all"
                    style={{
                      background: isActive ? "rgba(0,245,255,0.18)" : "rgba(255,255,255,0.05)",
                      color: isActive ? "#00f5ff" : "rgba(255,255,255,0.55)",
                      border: isActive ? "1px solid rgba(0,245,255,0.4)" : "1px solid rgba(255,255,255,0.07)",
                      fontWeight: isActive ? 700 : 400,
                    }}>
                    {ch}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── TRANSLATION ── */}
        {step === "translation" && (
          <div className="space-y-1.5">
            {(TRANSLATIONS || []).map(tr => {
              const isActive = tr.code === translation;
              return (
                <button key={tr.code}
                  onClick={() => { onTranslationChange?.(tr.code); setOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-inter transition-all"
                  style={{
                    background: isActive ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.03)",
                    color: isActive ? "#fbbf24" : "rgba(255,255,255,0.6)",
                    border: isActive ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  }}>
                  <span className="font-cinzel font-bold">{tr.code}</span>
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{tr.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>,
    document.body
  );

  return (
    <div className="flex items-center gap-2">
      {/* Prev */}
      <button onClick={prevChapter} disabled={!canPrev}
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: "rgba(255,255,255,0.05)",
          color: canPrev ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Book + Chapter trigger */}
      <button ref={triggerRef} onClick={openMenu}
        className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl transition-all"
        style={{
          background: open ? "rgba(0,245,255,0.08)" : "rgba(255,255,255,0.05)",
          border: open ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.85)",
        }}>
        <span className="font-cinzel text-sm font-semibold truncate">{displayBook} {chapter}</span>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <span className="text-[10px] font-cinzel px-1.5 py-0.5 rounded-md"
            style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
            {translation}
          </span>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </div>
      </button>

      {/* Next */}
      <button onClick={nextChapter} disabled={!canNext}
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: "rgba(255,255,255,0.05)",
          color: canNext ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        <ChevronRight className="w-4 h-4" />
      </button>

      <AnimatePresence>{open && menu}</AnimatePresence>
    </div>
  );
}