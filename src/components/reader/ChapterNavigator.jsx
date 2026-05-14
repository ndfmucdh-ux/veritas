import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BIBLE_BOOKS, TRANSLATIONS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

const GROUPS = [
  { id: "Law",        label: "The Law",           emoji: "📜", color: "#f59e0b", books: [1,2,3,4,5] },
  { id: "History",    label: "Historical Books",  emoji: "⚔️",  color: "#ef4444", books: [6,7,8,9,10,11,12,13,14,15,16,17] },
  { id: "Wisdom",     label: "Wisdom & Poetry",   emoji: "💎", color: "#8b5cf6", books: [18,19,20,21,22] },
  { id: "MajorProp",  label: "Major Prophets",    emoji: "🔥", color: "#f97316", books: [23,24,25,26,27] },
  { id: "MinorProp",  label: "Minor Prophets",    emoji: "⚡", color: "#eab308", books: [28,29,30,31,32,33,34,35,36,37,38,39] },
  { id: "Gospels",    label: "The Gospels",        emoji: "✝️",  color: "#00f5ff", books: [40,41,42,43] },
  { id: "Epistles",   label: "Acts & Epistles",   emoji: "🌍", color: "#34d399", books: [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65] },
  { id: "Revelation", label: "Revelation",         emoji: "👑", color: "#a78bfa", books: [66] },
];

export default function ChapterNavigator({ book, chapter, translation, onNavigate, onTranslationChange }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [expandedBook, setExpandedBook] = useState(null); // book name whose chapters are shown
  const [expandedChapter, setExpandedChapter] = useState(null); // chapter number whose verses are shown
  const [verseCount, setVerseCount] = useState(0);
  const [bookSearch, setBookSearch] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const containerRef = useRef(null);

  // Sync open book/chapter when props change externally
  useEffect(() => {
    setExpandedBook(null);
    setExpandedChapter(null);
  }, [book, chapter]);

  // Auto-expand the current book's group when panel opens
  useEffect(() => {
    if (open) {
      const num = BIBLE_BOOKS.find(b => b.name === book)?.num;
      if (num) {
        const g = GROUPS.find(g => g.books.includes(num));
        if (g) setExpandedGroup(g.id);
      }
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open && !showTranslation) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setShowTranslation(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open, showTranslation]);

  const bookData = BIBLE_BOOKS.find(b => b.name === book);
  const totalChapters = bookData?.chapters || 1;
  const displayBook = getTranslatedBookName(book, lang);

  const goTo = (newBook, newChapter) => {
    onNavigate(newBook, newChapter);
    setOpen(false);
    setShowTranslation(false);
    setBookSearch("");
    setExpandedBook(null);
    setExpandedChapter(null);
  };

  const prevChapter = (e) => {
    e.stopPropagation();
    if (chapter > 1) { goTo(book, chapter - 1); }
    else {
      const idx = BIBLE_BOOKS.findIndex(b => b.name === book);
      if (idx > 0) { const prev = BIBLE_BOOKS[idx - 1]; goTo(prev.name, prev.chapters); }
    }
  };

  const nextChapter = (e) => {
    e.stopPropagation();
    if (chapter < totalChapters) { goTo(book, chapter + 1); }
    else {
      const idx = BIBLE_BOOKS.findIndex(b => b.name === book);
      if (idx < BIBLE_BOOKS.length - 1) { goTo(BIBLE_BOOKS[idx + 1].name, 1); }
    }
  };

  const handleBookPill = (bName) => {
    if (expandedBook === bName) {
      setExpandedBook(null);
      setExpandedChapter(null);
    } else {
      setExpandedBook(bName);
      setExpandedChapter(null);
    }
  };

  const handleChapterSquare = (ch) => {
    if (expandedChapter === ch) {
      setExpandedChapter(null);
    } else {
      setExpandedChapter(ch);
      // Figure out verse count for this book+chapter
      const bd = BIBLE_BOOKS.find(b => b.name === expandedBook);
      // Approximation: use a rough verse count; we'll let user pick from 1..N
      // We don't have exact verse counts per chapter, so we show 1-40 and users navigate
      setVerseCount(40);
    }
  };

  const filteredGroups = bookSearch.trim()
    ? GROUPS.map(g => ({
        ...g,
        matchedBooks: BIBLE_BOOKS.filter(b =>
          g.books.includes(b.num) &&
          getTranslatedBookName(b.name, lang).toLowerCase().includes(bookSearch.toLowerCase())
        )
      })).filter(g => g.matchedBooks.length > 0)
    : GROUPS.map(g => ({ ...g, matchedBooks: BIBLE_BOOKS.filter(b => g.books.includes(b.num)) }));

  const currentGroup = GROUPS.find(g => {
    const num = BIBLE_BOOKS.find(b => b.name === book)?.num;
    return num && g.books.includes(num);
  });

  return (
    <div ref={containerRef} className="relative">
      {/* ── Nav bar ── */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={prevChapter}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-all"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => { setOpen(v => !v); setShowTranslation(false); }}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-cinzel font-bold transition-all"
          style={{
            background: open ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.06)",
            color: open ? "#00f5ff" : "rgba(255,255,255,0.9)",
            border: open ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
            fontSize: "clamp(14px, 3.5vw, 17px)",
          }}
        >
          <span>{displayBook}</span>
          <span style={{ color: open ? "rgba(0,245,255,0.55)" : "rgba(255,255,255,0.4)", fontSize: "0.85em" }}>{chapter}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
          </motion.div>
        </button>

        {onTranslationChange && (
          <button
            onClick={() => { setShowTranslation(v => !v); setOpen(false); }}
            className="px-3.5 h-12 rounded-xl font-cinzel text-sm font-bold flex-shrink-0 transition-all"
            style={{
              background: showTranslation ? "rgba(0,245,255,0.18)" : "rgba(0,245,255,0.08)",
              color: "#00f5ff",
              border: "1px solid rgba(0,245,255,0.2)"
            }}
          >
            {translation}
          </button>
        )}

        <button
          onClick={nextChapter}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-all"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── Main Navigator Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.97 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 right-0 top-full mt-2 z-[9999] rounded-2xl overflow-hidden"
            style={{
              background: "rgba(7,11,22,0.98)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(0,245,255,0.15)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.85)",
              maxHeight: "72vh",
              overflowY: "auto",
            }}
          >
            {/* Search bar */}
            <div className="sticky top-0 z-10 px-3 pt-3 pb-2.5"
              style={{ background: "rgba(7,11,22,0.98)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
                <input
                  value={bookSearch}
                  onChange={e => setBookSearch(e.target.value)}
                  placeholder="Search books…"
                  className="flex-1 bg-transparent font-inter focus:outline-none"
                  style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}
                />
                {bookSearch && (
                  <button onClick={() => setBookSearch("")} style={{ color: "rgba(255,255,255,0.3)" }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Theological Groups */}
            <div className="px-3 pb-4 space-y-1">
              {filteredGroups.map(group => {
                const isExpGroup = bookSearch.trim() ? true : expandedGroup === group.id;
                return (
                  <div key={group.id}>
                    {/* Group header */}
                    {!bookSearch.trim() && (
                      <button
                        onClick={() => setExpandedGroup(isExpGroup ? null : group.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl mt-1 transition-all"
                        style={{
                          background: isExpGroup ? `${group.color}10` : "transparent",
                          borderLeft: isExpGroup ? `2px solid ${group.color}` : "2px solid transparent",
                        }}
                      >
                        <span className="text-base leading-none">{group.emoji}</span>
                        <span className="font-cinzel text-xs font-semibold flex-1 text-left tracking-wide"
                          style={{ color: isExpGroup ? group.color : "rgba(255,255,255,0.5)" }}>
                          {group.label}
                        </span>
                        <motion.div animate={{ rotate: isExpGroup ? 180 : 0 }} transition={{ duration: 0.18 }}>
                          <ChevronDown className="w-3.5 h-3.5" style={{ color: isExpGroup ? group.color : "rgba(255,255,255,0.2)" }} />
                        </motion.div>
                      </button>
                    )}

                    {/* Book pills — 5 per row */}
                    <AnimatePresence>
                      {isExpGroup && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="grid gap-1.5 pt-1.5 pb-2 px-1"
                            style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                            {group.matchedBooks.map(b => {
                              const isCurrentBook = b.name === book;
                              const isExpanded = expandedBook === b.name;
                              const shortName = getTranslatedBookName(b.name, lang);
                              // Abbreviate: up to 4 chars for very short display
                              const abbr = shortName.length > 6 ? shortName.substring(0, 5) + "." : shortName;

                              return (
                                <div key={b.name}>
                                  {/* Book pill */}
                                  <motion.button
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => handleBookPill(b.name)}
                                    className="w-full py-3 px-1 rounded-r-full rounded-l-lg font-cinzel font-semibold transition-all flex flex-col items-center justify-center gap-0.5"
                                    style={{
                                      background: isCurrentBook
                                        ? `${group.color}22`
                                        : isExpanded
                                        ? `${group.color}14`
                                        : "rgba(255,255,255,0.04)",
                                      color: isCurrentBook
                                        ? group.color
                                        : isExpanded
                                        ? `${group.color}cc`
                                        : "rgba(255,255,255,0.55)",
                                      border: isCurrentBook
                                        ? `1px solid ${group.color}50`
                                        : isExpanded
                                        ? `1px solid ${group.color}30`
                                        : "1px solid rgba(255,255,255,0.07)",
                                      boxShadow: isCurrentBook ? `0 0 14px ${group.color}22` : "none",
                                      fontSize: "clamp(9px, 2.2vw, 11px)",
                                      minHeight: "48px",
                                    }}
                                  >
                                    <span className="text-center leading-tight">{abbr}</span>
                                    {isCurrentBook && (
                                      <span className="w-1 h-1 rounded-full mt-0.5" style={{ background: group.color }} />
                                    )}
                                  </motion.button>
                                </div>
                              );
                            })}
                          </div>

                          {/* Chapter squares for expanded book — inline below its row */}
                          <AnimatePresence>
                            {expandedBook && group.matchedBooks.some(b => b.name === expandedBook) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden mx-1 mb-2"
                              >
                                <div className="rounded-2xl p-3"
                                  style={{
                                    background: "rgba(0,0,0,0.35)",
                                    border: `1px solid ${group.color}25`,
                                    boxShadow: `inset 0 1px 0 ${group.color}15`,
                                  }}>
                                  <p className="text-[9px] font-cinzel uppercase tracking-[0.2em] mb-2.5 px-1"
                                    style={{ color: `${group.color}99` }}>
                                    {getTranslatedBookName(expandedBook, lang)} — Select Chapter
                                  </p>
                                  {/* 8 per row chapter grid */}
                                  <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
                                    {Array.from({ length: BIBLE_BOOKS.find(b => b.name === expandedBook)?.chapters || 1 }, (_, i) => i + 1).map(ch => {
                                      const isActiveCh = expandedBook === book && ch === chapter;
                                      const isExpCh = expandedChapter === ch;
                                      return (
                                        <motion.button
                                          key={ch}
                                          whileTap={{ scale: 0.85 }}
                                          onClick={() => {
                                            if (expandedChapter === ch) {
                                              // Direct navigate on second tap
                                              goTo(expandedBook, ch);
                                            } else {
                                              handleChapterSquare(ch);
                                            }
                                          }}
                                          className="aspect-square rounded-lg flex items-center justify-center font-cinzel font-bold transition-all"
                                          style={{
                                            background: isActiveCh
                                              ? `${group.color}30`
                                              : isExpCh
                                              ? `${group.color}20`
                                              : "rgba(255,255,255,0.05)",
                                            color: isActiveCh
                                              ? group.color
                                              : isExpCh
                                              ? `${group.color}cc`
                                              : "rgba(255,255,255,0.5)",
                                            border: isActiveCh
                                              ? `1px solid ${group.color}60`
                                              : isExpCh
                                              ? `1px solid ${group.color}35`
                                              : "1px solid rgba(255,255,255,0.07)",
                                            boxShadow: isActiveCh
                                              ? `0 0 12px ${group.color}33`
                                              : isExpCh
                                              ? `0 0 8px ${group.color}20`
                                              : "none",
                                            fontSize: "clamp(10px, 2.8vw, 13px)",
                                            minHeight: "36px",
                                          }}
                                        >
                                          {ch}
                                        </motion.button>
                                      );
                                    })}
                                  </div>

                                  {/* Verse list for expanded chapter */}
                                  <AnimatePresence>
                                    {expandedChapter && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                                        className="overflow-hidden mt-2.5"
                                      >
                                        <div className="rounded-xl p-2.5"
                                          style={{
                                            background: "rgba(0,0,0,0.4)",
                                            border: `1px solid ${group.color}20`,
                                          }}>
                                          <div className="flex items-center justify-between mb-2 px-1">
                                            <p className="text-[9px] font-cinzel uppercase tracking-widest"
                                              style={{ color: `${group.color}88` }}>
                                              {getTranslatedBookName(expandedBook, lang)} {expandedChapter} — Verses
                                            </p>
                                            <button
                                              onClick={() => goTo(expandedBook, expandedChapter)}
                                              className="text-[9px] font-cinzel px-2 py-0.5 rounded-full transition-all"
                                              style={{
                                                background: `${group.color}20`,
                                                color: group.color,
                                                border: `1px solid ${group.color}30`
                                              }}>
                                              Open →
                                            </button>
                                          </div>
                                          <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
                                            {Array.from({ length: 40 }, (_, i) => i + 1).map(v => {
                                              const isActiveV = expandedBook === book && expandedChapter === chapter && v === chapter;
                                              return (
                                                <motion.button
                                                  key={v}
                                                  whileTap={{ scale: 0.82 }}
                                                  onClick={() => {
                                                    goTo(expandedBook, expandedChapter);
                                                    // After navigation, scroll to verse
                                                    setTimeout(() => {
                                                      const el = document.getElementById(`verse-${v}`);
                                                      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                                                    }, 600);
                                                  }}
                                                  className="aspect-square rounded-md flex items-center justify-center font-inter font-medium transition-all"
                                                  style={{
                                                    background: "rgba(255,255,255,0.04)",
                                                    color: "rgba(255,255,255,0.45)",
                                                    border: "1px solid rgba(255,255,255,0.06)",
                                                    fontSize: "clamp(9px, 2.5vw, 11px)",
                                                    minHeight: "28px",
                                                  }}
                                                >
                                                  {v}
                                                </motion.button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Translation Panel ── */}
      <AnimatePresence>
        {showTranslation && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 z-[9999] rounded-2xl overflow-hidden"
            style={{
              background: "rgba(7,11,22,0.98)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(0,245,255,0.15)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.85)",
              width: "280px",
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            <div className="p-3 space-y-4">
              {["en", "es", "pt", "fr", "it"].map(l => {
                const langTranslations = TRANSLATIONS.filter(t => t.lang === l);
                if (!langTranslations.length) return null;
                const flags = { en: "🇬🇧", es: "🇲🇽", pt: "🇧🇷", fr: "🇫🇷", it: "🇮🇹" };
                return (
                  <div key={l}>
                    <p className="text-[9px] font-cinzel uppercase tracking-widest px-1 mb-2"
                      style={{ color: "rgba(255,255,255,0.25)" }}>
                      {flags[l]} {l.toUpperCase()}
                    </p>
                    <div className="space-y-1">
                      {langTranslations.map(t => (
                        <button
                          key={t.code}
                          onClick={() => { onTranslationChange?.(t.code); setShowTranslation(false); }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all"
                          style={{
                            background: translation === t.code ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.03)",
                            border: translation === t.code ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-cinzel text-xs font-bold"
                              style={{ color: translation === t.code ? "#00f5ff" : "rgba(255,255,255,0.8)" }}>
                              {t.code}
                            </span>
                            <span className="text-[10px] font-inter truncate"
                              style={{ color: "rgba(255,255,255,0.35)" }}>
                              {t.name}
                            </span>
                          </div>
                          {translation === t.code && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#00f5ff" }} />}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}