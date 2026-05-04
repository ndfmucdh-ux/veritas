import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BIBLE_BOOKS, TRANSLATIONS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

export default function ChapterNavigator({ book, chapter, translation, onNavigate, onTranslationChange }) {
  const { lang } = useLang();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState("book");
  const [selectedBook, setSelectedBook] = useState(book);
  const pickerRef = useRef(null);

  const bookData = BIBLE_BOOKS.find(b => b.name === book);
  const totalChapters = bookData?.chapters || 1;
  const transData = TRANSLATIONS.find(t => t.code === translation);
  // Use UI language for display, not translation language
  const displayBook = getTranslatedBookName(book, lang);
  const selBookData = BIBLE_BOOKS.find(b => b.name === selectedBook);

  // Sync selectedBook when book prop changes
  useEffect(() => { setSelectedBook(book); }, [book]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("touchstart", handler); };
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

  const OT = BIBLE_BOOKS.filter(b => b.testament === "OT");
  const NT = BIBLE_BOOKS.filter(b => b.testament === "NT");
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
          onClick={() => { setShowPicker(v => !v); setPickerTab("book"); }}
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
            onClick={() => { setShowPicker(true); setPickerTab("translation"); }}
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
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute left-0 right-0 z-50 mt-2 rounded-2xl"
            style={{ background: "rgba(8,13,26,0.98)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(0,245,255,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)", maxHeight: "65vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
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

                {/* Book picker */}
                {pickerTab === "book" && (
                  <motion.div key="book" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.18 }} className="p-3 space-y-3">
                    <div>
                      <p className="text-[9px] font-cinzel uppercase tracking-widest px-1 mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>Old Testament</p>
                      <div className="grid grid-cols-4 gap-1">
                        {OT.map(b => (
                          <motion.button key={b.name} whileTap={{ scale: 0.9 }}
                            onClick={() => { setSelectedBook(b.name); setPickerTab("chapter"); }}
                            className="text-[10px] px-1.5 py-2 rounded-lg font-inter truncate transition-all"
                            style={{
                              background: selectedBook === b.name ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.04)",
                              color: selectedBook === b.name ? "#00f5ff" : "rgba(255,255,255,0.55)",
                              border: selectedBook === b.name ? "1px solid rgba(0,245,255,0.3)" : "1px solid transparent"
                            }}>
                            {getTranslatedBookName(b.name, lang).substring(0, 7)}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-cinzel uppercase tracking-widest px-1 mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>New Testament</p>
                      <div className="grid grid-cols-4 gap-1">
                        {NT.map(b => (
                          <motion.button key={b.name} whileTap={{ scale: 0.9 }}
                            onClick={() => { setSelectedBook(b.name); setPickerTab("chapter"); }}
                            className="text-[10px] px-1.5 py-2 rounded-lg font-inter truncate transition-all"
                            style={{
                              background: selectedBook === b.name ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.04)",
                              color: selectedBook === b.name ? "#00f5ff" : "rgba(255,255,255,0.55)",
                              border: selectedBook === b.name ? "1px solid rgba(0,245,255,0.3)" : "1px solid transparent"
                            }}>
                            {getTranslatedBookName(b.name, lang).substring(0, 7)}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Chapter picker — inline grid, no nested dropdown */}
                {pickerTab === "chapter" && (
                  <motion.div key="chapter" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }} className="p-3">
                    <p className="text-[9px] font-cinzel uppercase tracking-widest px-1 mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {getTranslatedBookName(selectedBook, lang)} — {selBookData?.chapters} chapters
                    </p>
                    <div className="grid grid-cols-6 gap-1">
                      {chapterNums.map(ch => (
                        <motion.button key={ch} whileTap={{ scale: 0.85 }}
                          onClick={() => goTo(selectedBook, ch)}
                          className="py-2 rounded-lg text-xs font-cinzel font-semibold transition-all flex items-center justify-center"
                          style={{
                            background: selectedBook === book && ch === chapter ? "rgba(0,245,255,0.2)" : "rgba(255,255,255,0.05)",
                            color: selectedBook === book && ch === chapter ? "#00f5ff" : "rgba(255,255,255,0.6)",
                            border: selectedBook === book && ch === chapter ? "1px solid rgba(0,245,255,0.35)" : "1px solid transparent"
                          }}>
                          {ch}
                        </motion.button>
                      ))}
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
        )}
      </AnimatePresence>
    </div>
  );
}