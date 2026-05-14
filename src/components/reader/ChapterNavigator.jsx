import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BIBLE_BOOKS, TRANSLATIONS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

const GROUPS = [
  { id: "Law", label: "The Law", labelEs: "La Ley", emoji: "📜", color: "#f59e0b", image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=70", books: [1,2,3,4,5] },
  { id: "History", label: "Historical", labelEs: "Historia", emoji: "⚔️", color: "#ef4444", image: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=400&q=70", books: [6,7,8,9,10,11,12,13,14,15,16,17] },
  { id: "Wisdom", label: "Wisdom", labelEs: "Sabiduría", emoji: "💎", color: "#8b5cf6", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=70", books: [18,19,20,21,22] },
  { id: "MajorProp", label: "Prophets", labelEs: "Profetas", emoji: "🔥", color: "#f97316", image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&q=70", books: [23,24,25,26,27] },
  { id: "MinorProp", label: "Minor Prop.", labelEs: "Men. Profetas", emoji: "⚡", color: "#eab308", image: "https://images.unsplash.com/photo-1475070929565-c985b496cb9f?w=400&q=70", books: [28,29,30,31,32,33,34,35,36,37,38,39] },
  { id: "Gospels", label: "Gospels", labelEs: "Evangelios", emoji: "✝️", color: "#00f5ff", image: "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=400&q=70", books: [40,41,42,43] },
  { id: "Epistles", label: "Epistles", labelEs: "Epístolas", emoji: "🌍", color: "#34d399", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=70", books: [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65] },
  { id: "Revelation", label: "Revelation", labelEs: "Apocalipsis", emoji: "👑", color: "#a78bfa", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70", books: [66] },
];

const BOOK_IMAGES = {
  Genesis: "https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=200&q=60",
  Exodus: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=200&q=60",
  Psalms: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=200&q=60",
  Proverbs: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=60",
  Isaiah: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=200&q=60",
  Matthew: "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=200&q=60",
  Luke: "https://images.unsplash.com/photo-1487088678257-3a541e6e3922?w=200&q=60",
  John: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=60",
  Revelation: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=60",
};
const DEFAULT_BOOK_IMG = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&q=60";

const modalBg = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};
const modalSlide = {
  hidden: { opacity: 0, y: 60, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 380, damping: 32 } },
  exit: { opacity: 0, y: 40, scale: 0.97, transition: { duration: 0.2 } },
};

// A full-screen modal sheet
function ModalSheet({ open, onClose, title, children, accentColor = "#00f5ff" }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          variants={modalBg}
          initial="hidden" animate="visible" exit="exit"
          className="fixed inset-0 z-[9999] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            key="sheet"
            variants={modalSlide}
            initial="hidden" animate="visible" exit="exit"
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-3xl overflow-hidden"
            style={{
              background: "rgba(6,9,20,0.99)",
              border: `1px solid ${accentColor}22`,
              borderBottom: "none",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="font-cinzel text-sm font-bold" style={{ color: accentColor }}>{title}</p>
              <button onClick={onClose} className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ChapterNavigator({ book, chapter, translation, onNavigate, onTranslationChange }) {
  const { lang } = useLang();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [bookSearch, setBookSearch] = useState("");
  const containerRef = useRef(null);

  const bookData = BIBLE_BOOKS.find(b => b.name === book);
  const totalChapters = bookData?.chapters || 1;
  const displayBook = getTranslatedBookName(book, lang);

  // Outside click for translation panel only
  useEffect(() => {
    if (!showTranslation) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setShowTranslation(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("touchstart", handler); };
  }, [showTranslation]);

  const goTo = (newBook, newChapter) => {
    onNavigate(newBook, newChapter);
    setShowGroupModal(false);
    setShowBookModal(false);
    setShowChapterModal(false);
    setSelectedGroup(null);
    setSelectedBook(null);
    setSelectedChapter(null);
    setBookSearch("");
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

  const openNavigator = () => {
    // Pre-select current book's group
    const num = BIBLE_BOOKS.find(b => b.name === book)?.num;
    if (num) {
      const g = GROUPS.find(g => g.books.includes(num));
      if (g) { setSelectedGroup(g); setShowBookModal(true); return; }
    }
    setShowGroupModal(true);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setShowGroupModal(false);
    setBookSearch("");
    setShowBookModal(true);
  };

  const handleBookSelect = (bName) => {
    setSelectedBook(bName);
    setShowBookModal(false);
    setSelectedChapter(null);
    setShowChapterModal(true);
  };

  const handleChapterSelect = (ch) => {
    setSelectedChapter(ch);
    // Navigate immediately — verse selector appears as dropdown within chapter modal
  };

  const getGroupLabel = (group) => lang === "es" ? group.labelEs : group.label;

  const filteredBooks = selectedGroup
    ? BIBLE_BOOKS.filter(b => {
        if (!selectedGroup.books.includes(b.num)) return false;
        if (!bookSearch.trim()) return true;
        return getTranslatedBookName(b.name, lang).toLowerCase().includes(bookSearch.toLowerCase());
      })
    : [];

  const chapterCount = BIBLE_BOOKS.find(b => b.name === selectedBook)?.chapters || 1;
  const groupColor = selectedGroup?.color || "#00f5ff";

  return (
    <div ref={containerRef} className="relative">
      {/* Nav bar */}
      <div className="flex items-center gap-1.5">
        <button onClick={prevChapter}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-all"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button onClick={openNavigator}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-cinzel font-bold transition-all"
          style={{
            background: showGroupModal || showBookModal || showChapterModal ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.06)",
            color: showGroupModal || showBookModal || showChapterModal ? "#00f5ff" : "rgba(255,255,255,0.9)",
            border: showGroupModal || showBookModal || showChapterModal ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
            fontSize: "clamp(14px, 3.5vw, 17px)",
          }}>
          <span>{displayBook}</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85em" }}>{chapter}</span>
          <ChevronDown className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
        </button>

        {onTranslationChange && (
          <button onClick={() => setShowTranslation(v => !v)}
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

      {/* ── MODAL 1: Category/Group selection ── */}
      <ModalSheet open={showGroupModal} onClose={() => setShowGroupModal(false)}
        title={lang === "es" ? "Seleccionar Categoría" : "Select Category"}>
        <div className="grid grid-cols-2 gap-3 p-4">
          {GROUPS.map(group => (
            <motion.button key={group.id} whileTap={{ scale: 0.93 }}
              onClick={() => handleGroupSelect(group)}
              className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-end"
              style={{ aspectRatio: "16/9", minHeight: 90 }}>
              <img src={group.image} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.55 }} />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${group.color}cc 0%, rgba(0,0,0,0.3) 60%, transparent 100%)` }} />
              <div className="absolute inset-0 rounded-2xl" style={{ border: `1.5px solid ${group.color}55` }} />
              <div className="relative z-10 pb-3 px-2 text-center">
                <span className="text-2xl block mb-1">{group.emoji}</span>
                <span className="font-cinzel font-bold text-white text-xs">{getGroupLabel(group)}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </ModalSheet>

      {/* ── MODAL 2: Book selection ── */}
      <ModalSheet open={showBookModal} onClose={() => setShowBookModal(false)}
        title={selectedGroup ? `${selectedGroup.emoji} ${getGroupLabel(selectedGroup)}` : ""}
        accentColor={groupColor}>
        <div className="px-4 py-3 sticky top-0 z-10" style={{ background: "rgba(6,9,20,0.99)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
            <input value={bookSearch} onChange={e => setBookSearch(e.target.value)}
              placeholder={lang === "es" ? "Buscar libro…" : "Search book…"}
              className="flex-1 bg-transparent font-inter focus:outline-none"
              style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }} />
            {bookSearch && <button onClick={() => setBookSearch("")} style={{ color: "rgba(255,255,255,0.3)" }}><X className="w-3.5 h-3.5" /></button>}
          </div>
          <button onClick={() => { setShowBookModal(false); setShowGroupModal(true); }}
            className="mt-2 text-[10px] font-cinzel flex items-center gap-1"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            ← {lang === "es" ? "Cambiar categoría" : "Change category"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 p-4">
          {filteredBooks.map((b, idx) => {
            const isCurrentBook = b.name === book;
            const displayName = getTranslatedBookName(b.name, lang);
            const bookImg = BOOK_IMAGES[b.name] || DEFAULT_BOOK_IMG;
            return (
              <motion.button
                key={b.name}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.91 }}
                onClick={() => handleBookSelect(b.name)}
                className="relative rounded-2xl overflow-hidden flex flex-col items-end justify-end"
                style={{ aspectRatio: "1/1.2", minHeight: 90 }}>
                <img src={bookImg} alt="" className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: isCurrentBook ? 0.7 : 0.4 }} />
                <div className="absolute inset-0" style={{
                  background: isCurrentBook
                    ? `linear-gradient(to top, ${groupColor}dd 0%, rgba(0,0,0,0.2) 100%)`
                    : "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 100%)"
                }} />
                <div className="absolute inset-0 rounded-2xl" style={{
                  border: isCurrentBook ? `2px solid ${groupColor}` : `1px solid ${groupColor}30`,
                  boxShadow: isCurrentBook ? `0 0 16px ${groupColor}44` : "none"
                }} />
                {isCurrentBook && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: groupColor }}>
                    <Check className="w-3 h-3 text-black" />
                  </div>
                )}
                <div className="relative z-10 pb-2.5 px-1.5 w-full text-center">
                  <span className="font-cinzel font-bold leading-tight block text-white"
                    style={{ fontSize: "clamp(8px, 2.5vw, 11px)" }}>
                    {displayName.length > 10 ? displayName.substring(0, 9) + "." : displayName}
                  </span>
                  <span className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {b.chapters} {lang === "es" ? "caps" : "chs"}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </ModalSheet>

      {/* ── MODAL 3: Chapter selection + verse dropdown ── */}
      <ModalSheet open={showChapterModal} onClose={() => { setShowChapterModal(false); setSelectedChapter(null); }}
        title={selectedBook ? `${getTranslatedBookName(selectedBook, lang)} — ${lang === "es" ? "Capítulo" : "Chapter"}` : ""}
        accentColor={groupColor}>
        <div className="px-4 pt-3 pb-1 sticky top-0 z-10" style={{ background: "rgba(6,9,20,0.99)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={() => { setShowChapterModal(false); setShowBookModal(true); setBookSearch(""); }}
            className="text-[10px] font-cinzel flex items-center gap-1"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            ← {lang === "es" ? "Cambiar libro" : "Change book"}
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Chapter grid */}
          <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
            {Array.from({ length: chapterCount }, (_, i) => i + 1).map((ch, idx) => {
              const isActiveCh = selectedBook === book && ch === chapter;
              const isSelected = selectedChapter === ch;
              return (
                <motion.button
                  key={ch}
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.006, duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleChapterSelect(ch)}
                  className="rounded-2xl flex flex-col items-center justify-center font-cinzel font-bold transition-all"
                  style={{
                    aspectRatio: "1/1.15",
                    minHeight: 48,
                    background: isActiveCh ? `${groupColor}35` : isSelected ? `${groupColor}20` : "rgba(255,255,255,0.05)",
                    color: isActiveCh ? groupColor : isSelected ? `${groupColor}ee` : "rgba(255,255,255,0.55)",
                    border: isActiveCh ? `1.5px solid ${groupColor}80` : isSelected ? `1.5px solid ${groupColor}55` : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isActiveCh ? `0 0 14px ${groupColor}44` : "none",
                  }}>
                  <span style={{ fontSize: "clamp(8px, 2.5vw, 10px)", opacity: 0.6 }}>{lang === "es" ? "Cap" : "Ch"}</span>
                  <span style={{ fontSize: "clamp(13px, 4vw, 16px)", lineHeight: 1.1 }}>{ch}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Open chapter directly */}
          {selectedChapter && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-4"
              style={{ background: `${groupColor}0d`, border: `1px solid ${groupColor}30` }}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-cinzel text-xs font-bold" style={{ color: groupColor }}>
                  {getTranslatedBookName(selectedBook, lang)} {selectedChapter} — {lang === "es" ? "Versículos" : "Verses"}
                </p>
                <motion.button whileTap={{ scale: 0.92 }}
                  onClick={() => goTo(selectedBook, selectedChapter)}
                  className="font-cinzel text-xs px-3 py-1.5 rounded-full"
                  style={{ background: `${groupColor}22`, color: groupColor, border: `1px solid ${groupColor}55` }}>
                  {lang === "es" ? "Abrir capítulo →" : "Open chapter →"}
                </motion.button>
              </div>
              {/* Scrollable verse list */}
              <div className="max-h-44 overflow-y-auto space-y-1 scrollbar-hide">
                {Array.from({ length: 40 }, (_, i) => i + 1).map((v) => (
                  <motion.button
                    key={v}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      goTo(selectedBook, selectedChapter);
                      setTimeout(() => {
                        const el = document.getElementById(`verse-${v}`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 600);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="font-cinzel text-xs font-bold flex-shrink-0"
                      style={{ color: groupColor, minWidth: 28 }}>{lang === "es" ? `v.${v}` : `v.${v}`}</span>
                    <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {lang === "es" ? `Ir al versículo ${v}` : `Jump to verse ${v}`}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </ModalSheet>

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
                    <p className="text-[9px] font-cinzel uppercase tracking-widest px-1 mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
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
                            <span className="font-cinzel text-xs font-bold" style={{ color: translation === t.code ? "#00f5ff" : "rgba(255,255,255,0.8)" }}>{t.code}</span>
                            <span className="text-[10px] font-inter truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{t.name}</span>
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