import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import { BIBLE_BOOKS, TRANSLATIONS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

const CATEGORIES = [
  { id: "law",        label: "Law",        labelEs: "Ley",        color: "#f59e0b", image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80", books: ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy"] },
  { id: "history",   label: "History",    labelEs: "Historia",   color: "#ef4444", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80", books: ["Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther"] },
  { id: "poetry",    label: "Poetry",     labelEs: "Poesía",     color: "#a78bfa", image: "https://images.unsplash.com/photo-1507842072343-583f20270319?w=600&q=80", books: ["Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon"] },
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
  const [modal, setModal] = useState(null); // null | "books" | "chapters" | "translation"
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const bookData = BIBLE_BOOKS.find(b => b.name === book);
  const bookIdx = BIBLE_BOOKS.findIndex(b => b.name === book);
  const totalChapters = bookData?.chapters || 1;
  const displayBook = getTranslatedBookName(book, lang);
  const activeCategory = CATEGORIES.find(c => c.books.includes(book));

  useEffect(() => {
    if (modal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
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
      {/* Nav bar */}
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

      {/* Modals via portal */}
      {typeof document !== "undefined" && ReactDOM.createPortal(
        <AnimatePresence>
          {modal && (
            <>
              {/* Dark overlay backdrop */}
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={close}
                style={{
                  position: "fixed", inset: 0, zIndex: 99990,
                  background: "rgba(0, 0, 0, 0.65)",
                  backdropFilter: "blur(2px)",
                }}
              />

              {/* Books/Translation modal */}
              {modal !== "chapters" && (
                <motion.div
                  key="main-modal"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  style={{
                    position: "fixed", left: "50%", top: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 99999,
                    width: "100%",
                    maxWidth: "480px",
                    maxHeight: "85vh",
                    padding: "0",
                    background: "rgba(14,18,32,0.97)",
                    backdropFilter: "blur(24px)",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,215,0,0.12)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(251,191,36,0.08)",
                    display: "flex", flexDirection: "column",
                    overflow: "hidden",
                    margin: "0 16px",
                  }}
                >
                  {/* Header */}
                  <div style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid rgba(255,215,0,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {selectedCategory && !selectedBook && (
                        <button onClick={() => setSelectedCategory(null)}
                          style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: "#fbbf24", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          <ChevronLeft style={{ width: 14, height: 14 }} />
                          {lang === "es" ? "Atrás" : "Back"}
                        </button>
                      )}
                      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>
                        {modal === "translation" ? "Bible Version" : selectedCategory ? selectedCategory.label : "Select Book"}
                      </h2>
                    </div>
                    <button onClick={close}
                      style={{
                        fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 600,
                        color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
                        padding: "5px 12px", cursor: "pointer",
                      }}>
                      {lang === "es" ? "Cerrar" : "Close"}
                    </button>
                  </div>

                  {/* Scrollable body */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "14px", minHeight: 0, display: "flex", flexDirection: "column" }}>

                    {/* CATEGORY GRID */}
                    {modal === "books" && !selectedCategory && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {CATEGORIES.map(cat => {
                          const isActive = activeCategory?.id === cat.id;
                          return (
                            <button key={cat.id} onClick={() => setSelectedCategory(cat)}
                              style={{
                                position: "relative", height: 110, borderRadius: 16, overflow: "hidden", cursor: "pointer",
                                border: isActive ? `2px solid ${cat.color}` : "1.5px solid rgba(255,215,0,0.08)",
                                boxShadow: isActive ? `0 0 20px ${cat.color}66` : "0 2px 12px rgba(0,0,0,0.3)",
                                padding: 0, background: "transparent", textAlign: "left",
                              }}>
                              <img src={cat.image} alt={cat.label} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)" }} />
                              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg, transparent, ${cat.color}99, transparent)` }} />
                              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px" }}>
                                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.1 }}>
                                  {lang === "es" ? cat.labelEs : cat.label}
                                </p>
                                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: cat.color, margin: "2px 0 0" }}>
                                  {cat.books.length} {lang === "es" ? "libros" : "books"}
                                </p>
                              </div>
                              {isActive && (
                                <div style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: "50%", background: cat.color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 10px ${cat.color}88` }}>
                                  <Check style={{ width: 10, height: 10, color: "#000" }} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* BOOK GRID */}
                    {modal === "books" && selectedCategory && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {selectedCategory.books.map(bname => {
                          const bData = BIBLE_BOOKS.find(b => b.name === bname);
                          const isActive = bname === book;
                          const img = BOOK_IMAGES[bname] || selectedCategory.image;
                          return (
                            <button key={bname}
                              onClick={() => {
                                if (!bData) return;
                                if (bData.chapters === 1) { onNavigate(bname, 1); close(); }
                                else { setSelectedBook(bData); setModal("chapters"); }
                              }}
                              style={{
                                position: "relative", height: 100, borderRadius: 16, overflow: "hidden", cursor: "pointer",
                                border: isActive ? `2px solid ${selectedCategory.color}` : "1.5px solid rgba(255,215,0,0.08)",
                                boxShadow: isActive ? `0 0 18px ${selectedCategory.color}55` : "0 2px 10px rgba(0,0,0,0.3)",
                                padding: 0, background: "transparent", textAlign: "left",
                              }}>
                              <img src={img} alt={bname} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)" }} />
                              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg, transparent, ${selectedCategory.color}77, transparent)` }} />
                              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px" }}>
                                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.1 }}>
                                  {getTranslatedBookName(bname, lang)}
                                </p>
                                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 8, color: "rgba(255,255,255,0.45)", margin: "1px 0 0" }}>
                                  {bData?.chapters} {lang === "es" ? "cap." : "ch."}
                                </p>
                              </div>
                              {isActive && (
                                <div style={{ position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: "50%", background: selectedCategory.color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 10px ${selectedCategory.color}88` }}>
                                  <Check style={{ width: 9, height: 9, color: "#000" }} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* TRANSLATION LIST */}
                    {modal === "translation" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {TRANSLATIONS.map(tr => {
                          const isActive = tr.code === translation;
                          return (
                            <button key={tr.code}
                              onClick={() => { onTranslationChange?.(tr.code); close(); }}
                              style={{
                                display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 12, cursor: "pointer",
                                background: isActive ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.03)",
                                border: isActive ? "1.5px solid rgba(251,191,36,0.4)" : "1px solid rgba(255,215,0,0.08)",
                                textAlign: "left",
                              }}>
                              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, color: isActive ? "#fbbf24" : "rgba(255,255,255,0.8)", minWidth: 50 }}>
                                {tr.code}
                              </span>
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", flex: 1 }}>
                                {tr.name}
                              </span>
                              {isActive && <Check style={{ width: 13, height: 13, color: "#fbbf24", flexShrink: 0 }} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Chapters modal (separate) */}
              {modal === "chapters" && selectedBook && (
              <motion.div
                key="chapters-modal"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                style={{
                  position: "fixed", left: "50%", top: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 99998,
                  width: "100%",
                  maxWidth: "420px",
                  maxHeight: "85vh",
                  padding: "0",
                  background: "rgba(14,18,32,0.98)",
                  backdropFilter: "blur(24px)",
                  borderRadius: "20px",
                  border: "1.5px solid rgba(251,191,36,0.15)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.75), 0 0 50px rgba(251,191,36,0.12)",
                  display: "flex", flexDirection: "column",
                  overflow: "hidden",
                  margin: "0 16px",
                }}
                >
                  {/* Header */}
                  <div style={{
                    padding: "14px 18px",
                    borderBottom: "1.5px solid rgba(251,191,36,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "linear-gradient(90deg, rgba(251,191,36,0.05) 0%, rgba(0,0,0,0) 100%)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => { setModal("books"); setSelectedBook(null); }}
                        style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: "#fbbf24", display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <ChevronLeft style={{ width: 13, height: 13 }} />
                        Back
                      </button>
                      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#fbbf24", margin: 0, letterSpacing: "0.04em" }}>
                        {getTranslatedBookName(selectedBook.name, lang)}
                      </h3>
                    </div>
                    <button onClick={close}
                      style={{
                        width: 28, height: 28, borderRadius: 10, background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)",
                      }}>
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                  </div>

                  {/* Chapters grid */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "12px", minHeight: 0 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, width: "100%" }}>
                      {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(ch => {
                        const isActive = selectedBook.name === book && ch === chapter;
                        return (
                          <button key={ch}
                            onClick={() => { onNavigate(selectedBook.name, ch); close(); }}
                            style={{
                              aspectRatio: "1/1.1", borderRadius: 12, cursor: "pointer",
                              border: isActive ? "1.5px solid rgba(251,191,36,0.9)" : "1.5px solid rgba(255,215,0,0.12)",
                              background: isActive ? "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.08))" : "rgba(255,255,255,0.03)",
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                              boxShadow: isActive ? "0 0 16px rgba(251,191,36,0.4), inset 0 0 12px rgba(251,191,36,0.1)" : "0 2px 8px rgba(0,0,0,0.3)",
                            }}>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 7, fontWeight: 600, color: isActive ? "rgba(251,191,36,0.75)" : "rgba(255,255,255,0.35)", letterSpacing: "0.08em", lineHeight: 1, textTransform: "uppercase" }}>
                              {lang === "es" ? "Cap" : "Ch"}
                            </span>
                            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: isActive ? 700 : 600, color: isActive ? "#fbbf24" : "rgba(255,255,255,0.75)", lineHeight: 1.1 }}>
                              {ch}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}