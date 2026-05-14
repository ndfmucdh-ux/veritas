import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, X, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import { BIBLE_BOOKS, TRANSLATIONS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

const CATEGORIES = [
  { id: "law",        label: "Law",        labelEs: "Ley",        color: "#f59e0b", image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80", books: ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy"] },
  { id: "history",   label: "History",    labelEs: "Historia",   color: "#ef4444", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80", books: ["Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther"] },
  { id: "poetry",    label: "Poetry",     labelEs: "Poesía",     color: "#a78bfa", image: "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=600&q=80", books: ["Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon"] },
  { id: "prophecy",  label: "Prophecy",   labelEs: "Profecía",   color: "#06b6d4", image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80", books: ["Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi"] },
  { id: "gospels",   label: "Gospels",    labelEs: "Evangelios", color: "#fbbf24", image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&q=80", books: ["Matthew","Mark","Luke","John"] },
  { id: "acts",      label: "Acts",       labelEs: "Hechos",     color: "#34d399", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80", books: ["Acts"] },
  { id: "epistles",  label: "Epistles",   labelEs: "Epístolas",  color: "#f472b6", image: "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=600&q=80", books: ["Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude"] },
  { id: "revelation",label: "Revelation", labelEs: "Apocalipsis",color: "#c084fc", image: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&q=80", books: ["Revelation"] },
];

const BOOK_IMAGES = {
  "Genesis":"https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70","Exodus":"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70","Leviticus":"https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=400&q=70","Numbers":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70","Deuteronomy":"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70","Joshua":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70","Judges":"https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=400&q=70","Ruth":"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70","1 Samuel":"https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=400&q=70","2 Samuel":"https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=400&q=70","1 Kings":"https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=400&q=70","2 Kings":"https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=400&q=70","1 Chronicles":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70","2 Chronicles":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70","Ezra":"https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70","Nehemiah":"https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70","Esther":"https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70","Job":"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70","Psalms":"https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=70","Proverbs":"https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70","Ecclesiastes":"https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70","Song of Solomon":"https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70","Isaiah":"https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=70","Jeremiah":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70","Lamentations":"https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70","Ezekiel":"https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=70","Daniel":"https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=70","Hosea":"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70","Joel":"https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=70","Amos":"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70","Obadiah":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70","Jonah":"https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70","Micah":"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70","Nahum":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70","Habakkuk":"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70","Zephaniah":"https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=70","Haggai":"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70","Zechariah":"https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=70","Malachi":"https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=70","Matthew":"https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=70","Mark":"https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70","Luke":"https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70","John":"https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70","Acts":"https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70","Romans":"https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=400&q=70","1 Corinthians":"https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=400&q=70","2 Corinthians":"https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=400&q=70","Galatians":"https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70","Ephesians":"https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=70","Philippians":"https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70","Colossians":"https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70","1 Thessalonians":"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70","2 Thessalonians":"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70","1 Timothy":"https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=400&q=70","2 Timothy":"https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=400&q=70","Titus":"https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70","Philemon":"https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70","Hebrews":"https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=400&q=70","James":"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70","1 Peter":"https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70","2 Peter":"https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70","1 John":"https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70","2 John":"https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70","3 John":"https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70","Jude":"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70","Revelation":"https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=400&q=70",
};

export default function ChapterNavigator({ book, chapter, translation, onNavigate, onTranslationChange }) {
  const { lang } = useLang();
  const [modal, setModal] = useState(null); // null | "books" | "translation"
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const bookData = BIBLE_BOOKS.find(b => b.name === book);
  const bookIdx = BIBLE_BOOKS.findIndex(b => b.name === book);
  const totalChapters = bookData?.chapters || 1;
  const displayBook = getTranslatedBookName(book, lang);
  const activeCategory = CATEGORIES.find(c => c.books.includes(book));

  // Lock body scroll when modal open
  useEffect(() => {
    if (modal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  const prevChapter = () => {
    if (chapter > 1) onNavigate(book, chapter - 1);
    else if (bookIdx > 0) { const pb = BIBLE_BOOKS[bookIdx - 1]; onNavigate(pb.name, pb.chapters); }
  };

  const nextChapter = () => {
    if (chapter < totalChapters) onNavigate(book, chapter + 1);
    else if (bookIdx < BIBLE_BOOKS.length - 1) onNavigate(BIBLE_BOOKS[bookIdx + 1].name, 1);
  };

  const close = () => { setModal(null); setSelectedCategory(null); setSelectedBook(null); };

  const atStart = bookIdx === 0 && chapter === 1;
  const atEnd = bookIdx === BIBLE_BOOKS.length - 1 && chapter === totalChapters;

  return (
    <>
      {/* ── Nav bar ── */}
      <div className="flex items-center gap-2">
        <button onClick={prevChapter} disabled={atStart}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: atStart ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.55)" }}>
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button onClick={() => { setSelectedCategory(null); setSelectedBook(null); setModal("books"); }}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
          <span className="font-cinzel text-sm font-semibold text-white truncate">{displayBook} {chapter}</span>
          <ChevronDown className="w-3.5 h-3.5 ml-auto flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
        </button>

        <button onClick={() => setModal("translation")}
          className="px-3 py-2 rounded-xl font-cinzel text-xs font-bold flex-shrink-0"
          style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
          {translation}
        </button>

        <button onClick={nextChapter} disabled={atEnd}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: atEnd ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.55)" }}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Modals via portal ── */}
      {typeof document !== "undefined" && ReactDOM.createPortal(
        <AnimatePresence>
          {modal && (
            <motion.div
              key={modal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "fixed", inset: 0, zIndex: 99999,
                background: "rgba(4,6,16,0.97)",
                backdropFilter: "blur(20px)",
                display: "flex", flexDirection: "column",
              }}
            >
              {/* Header */}
              <div style={{ borderBottom: "1px solid rgba(255,215,0,0.1)", padding: "18px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {selectedBook && (
                    <button onClick={() => setSelectedBook(null)}
                      style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: "#fbbf24", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
                      <ChevronLeft style={{ width: 14, height: 14 }} /> Back
                    </button>
                  )}
                  {selectedCategory && !selectedBook && (
                    <button onClick={() => setSelectedCategory(null)}
                      style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: "#fbbf24", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
                      <ChevronLeft style={{ width: 14, height: 14 }} /> Back
                    </button>
                  )}
                  <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>
                    {modal === "translation" ? "Bible Version" :
                     selectedBook ? getTranslatedBookName(selectedBook.name, lang) + " — Chapter" :
                     selectedCategory ? selectedCategory.label :
                     "Select Book"}
                  </h2>
                </div>
                <button onClick={close}
                  style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 32px" }}>

                {/* ── CATEGORY GRID ── */}
                {modal === "books" && !selectedCategory && !selectedBook && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 560, margin: "0 auto" }}>
                    {CATEGORIES.map(cat => {
                      const isActive = activeCategory?.id === cat.id;
                      return (
                        <button key={cat.id} onClick={() => setSelectedCategory(cat)}
                          style={{
                            position: "relative", height: 120, borderRadius: 20, overflow: "hidden", cursor: "pointer",
                            border: isActive ? `2px solid ${cat.color}` : "2px solid rgba(255,215,0,0.08)",
                            boxShadow: isActive ? `0 0 24px ${cat.color}55` : "0 4px 20px rgba(0,0,0,0.4)",
                            padding: 0, background: "transparent", textAlign: "left",
                          }}>
                          <img src={cat.image} alt={cat.label}
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.78) 100%)" }} />
                          {/* Gold shimmer border top */}
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${cat.color}99, transparent)` }} />
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px" }}>
                            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2 }}>
                              {lang === "es" ? cat.labelEs : cat.label}
                            </p>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: cat.color, margin: "3px 0 0" }}>
                              {cat.books.length} {cat.books.length === 1 ? "book" : "books"}
                            </p>
                          </div>
                          {isActive && (
                            <div style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%", background: cat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Check style={{ width: 11, height: 11, color: "#000" }} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ── BOOK GRID ── */}
                {modal === "books" && selectedCategory && !selectedBook && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 560, margin: "0 auto" }}>
                    {selectedCategory.books.map(bname => {
                      const bData = BIBLE_BOOKS.find(b => b.name === bname);
                      const isActive = bname === book;
                      const img = BOOK_IMAGES[bname] || selectedCategory.image;
                      return (
                        <button key={bname}
                          onClick={() => {
                            if (!bData) return;
                            if (bData.chapters === 1) { onNavigate(bname, 1); close(); }
                            else setSelectedBook(bData);
                          }}
                          style={{
                            position: "relative", height: 110, borderRadius: 20, overflow: "hidden", cursor: "pointer",
                            border: isActive ? `2px solid ${selectedCategory.color}` : "2px solid rgba(255,215,0,0.08)",
                            boxShadow: isActive ? `0 0 20px ${selectedCategory.color}55` : "0 4px 16px rgba(0,0,0,0.4)",
                            padding: 0, background: "transparent", textAlign: "left",
                          }}>
                          <img src={img} alt={bname}
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.8) 100%)" }} />
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${selectedCategory.color}77, transparent)` }} />
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px" }}>
                            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2 }}>
                              {getTranslatedBookName(bname, lang)}
                            </p>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>
                              {bData?.chapters} ch.
                            </p>
                          </div>
                          {isActive && (
                            <div style={{ position: "absolute", top: 7, right: 7, width: 18, height: 18, borderRadius: "50%", background: selectedCategory.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Check style={{ width: 10, height: 10, color: "#000" }} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ── CHAPTER GRID ── */}
                {modal === "books" && selectedBook && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, maxWidth: 560, margin: "0 auto" }}>
                    {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(ch => {
                      const isActive = selectedBook.name === book && ch === chapter;
                      return (
                        <button key={ch}
                          onClick={() => { onNavigate(selectedBook.name, ch); close(); }}
                          style={{
                            aspectRatio: "1/1", borderRadius: 14, border: isActive ? "1.5px solid rgba(251,191,36,0.8)" : "1px solid rgba(255,215,0,0.12)",
                            background: isActive ? "rgba(251,191,36,0.18)" : "rgba(255,215,0,0.04)",
                            color: isActive ? "#fbbf24" : "rgba(255,255,255,0.6)",
                            fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: isActive ? 700 : 400,
                            cursor: "pointer", boxShadow: isActive ? "0 0 14px rgba(251,191,36,0.3)" : "none",
                          }}>
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ── TRANSLATION LIST ── */}
                {modal === "translation" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 500, margin: "0 auto" }}>
                    {TRANSLATIONS.map(tr => {
                      const isActive = tr.code === translation;
                      return (
                        <button key={tr.code}
                          onClick={() => { onTranslationChange?.(tr.code); close(); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 16, cursor: "pointer",
                            background: isActive ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.03)",
                            border: isActive ? "1.5px solid rgba(251,191,36,0.45)" : "1px solid rgba(255,215,0,0.08)",
                            textAlign: "left",
                          }}>
                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700, color: isActive ? "#fbbf24" : "rgba(255,255,255,0.85)", minWidth: 56 }}>
                            {tr.code}
                          </span>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", flex: 1 }}>
                            {tr.name}
                          </span>
                          {isActive && <Check style={{ width: 14, height: 14, color: "#fbbf24", flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}