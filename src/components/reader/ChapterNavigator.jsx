import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BIBLE_BOOKS, TRANSLATIONS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

const GROUPS = [
  {
    id: "Law", label: "The Law", labelEs: "La Ley", emoji: "📜", color: "#f59e0b",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=70",
    books: [1,2,3,4,5],
  },
  {
    id: "History", label: "Historical", labelEs: "Historia", emoji: "⚔️", color: "#ef4444",
    image: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=400&q=70",
    books: [6,7,8,9,10,11,12,13,14,15,16,17],
  },
  {
    id: "Wisdom", label: "Wisdom", labelEs: "Sabiduría", emoji: "💎", color: "#8b5cf6",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=70",
    books: [18,19,20,21,22],
  },
  {
    id: "MajorProp", label: "Prophets", labelEs: "Profetas", emoji: "🔥", color: "#f97316",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&q=70",
    books: [23,24,25,26,27],
  },
  {
    id: "MinorProp", label: "Minor Prop.", labelEs: "Men. Profetas", emoji: "⚡", color: "#eab308",
    image: "https://images.unsplash.com/photo-1475070929565-c985b496cb9f?w=400&q=70",
    books: [28,29,30,31,32,33,34,35,36,37,38,39],
  },
  {
    id: "Gospels", label: "Gospels", labelEs: "Evangelios", emoji: "✝️", color: "#00f5ff",
    image: "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=400&q=70",
    books: [40,41,42,43],
  },
  {
    id: "Epistles", label: "Epistles", labelEs: "Epístolas", emoji: "🌍", color: "#34d399",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=70",
    books: [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65],
  },
  {
    id: "Revelation", label: "Revelation", labelEs: "Apocalipsis", emoji: "👑", color: "#a78bfa",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70",
    books: [66],
  },
];

// Book-specific background images (semantic)
const BOOK_IMAGES = {
  Genesis: "https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=200&q=60",
  Exodus: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=200&q=60",
  Psalms: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=200&q=60",
  Proverbs: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=60",
  Isaiah: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=200&q=60",
  Jeremiah: "https://images.unsplash.com/photo-1569701813229-33284b643e3c?w=200&q=60",
  Matthew: "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=200&q=60",
  Mark: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=200&q=60",
  Luke: "https://images.unsplash.com/photo-1487088678257-3a541e6e3922?w=200&q=60",
  John: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=60",
  Acts: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=200&q=60",
  Romans: "https://images.unsplash.com/photo-1548092372-0d1bd40894a3?w=200&q=60",
  Revelation: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=60",
  Genesis2: "https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=200&q=60",
};
const DEFAULT_BOOK_IMG = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&q=60";

export default function ChapterNavigator({ book, chapter, translation, onNavigate, onTranslationChange }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [expandedBook, setExpandedBook] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [bookSearch, setBookSearch] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setExpandedBook(null);
    setExpandedChapter(null);
  }, [book, chapter]);

  useEffect(() => {
    if (open) {
      const num = BIBLE_BOOKS.find(b => b.name === book)?.num;
      if (num) {
        const g = GROUPS.find(g => g.books.includes(num));
        if (g) setExpandedGroup(g.id);
      }
    }
  }, [open]);

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

  const handleBookSelect = (bName) => {
    if (expandedBook === bName) {
      setExpandedBook(null);
      setExpandedChapter(null);
    } else {
      setExpandedBook(bName);
      setExpandedChapter(null);
    }
  };

  const handleChapterSelect = (ch) => {
    if (expandedChapter === ch) {
      goTo(expandedBook, ch);
    } else {
      setExpandedChapter(ch);
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

  const getGroupLabel = (group) => lang === "es" ? group.labelEs : group.label;

  const panelVariants = {
    hidden: { opacity: 0, y: -10, scaleY: 0.96, transformOrigin: "top" },
    visible: { opacity: 1, y: 0, scaleY: 1, transformOrigin: "top", transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -6, scaleY: 0.97, transformOrigin: "top", transition: { duration: 0.18 } },
  };

  const innerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.18 } },
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Nav bar */}
      <div className="flex items-center gap-1.5">
        <button onClick={prevChapter}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-all"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button onClick={() => { setOpen(v => !v); setShowTranslation(false); }}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-cinzel font-bold transition-all"
          style={{
            background: open ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.06)",
            color: open ? "#00f5ff" : "rgba(255,255,255,0.9)",
            border: open ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
            fontSize: "clamp(14px, 3.5vw, 17px)",
          }}>
          <span>{displayBook}</span>
          <span style={{ color: open ? "rgba(0,245,255,0.55)" : "rgba(255,255,255,0.4)", fontSize: "0.85em" }}>{chapter}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}>
            <ChevronDown className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
          </motion.div>
        </button>

        {onTranslationChange && (
          <button onClick={() => { setShowTranslation(v => !v); setOpen(false); }}
            className="px-3.5 h-12 rounded-xl font-cinzel text-sm font-bold flex-shrink-0 transition-all"
            style={{
              background: showTranslation ? "rgba(0,245,255,0.18)" : "rgba(0,245,255,0.08)",
              color: "#00f5ff",
              border: "1px solid rgba(0,245,255,0.2)"
            }}>
            {translation}
          </button>
        )}

        <button onClick={nextChapter}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-all"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigator Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={panelVariants}
            initial="hidden" animate="visible" exit="exit"
            className="absolute left-0 right-0 top-full mt-2 z-[9999] rounded-2xl overflow-hidden"
            style={{
              background: "rgba(6,9,20,0.99)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(0,245,255,0.13)",
              boxShadow: "0 28px 90px rgba(0,0,0,0.9)",
              maxHeight: "76vh",
              overflowY: "auto",
            }}>

            {/* Search */}
            <div className="sticky top-0 z-10 px-4 pt-4 pb-3"
              style={{ background: "rgba(6,9,20,0.99)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
                <input value={bookSearch} onChange={e => setBookSearch(e.target.value)}
                  placeholder={lang === "es" ? "Buscar libros…" : "Search books…"}
                  className="flex-1 bg-transparent font-inter focus:outline-none"
                  style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }} />
                {bookSearch && (
                  <button onClick={() => setBookSearch("")} style={{ color: "rgba(255,255,255,0.3)" }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Groups as image cards */}
            <div className="px-4 pb-4 pt-3">
              {!bookSearch.trim() && (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {GROUPS.map(group => {
                    const isActive = expandedGroup === group.id;
                    return (
                      <motion.button
                        key={group.id}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setExpandedGroup(isActive ? null : group.id)}
                        className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-end"
                        style={{ aspectRatio: "1/1.1", minHeight: 70 }}
                      >
                        {/* Background image */}
                        <img src={group.image} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.55 }} />
                        {/* Overlay */}
                        <div className="absolute inset-0" style={{
                          background: isActive
                            ? `linear-gradient(to top, ${group.color}cc 0%, ${group.color}44 60%, transparent 100%)`
                            : "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)"
                        }} />
                        {/* Border */}
                        <div className="absolute inset-0 rounded-2xl" style={{
                          border: isActive ? `2px solid ${group.color}` : "1px solid rgba(255,255,255,0.1)",
                          boxShadow: isActive ? `0 0 20px ${group.color}55` : "none"
                        }} />
                        {/* Label */}
                        <div className="relative z-10 pb-2 px-1 text-center">
                          <span className="text-base block mb-0.5">{group.emoji}</span>
                          <span className="font-cinzel font-bold leading-tight block"
                            style={{ fontSize: "clamp(7px, 2vw, 9px)", color: isActive ? "#fff" : "rgba(255,255,255,0.75)" }}>
                            {getGroupLabel(group)}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Books for expanded group */}
              <AnimatePresence>
                {filteredGroups.map(group => {
                  const isExpGroup = bookSearch.trim() ? true : expandedGroup === group.id;
                  if (!isExpGroup) return null;
                  return (
                    <motion.div key={group.id} variants={innerVariants} initial="hidden" animate="visible" exit="exit" className="overflow-hidden">
                      {/* Book squares grid — 4 per row, roomy */}
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        {group.matchedBooks.map((b, idx) => {
                          const isCurrentBook = b.name === book;
                          const isExpanded = expandedBook === b.name;
                          const displayName = getTranslatedBookName(b.name, lang);
                          const bookImg = BOOK_IMAGES[b.name] || DEFAULT_BOOK_IMG;

                          return (
                            <motion.button
                              key={b.name}
                              initial={{ opacity: 0, scale: 0.88 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.025, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleBookSelect(b.name)}
                              className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-end"
                              style={{ aspectRatio: "1/1.15", minHeight: 72 }}
                            >
                              <img src={bookImg} alt="" className="absolute inset-0 w-full h-full object-cover"
                                style={{ opacity: isCurrentBook || isExpanded ? 0.65 : 0.38 }} />
                              <div className="absolute inset-0" style={{
                                background: isCurrentBook
                                  ? `linear-gradient(to top, ${group.color}dd 0%, ${group.color}44 60%, transparent 100%)`
                                  : isExpanded
                                  ? `linear-gradient(to top, ${group.color}99 0%, transparent 100%)`
                                  : "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)"
                              }} />
                              <div className="absolute inset-0 rounded-2xl" style={{
                                border: isCurrentBook
                                  ? `2px solid ${group.color}`
                                  : isExpanded
                                  ? `1.5px solid ${group.color}88`
                                  : "1px solid rgba(255,255,255,0.1)",
                                boxShadow: isCurrentBook ? `0 0 16px ${group.color}66` : "none"
                              }} />
                              {isCurrentBook && (
                                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                                  style={{ background: group.color }}>
                                  <Check className="w-2.5 h-2.5 text-black" />
                                </div>
                              )}
                              <div className="relative z-10 pb-2 px-1 text-center w-full">
                                <span className="font-cinzel font-bold leading-tight block"
                                  style={{
                                    fontSize: "clamp(7.5px, 2.1vw, 10px)",
                                    color: isCurrentBook || isExpanded ? "#fff" : "rgba(255,255,255,0.8)",
                                  }}>
                                  {displayName.length > 9 ? displayName.substring(0, 8) + "." : displayName}
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Chapter squares for selected book */}
                      <AnimatePresence>
                        {expandedBook && group.matchedBooks.some(b => b.name === expandedBook) && (
                          <motion.div
                            variants={innerVariants} initial="hidden" animate="visible" exit="exit"
                            className="overflow-hidden mb-3">
                            <div className="rounded-2xl p-4"
                              style={{
                                background: "rgba(0,0,0,0.45)",
                                border: `1px solid ${group.color}30`,
                                boxShadow: `inset 0 1px 0 ${group.color}15`,
                              }}>
                              <p className="text-[9px] font-cinzel uppercase tracking-[0.22em] mb-3 px-0.5"
                                style={{ color: `${group.color}aa` }}>
                                {getTranslatedBookName(expandedBook, lang)} — {lang === "es" ? "Seleccionar Capítulo" : "Select Chapter"}
                              </p>
                              {/* Chapter grid — 7 per row */}
                              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                                {Array.from({ length: BIBLE_BOOKS.find(b => b.name === expandedBook)?.chapters || 1 }, (_, i) => i + 1).map((ch, idx) => {
                                  const isActiveCh = expandedBook === book && ch === chapter;
                                  const isExpCh = expandedChapter === ch;
                                  return (
                                    <motion.button
                                      key={ch}
                                      initial={{ opacity: 0, scale: 0.82 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: idx * 0.008, duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                                      whileTap={{ scale: 0.84 }}
                                      onClick={() => handleChapterSelect(ch)}
                                      className="rounded-2xl flex flex-col items-center justify-center font-cinzel font-bold transition-all"
                                      style={{
                                        aspectRatio: "1/1.25",
                                        minHeight: 42,
                                        background: isActiveCh
                                          ? `${group.color}35`
                                          : isExpCh
                                          ? `${group.color}22`
                                          : "rgba(255,255,255,0.06)",
                                        color: isActiveCh
                                          ? group.color
                                          : isExpCh
                                          ? `${group.color}dd`
                                          : "rgba(255,255,255,0.55)",
                                        border: isActiveCh
                                          ? `1.5px solid ${group.color}80`
                                          : isExpCh
                                          ? `1px solid ${group.color}45`
                                          : "1px solid rgba(255,255,255,0.08)",
                                        boxShadow: isActiveCh
                                          ? `0 0 14px ${group.color}44`
                                          : "none",
                                      }}>
                                      <span style={{ fontSize: "clamp(7px, 2vw, 9px)", opacity: 0.65, letterSpacing: "0.05em" }}>
                                        {lang === "es" ? "Cap" : "Ch"}
                                      </span>
                                      <span style={{ fontSize: "clamp(11px, 3vw, 14px)", lineHeight: 1.1 }}>{ch}</span>
                                    </motion.button>
                                  );
                                })}
                              </div>

                              {/* Verse picker for selected chapter */}
                              <AnimatePresence>
                                {expandedChapter && (
                                  <motion.div
                                    variants={innerVariants} initial="hidden" animate="visible" exit="exit"
                                    className="overflow-hidden mt-3">
                                    <div className="rounded-2xl p-3"
                                      style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${group.color}25` }}>
                                      <div className="flex items-center justify-between mb-2.5 px-0.5">
                                        <p className="text-[9px] font-cinzel uppercase tracking-widest"
                                          style={{ color: `${group.color}99` }}>
                                          {getTranslatedBookName(expandedBook, lang)} {expandedChapter} — {lang === "es" ? "Versículos" : "Verses"}
                                        </p>
                                        <motion.button whileTap={{ scale: 0.92 }}
                                          onClick={() => goTo(expandedBook, expandedChapter)}
                                          className="text-[9px] font-cinzel px-2.5 py-1 rounded-full"
                                          style={{ background: `${group.color}22`, color: group.color, border: `1px solid ${group.color}40` }}>
                                          {lang === "es" ? "Abrir →" : "Open →"}
                                        </motion.button>
                                      </div>
                                      <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
                                        {Array.from({ length: 40 }, (_, i) => i + 1).map((v, idx) => (
                                          <motion.button
                                            key={v}
                                            initial={{ opacity: 0, scale: 0.78 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.006, duration: 0.15 }}
                                            whileTap={{ scale: 0.8 }}
                                            onClick={() => {
                                              goTo(expandedBook, expandedChapter);
                                              setTimeout(() => {
                                                const el = document.getElementById(`verse-${v}`);
                                                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                                              }, 600);
                                            }}
                                            className="rounded-xl flex flex-col items-center justify-center font-cinzel font-semibold"
                                            style={{
                                              aspectRatio: "1/1.2",
                                              minHeight: 32,
                                              background: "rgba(255,255,255,0.05)",
                                              color: "rgba(255,255,255,0.5)",
                                              border: "1px solid rgba(255,255,255,0.07)",
                                            }}>
                                            <span style={{ fontSize: "6px", opacity: 0.55, letterSpacing: "0.04em" }}>
                                              {lang === "es" ? "v" : "v."}
                                            </span>
                                            <span style={{ fontSize: "clamp(9px, 2.5vw, 11px)", lineHeight: 1.1 }}>{v}</span>
                                          </motion.button>
                                        ))}
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
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Translation Panel */}
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
            }}>
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
                        <button key={t.code}
                          onClick={() => { onTranslationChange?.(t.code); setShowTranslation(false); }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all"
                          style={{
                            background: translation === t.code ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.03)",
                            border: translation === t.code ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.05)",
                          }}>
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