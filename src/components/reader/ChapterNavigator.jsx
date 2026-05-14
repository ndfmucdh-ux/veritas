import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Search, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import { BIBLE_BOOKS, TRANSLATIONS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

export default function ChapterNavigator({ book, chapter, translation, onNavigate, onTranslationChange }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("books"); // "books" | "chapters" | "translation"
  const [pendingBook, setPendingBook] = useState(null);
  const [bookSearch, setBookSearch] = useState("");
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 340 });
  const triggerRef = useRef(null);

  const bookData = BIBLE_BOOKS.find(b => b.name === book);
  const totalChapters = bookData?.chapters || 1;
  const bookIdx = BIBLE_BOOKS.findIndex(b => b.name === book);

  const prevChapter = () => {
    if (chapter > 1) { onNavigate(book, chapter - 1); }
    else if (bookIdx > 0) { const pb = BIBLE_BOOKS[bookIdx - 1]; onNavigate(pb.name, pb.chapters); }
  };

  const nextChapter = () => {
    if (chapter < totalChapters) { onNavigate(book, chapter + 1); }
    else if (bookIdx < BIBLE_BOOKS.length - 1) { onNavigate(BIBLE_BOOKS[bookIdx + 1].name, 1); }
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
    setPendingBook(null);
    setBookSearch("");
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const menu = document.getElementById("chap-nav-portal");
      if (triggerRef.current?.contains(e.target) || menu?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const otBooks = BIBLE_BOOKS.filter(b => b.testament === "OT");
  const ntBooks = BIBLE_BOOKS.filter(b => b.testament === "NT");

  const filterBooks = (books) =>
    books.filter(b =>
      getTranslatedBookName(b.name, lang).toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.name.toLowerCase().includes(bookSearch.toLowerCase())
    );

  const displayBook = getTranslatedBookName(book, lang);
  const activeBookForChapters = pendingBook || bookData;

  const portal = open && ReactDOM.createPortal(
    <motion.div
      id="chap-nav-portal"
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
        boxShadow: "0 24px 64px rgba(0,0,0,0.85)",
        backdropFilter: "blur(24px)",
        maxHeight: "72vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Tabs */}
      <div className="flex gap-1 p-3 pb-2 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { key: "books", label: "Book" },
          { key: "chapters", label: "Chapter" },
          { key: "translation", label: "Version" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setStep(key)}
            className="flex-1 py-1.5 rounded-xl font-cinzel text-[10px] uppercase tracking-wider transition-all"
            style={{
              background: step === key ? "rgba(0,245,255,0.12)" : "transparent",
              color: step === key ? "#00f5ff" : "rgba(255,255,255,0.3)",
              border: step === key ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 p-3 pt-2">

        {/* ── BOOKS ── */}
        {step === "books" && (
          <>
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                value={bookSearch}
                onChange={e => setBookSearch(e.target.value)}
                placeholder="Search book…"
                className="flex-1 bg-transparent text-sm font-inter focus:outline-none"
                style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)" }}
                autoFocus
              />
            </div>

            {/* OT */}
            {filterBooks(otBooks).length > 0 && (
              <div className="mb-3">
                <p className="text-[9px] font-cinzel uppercase tracking-[0.2em] mb-2 px-1"
                  style={{ color: "rgba(251,191,36,0.5)" }}>Old Testament</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {filterBooks(otBooks).map(b => (
                    <button key={b.name}
                      onClick={() => { setPendingBook(b); setStep("chapters"); }}
                      className="px-2 py-2.5 rounded-xl text-left font-cinzel text-xs transition-all"
                      style={{
                        background: b.name === book ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.04)",
                        color: b.name === book ? "#fbbf24" : "rgba(255,255,255,0.65)",
                        border: b.name === book ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.07)",
                        fontWeight: b.name === book ? 700 : 400,
                      }}>
                      {getTranslatedBookName(b.name, lang)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* NT */}
            {filterBooks(ntBooks).length > 0 && (
              <div>
                <p className="text-[9px] font-cinzel uppercase tracking-[0.2em] mb-2 px-1"
                  style={{ color: "rgba(0,245,255,0.5)" }}>New Testament</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {filterBooks(ntBooks).map(b => (
                    <button key={b.name}
                      onClick={() => { setPendingBook(b); setStep("chapters"); }}
                      className="px-2 py-2.5 rounded-xl text-left font-cinzel text-xs transition-all"
                      style={{
                        background: b.name === book ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.04)",
                        color: b.name === book ? "#00f5ff" : "rgba(255,255,255,0.65)",
                        border: b.name === book ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.07)",
                        fontWeight: b.name === book ? 700 : 400,
                      }}>
                      {getTranslatedBookName(b.name, lang)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── CHAPTERS ── */}
        {step === "chapters" && activeBookForChapters && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setStep("books")}
                className="text-xs font-cinzel flex items-center gap-1"
                style={{ color: "#fbbf24" }}>
                ← Back
              </button>
              <span className="text-sm font-cinzel font-semibold text-white">
                {getTranslatedBookName(activeBookForChapters.name, lang)}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: activeBookForChapters.chapters }, (_, i) => i + 1).map(ch => {
                const isActive = activeBookForChapters.name === book && ch === chapter;
                return (
                  <button key={ch}
                    onClick={() => { onNavigate(activeBookForChapters.name, ch); setOpen(false); }}
                    className="aspect-square rounded-xl flex items-center justify-center font-cinzel text-xs transition-all"
                    style={{
                      background: isActive ? "rgba(0,245,255,0.18)" : "rgba(255,255,255,0.05)",
                      color: isActive ? "#00f5ff" : "rgba(255,255,255,0.6)",
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
            {TRANSLATIONS.map(tr => {
              const isActive = tr.code === translation;
              return (
                <button key={tr.code}
                  onClick={() => { onTranslationChange?.(tr.code); setOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                  style={{
                    background: isActive ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.03)",
                    border: isActive ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  }}>
                  <span className="font-cinzel text-sm font-bold" style={{ color: isActive ? "#fbbf24" : "rgba(255,255,255,0.75)" }}>
                    {tr.code}
                  </span>
                  <span className="text-[11px] font-inter truncate ml-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {tr.name}
                  </span>
                  {isActive && <Check className="w-3.5 h-3.5 flex-shrink-0 ml-2" style={{ color: "#fbbf24" }} />}
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
      <button onClick={prevChapter} disabled={bookIdx === 0 && chapter === 1}
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: "rgba(255,255,255,0.05)",
          color: (bookIdx === 0 && chapter === 1) ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Trigger button */}
      <button ref={triggerRef} onClick={openMenu}
        className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl transition-all"
        style={{
          background: open ? "rgba(0,245,255,0.08)" : "rgba(255,255,255,0.05)",
          border: open ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
        }}>
        <span className="font-cinzel text-sm font-semibold text-white truncate">
          {displayBook} {chapter}
        </span>
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          <span className="text-[10px] font-cinzel px-1.5 py-0.5 rounded-md"
            style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
            {translation}
          </span>
          <ChevronDown className="w-3.5 h-3.5" style={{
            color: "rgba(255,255,255,0.3)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }} />
        </div>
      </button>

      {/* Next */}
      <button onClick={nextChapter} disabled={bookIdx === BIBLE_BOOKS.length - 1 && chapter === totalChapters}
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: "rgba(255,255,255,0.05)",
          color: (bookIdx === BIBLE_BOOKS.length - 1 && chapter === totalChapters) ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        <ChevronRight className="w-4 h-4" />
      </button>

      <AnimatePresence>{portal}</AnimatePresence>
    </div>
  );
}