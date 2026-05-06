import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BIBLE_BOOKS, TRANSLATIONS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

const THEOLOGICAL_GROUPS = [
  { id: "Pentateuch", label: "📖 The Law", books: [1,2,3,4,5] },
  { id: "Historical", label: "⚔️ Historical", books: [6,7,8,9,10,11,12,13,14,15,16,17] },
  { id: "Wisdom", label: "💎 Wisdom & Poetry", books: [18,19,20,21,22] },
  { id: "MajorProphets", label: "🔥 Major Prophets", books: [23,24,25,26,27] },
  { id: "MinorProphets", label: "⚡ Minor Prophets", books: [28,29,30,31,32,33,34,35,36,37,38,39] },
  { id: "Gospels", label: "✝️ Gospels", books: [40,41,42,43] },
  { id: "Acts", label: "🌍 Acts & Epistles", books: [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65] },
  { id: "Revelation", label: "👑 Revelation", books: [66] },
];

export default function ChapterNavigator({ book, chapter, translation, onNavigate, onTranslationChange }) {
  const { lang } = useLang();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState("book");
  const [selectedBook, setSelectedBook] = useState(book);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [pickerTop, setPickerTop] = useState(120);
  const pickerRef = useRef(null);
  const triggerBtnRef = useRef(null);

  const openPicker = useCallback((tab = "book") => {
    // Measure the actual trigger button (or fall back to the wrapper)
    const el = triggerBtnRef.current || pickerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setPickerTop(rect.bottom + 6);
    }
    setPickerTab(tab);
    setShowPicker(true);
  }, []);

  const bookData = BIBLE_BOOKS.find(b => b.name === book);
  const totalChapters = bookData?.chapters || 1;
  const displayBook = getTranslatedBookName(book, lang);
  const selBookData = BIBLE_BOOKS.find(b => b.name === selectedBook);

  useEffect(() => { setSelectedBook(book); }, [book]);

  // Auto-expand the group containing the currently selected book
  useEffect(() => {
    if (pickerTab === "book") {
      const selBookNum = BIBLE_BOOKS.find(b => b.name === selectedBook)?.num;
      if (selBookNum) {
        const group = THEOLOGICAL_GROUPS.find(g => g.books.includes(selBookNum));
        if (group) setExpandedGroup(group.id);
      }
    }
  }, [pickerTab, selectedBook]);

  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false);
    };
    const onScroll = (e) => {
      // Only close if the scroll happened outside the picker panel
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, []);

  const goTo = (newBook, newChapter) => { onNavigate(newBook, newChapter); setShowPicker(false); };

  const prevChapter = () => {
    if (chapter > 1) { goTo(book, chapter - 1); }
    else {
      const idx = BIBLE_BOOKS.findIndex(b => b.name === book);
      if (idx > 0) { const prev = BIBLE_BOOKS[idx - 1]; goTo(prev.name, prev.chapters); }
    }
  };

  const nextChapter = () => {
    if (chapter < totalChapters) { goTo(book, chapter + 1); }
    else {
      const idx = BIBLE_BOOKS.findIndex(b => b.name === book);
      if (idx < BIBLE_BOOKS.length - 1) { goTo(BIBLE_BOOKS[idx + 1].name, 1); }
    }
  };

  const chapterNums = Array.from({ length: selBookData?.chapters || 1 }, (_, i) => i + 1);
  const tabs = onTranslationChange ? ["book", "chapter", "translation"] : ["book", "chapter"];

  return (
    <div ref={pickerRef} className="relative">
      {/* Nav bar */}
      <div className="flex items-center gap-1.5">
        <motion.button whileTap={{ scale: 0.85 }} onClick={prevChapter}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={(e) => { triggerBtnRef.current = e.currentTarget; showPicker ? setShowPicker(false) : openPicker("book"); }}
          className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl font-cinzel text-sm font-semibold"
          style={{ background: showPicker ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.06)", color: showPicker ? "#00f5ff" : "rgba(255,255,255,0.85)", border: showPicker ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent", transition: "all 0.2s" }}
        >
          <span>{displayBook}</span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>{chapter}</span>
          <motion.div animate={{ rotate: showPicker ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.35)" }} />
          </motion.div>
        </motion.button>

        {onTranslationChange && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={(e) => { triggerBtnRef.current = e.currentTarget; openPicker("translation"); }}
            className="px-3 h-9 rounded-xl font-cinzel text-xs font-semibold flex-shrink-0"
            style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.18)" }}
          >
            {translation}
          </motion.button>
        )}

        <motion.button whileTap={{ scale: 0.85 }} onClick={nextChapter}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Picker panel */}
      <AnimatePresence>
        {showPicker && (
          <>
            {/* Invisible full-screen backdrop to catch all outside taps */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPicker(false)}
              onTouchStart={() => setShowPicker(false)}
            />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed left-2 right-2 z-[200] rounded-2xl"
            style={{ top: pickerTop, background: "rgba(8,13,26,0.98)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(0,245,255,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)", maxHeight: "65vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
          >
            {/* Tabs */}
            <div className="flex flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {tabs.map(tab => (
                <motion.button key={tab} onClick={() => setPickerTab(tab)}
                  className="flex-1 py-2.5 text-[10px] font-cinzel uppercase tracking-widest relative"
                  style={{ color: pickerTab === tab ? "#00f5ff" : "rgba(255,255,255,0.3)" }}
                >
                  {tab}
                  {pickerTab === tab && (
                    <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: "#00f5ff" }} />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto scrollbar-hide flex-1">
              <AnimatePresence mode="wait">

                {/* Book picker — Theological groups */}
                {pickerTab === "book" && (
                  <motion.div key="book" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.18 }} className="p-2 space-y-1">
                    {THEOLOGICAL_GROUPS.map(group => {
                      const groupBooks = BIBLE_BOOKS.filter(b => group.books.includes(b.num));
                      const isExpanded = expandedGroup === group.id;
                      return (
                        <div key={group.id}>
                          <button
                            onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left"
                            style={{
                              background: isExpanded ? "rgba(0,245,255,0.08)" : "transparent",
                              borderLeft: isExpanded ? "2px solid #00f5ff" : "2px solid transparent"
                            }}
                          >
                            <ChevronDown
                              className="w-3 h-3 flex-shrink-0 transition-transform"
                              style={{
                                color: isExpanded ? "#00f5ff" : "rgba(255,255,255,0.25)",
                                transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                              }}
                            />
                            <span className="text-[11px] font-cinzel" style={{ color: isExpanded ? "#00f5ff" : "rgba(255,255,255,0.6)" }}>
                              {group.label}
                            </span>
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-5 pr-2 pb-1 space-y-0.5">
                                  {groupBooks.map(b => (
                                    <button key={b.name}
                                      onClick={() => { setSelectedBook(b.name); setPickerTab("chapter"); }}
                                      className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg transition-all text-xs font-inter"
                                      style={{
                                        background: selectedBook === b.name ? "rgba(0,245,255,0.12)" : "transparent",
                                        color: selectedBook === b.name ? "#00f5ff" : "rgba(255,255,255,0.55)",
                                      }}>
                                      <span>{getTranslatedBookName(b.name, lang)}</span>
                                      <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>{b.chapters} ch</span>
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {/* Chapter picker — compact scrollable list */}
                {pickerTab === "chapter" && (
                  <motion.div key="chapter" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }} className="p-2">
                    <p className="text-[9px] font-cinzel uppercase tracking-widest px-2 mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {getTranslatedBookName(selectedBook, lang)} — {selBookData?.chapters} chapters
                    </p>
                    <div className="space-y-0.5 max-h-[50vh] overflow-y-auto scrollbar-hide">
                      {chapterNums.map(ch => {
                        const isActive = selectedBook === book && ch === chapter;
                        return (
                          <button key={ch}
                            onClick={() => goTo(selectedBook, ch)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-inter transition-all text-left"
                            style={{
                              background: isActive ? "rgba(0,245,255,0.12)" : "transparent",
                              color: isActive ? "#00f5ff" : "rgba(255,255,255,0.6)",
                              borderLeft: isActive ? "3px solid #00f5ff" : "3px solid transparent"
                            }}>
                            <span>Chapter {ch}</span>
                            {isActive && <Check className="w-3 h-3" style={{ color: "#00f5ff" }} />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Translation picker */}
                {pickerTab === "translation" && (
                  <motion.div key="translation" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }} className="p-3 space-y-3">
                    {["en", "es", "pt", "fr", "it"].map(l => {
                      const langTranslations = TRANSLATIONS.filter(t => t.lang === l);
                      if (!langTranslations.length) return null;
                      const flags = { en: "🇬🇧", es: "🇲🇽", pt: "🇧🇷", fr: "🇫🇷", it: "🇮🇹" };
                      return (
                        <div key={l}>
                          <p className="text-[9px] font-cinzel uppercase tracking-widest px-1 mb-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>{flags[l]} {l.toUpperCase()}</p>
                          <div className="space-y-1">
                            {langTranslations.map(t => (
                              <motion.button key={t.code} whileTap={{ scale: 0.98 }}
                                onClick={() => { onTranslationChange?.(t.code); setShowPicker(false); }}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all"
                                style={{
                                  background: translation === t.code ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.03)",
                                  border: translation === t.code ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.05)"
                                }}>
                                <div className="flex items-center gap-2">
                                  <span className="font-cinzel text-xs font-bold" style={{ color: translation === t.code ? "#00f5ff" : "rgba(255,255,255,0.8)" }}>{t.code}</span>
                                  <span className="text-[10px] font-inter truncate" style={{ color: "rgba(255,255,255,0.3)" }}>{t.name}</span>
                                </div>
                                {translation === t.code && <Check className="w-3 h-3 flex-shrink-0" style={{ color: "#00f5ff" }} />}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}