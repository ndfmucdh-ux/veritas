import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BIBLE_BOOKS, TRANSLATIONS, getTranslatedBookName } from "@/lib/bibleData";

export default function ChapterNavigator({ book, chapter, translation, onNavigate, onTranslationChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState("book"); // "book" | "chapter" | "translation"
  const [selectedBook, setSelectedBook] = useState(book);

  const bookData = BIBLE_BOOKS.find(b => b.name === book);
  const totalChapters = bookData?.chapters || 1;
  const transData = TRANSLATIONS.find(t => t.code === translation);
  const displayBook = getTranslatedBookName(book, transData?.lang || "en");

  const goTo = (newBook, newChapter) => {
    onNavigate(newBook, newChapter);
    setShowPicker(false);
  };

  const prevChapter = () => {
    if (chapter > 1) {
      goTo(book, chapter - 1);
    } else {
      const idx = BIBLE_BOOKS.findIndex(b => b.name === book);
      if (idx > 0) {
        const prev = BIBLE_BOOKS[idx - 1];
        goTo(prev.name, prev.chapters);
      }
    }
  };

  const nextChapter = () => {
    if (chapter < totalChapters) {
      goTo(book, chapter + 1);
    } else {
      const idx = BIBLE_BOOKS.findIndex(b => b.name === book);
      if (idx < BIBLE_BOOKS.length - 1) {
        goTo(BIBLE_BOOKS[idx + 1].name, 1);
      }
    }
  };

  const OT = BIBLE_BOOKS.filter(b => b.testament === "OT");
  const NT = BIBLE_BOOKS.filter(b => b.testament === "NT");
  const selBookData = BIBLE_BOOKS.find(b => b.name === selectedBook);

  return (
    <div className="relative">
      {/* Nav bar */}
      <div className="flex items-center gap-2">
        <motion.button whileTap={{ scale: 0.88 }} onClick={prevChapter}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowPicker(v => !v)}
          className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl font-cinzel text-sm font-semibold"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)" }}
        >
          {displayBook} {chapter}
          <ChevronDown className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.4)", transform: showPicker ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </motion.button>

        {onTranslationChange && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { setShowPicker(true); setPickerTab("translation"); }}
            className="px-3 h-9 rounded-xl font-cinzel text-xs font-semibold"
            style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.18)" }}
          >
            {translation}
          </motion.button>
        )}

        <motion.button whileTap={{ scale: 0.88 }} onClick={nextChapter}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Picker dropdown */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className="absolute left-0 right-0 z-50 mt-2 rounded-2xl overflow-hidden"
            style={{ background: "rgba(10,15,30,0.98)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 16px 48px rgba(0,0,0,0.6)", maxHeight: "70vh", overflowY: "auto" }}
          >
            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              {["book", "chapter", "translation"].map(tab => (
                <button key={tab} onClick={() => setPickerTab(tab)}
                  className="flex-1 py-3 text-xs font-cinzel uppercase tracking-widest capitalize transition-colors"
                  style={{ color: pickerTab === tab ? "#00f5ff" : "rgba(255,255,255,0.35)", borderBottom: pickerTab === tab ? "2px solid #00f5ff" : "2px solid transparent" }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Book picker */}
            {pickerTab === "book" && (
              <div className="p-3 space-y-3">
                <div>
                  <p className="text-[10px] font-cinzel uppercase tracking-widest px-1 mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Old Testament</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {OT.map(b => (
                      <button key={b.name}
                        onClick={() => { setSelectedBook(b.name); setPickerTab("chapter"); }}
                        className="text-xs px-2 py-2 rounded-xl text-left font-inter truncate transition-colors"
                        style={{
                          background: selectedBook === b.name ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.04)",
                          color: selectedBook === b.name ? "#00f5ff" : "rgba(255,255,255,0.6)",
                          border: selectedBook === b.name ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent"
                        }}>
                        {getTranslatedBookName(b.name, transData?.lang || "en")}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-cinzel uppercase tracking-widest px-1 mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>New Testament</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {NT.map(b => (
                      <button key={b.name}
                        onClick={() => { setSelectedBook(b.name); setPickerTab("chapter"); }}
                        className="text-xs px-2 py-2 rounded-xl text-left font-inter truncate transition-colors"
                        style={{
                          background: selectedBook === b.name ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.04)",
                          color: selectedBook === b.name ? "#00f5ff" : "rgba(255,255,255,0.6)",
                          border: selectedBook === b.name ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent"
                        }}>
                        {getTranslatedBookName(b.name, transData?.lang || "en")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chapter picker */}
            {pickerTab === "chapter" && (
              <div className="p-3">
                <p className="text-xs font-cinzel mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>{getTranslatedBookName(selectedBook, transData?.lang || "en")}</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {Array.from({ length: selBookData?.chapters || 1 }, (_, i) => i + 1).map(ch => (
                    <button key={ch}
                      onClick={() => goTo(selectedBook, ch)}
                      className="h-9 rounded-xl text-sm font-cinzel font-semibold transition-colors"
                      style={{
                        background: selectedBook === book && ch === chapter ? "rgba(0,245,255,0.18)" : "rgba(255,255,255,0.05)",
                        color: selectedBook === book && ch === chapter ? "#00f5ff" : "rgba(255,255,255,0.6)",
                        border: selectedBook === book && ch === chapter ? "1px solid rgba(0,245,255,0.3)" : "1px solid transparent"
                      }}>
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Translation picker */}
            {pickerTab === "translation" && (
              <div className="p-3 space-y-3">
                {["en", "es", "pt", "fr", "it"].map(lang => {
                  const langTranslations = TRANSLATIONS.filter(t => t.lang === lang);
                  if (langTranslations.length === 0) return null;
                  const langFlags = { en: "🇬🇧", es: "🇲🇽", pt: "🇧🇷", fr: "🇫🇷", it: "🇮🇹" };
                  return (
                    <div key={lang}>
                      <p className="text-[10px] font-cinzel uppercase tracking-widest px-1 mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {langFlags[lang]} {lang.toUpperCase()}
                      </p>
                      <div className="space-y-1.5">
                        {langTranslations.map(t => (
                          <button key={t.code}
                            onClick={() => { onTranslationChange?.(t.code); setShowPicker(false); }}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors"
                            style={{
                              background: translation === t.code ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.03)",
                              border: translation === t.code ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.06)"
                            }}>
                            <span className="font-cinzel text-sm font-semibold" style={{ color: translation === t.code ? "#00f5ff" : "rgba(255,255,255,0.8)" }}>{t.code}</span>
                            <span className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}