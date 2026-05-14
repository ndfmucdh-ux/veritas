import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, X, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import { BIBLE_BOOKS, TRANSLATIONS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

// Category definitions with semantic images
const CATEGORIES = [
  {
    id: "law", label: "Law", labelEs: "Ley",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80",
    books: ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy"],
    color: "#f59e0b",
  },
  {
    id: "history", label: "History", labelEs: "Historia",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    books: ["Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther"],
    color: "#ef4444",
  },
  {
    id: "poetry", label: "Poetry", labelEs: "Poesía",
    image: "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=600&q=80",
    books: ["Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon"],
    color: "#a78bfa",
  },
  {
    id: "prophecy", label: "Prophecy", labelEs: "Profecía",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80",
    books: ["Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi"],
    color: "#06b6d4",
  },
  {
    id: "gospels", label: "Gospels", labelEs: "Evangelios",
    image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&q=80",
    books: ["Matthew","Mark","Luke","John"],
    color: "#fbbf24",
  },
  {
    id: "acts", label: "Acts", labelEs: "Hechos",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
    books: ["Acts"],
    color: "#34d399",
  },
  {
    id: "epistles", label: "Epistles", labelEs: "Epístolas",
    image: "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=600&q=80",
    books: ["Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude"],
    color: "#f472b6",
  },
  {
    id: "revelation", label: "Revelation", labelEs: "Apocalipsis",
    image: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&q=80",
    books: ["Revelation"],
    color: "#c084fc",
  },
];

// Per-book semantic images
const BOOK_IMAGES = {
  "Genesis":          "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70",
  "Exodus":           "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70",
  "Leviticus":        "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=400&q=70",
  "Numbers":          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70",
  "Deuteronomy":      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70",
  "Joshua":           "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70",
  "Judges":           "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=400&q=70",
  "Ruth":             "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70",
  "1 Samuel":         "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=400&q=70",
  "2 Samuel":         "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=400&q=70",
  "1 Kings":          "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=400&q=70",
  "2 Kings":          "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=400&q=70",
  "1 Chronicles":     "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70",
  "2 Chronicles":     "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70",
  "Ezra":             "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70",
  "Nehemiah":         "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70",
  "Esther":           "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70",
  "Job":              "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70",
  "Psalms":           "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=70",
  "Proverbs":         "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70",
  "Ecclesiastes":     "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70",
  "Song of Solomon":  "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70",
  "Isaiah":           "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=70",
  "Jeremiah":         "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70",
  "Lamentations":     "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70",
  "Ezekiel":          "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=70",
  "Daniel":           "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=70",
  "Hosea":            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70",
  "Joel":             "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=70",
  "Amos":             "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70",
  "Obadiah":          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70",
  "Jonah":            "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70",
  "Micah":            "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70",
  "Nahum":            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70",
  "Habakkuk":         "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70",
  "Zephaniah":        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=70",
  "Haggai":           "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70",
  "Zechariah":        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=70",
  "Malachi":          "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=70",
  "Matthew":          "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=70",
  "Mark":             "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70",
  "Luke":             "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70",
  "John":             "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70",
  "Acts":             "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70",
  "Romans":           "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=400&q=70",
  "1 Corinthians":    "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=400&q=70",
  "2 Corinthians":    "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=400&q=70",
  "Galatians":        "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70",
  "Ephesians":        "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=70",
  "Philippians":      "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70",
  "Colossians":       "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70",
  "1 Thessalonians":  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70",
  "2 Thessalonians":  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70",
  "1 Timothy":        "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=400&q=70",
  "2 Timothy":        "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=400&q=70",
  "Titus":            "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70",
  "Philemon":         "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70",
  "Hebrews":          "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=400&q=70",
  "James":            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70",
  "1 Peter":          "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70",
  "2 Peter":          "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70",
  "1 John":           "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70",
  "2 John":           "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70",
  "3 John":           "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=400&q=70",
  "Jude":             "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70",
  "Revelation":       "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=400&q=70",
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

  const prevChapter = () => {
    if (chapter > 1) onNavigate(book, chapter - 1);
    else if (bookIdx > 0) { const pb = BIBLE_BOOKS[bookIdx - 1]; onNavigate(pb.name, pb.chapters); }
  };

  const nextChapter = () => {
    if (chapter < totalChapters) onNavigate(book, chapter + 1);
    else if (bookIdx < BIBLE_BOOKS.length - 1) onNavigate(BIBLE_BOOKS[bookIdx + 1].name, 1);
  };

  const openBooks = () => { setSelectedCategory(null); setSelectedBook(null); setModal("books"); };
  const openTranslation = () => setModal("translation");
  const close = () => { setModal(null); setSelectedCategory(null); setSelectedBook(null); };

  const activeCategory = CATEGORIES.find(c => c.books.includes(book));

  return (
    <>
      {/* ── Nav bar ── */}
      <div className="flex items-center gap-2">
        <button onClick={prevChapter}
          disabled={bookIdx === 0 && chapter === 1}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Book + Chapter trigger */}
        <button onClick={openBooks}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="font-cinzel text-sm font-semibold text-white truncate">{displayBook} {chapter}</span>
          <ChevronDown className="w-3.5 h-3.5 ml-auto flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
        </button>

        {/* Translation trigger */}
        <button onClick={openTranslation}
          className="px-3 py-2 rounded-xl font-cinzel text-xs font-bold transition-all flex-shrink-0"
          style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}>
          {translation}
        </button>

        <button onClick={nextChapter}
          disabled={bookIdx === BIBLE_BOOKS.length - 1 && chapter === totalChapters}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal && ReactDOM.createPortal(
          <motion.div
            key={modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[1000] flex flex-col"
            style={{ background: "rgba(4,6,14,0.96)", backdropFilter: "blur(24px)" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                {/* Back button when inside category/book */}
                {(selectedCategory && !selectedBook) && (
                  <button onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-1 font-cinzel text-xs"
                    style={{ color: "#fbbf24" }}>
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}
                {selectedBook && (
                  <button onClick={() => setSelectedBook(null)}
                    className="flex items-center gap-1 font-cinzel text-xs"
                    style={{ color: "#fbbf24" }}>
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}
                <h2 className="font-cinzel text-base font-bold text-white tracking-wider">
                  {modal === "translation" ? "Bible Version" :
                   selectedBook ? `${getTranslatedBookName(selectedBook.name, lang)} — Chapter` :
                   selectedCategory ? selectedCategory.label :
                   "Select Book"}
                </h2>
              </div>
              <button onClick={close}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-4 py-4">

              {/* ── BOOKS modal — Step 1: Categories ── */}
              {modal === "books" && !selectedCategory && !selectedBook && (
                <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {CATEGORIES.map(cat => {
                    const isActive = activeCategory?.id === cat.id;
                    return (
                      <motion.button
                        key={cat.id}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSelectedCategory(cat)}
                        className="relative rounded-2xl overflow-hidden text-left"
                        style={{ height: 120, border: isActive ? `2px solid ${cat.color}` : "2px solid transparent",
                          boxShadow: isActive ? `0 0 20px ${cat.color}44` : "none" }}>
                        <img src={cat.image} alt={cat.label}
                          className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0"
                          style={{ background: `linear-gradient(160deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.72) 100%)` }} />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="font-cinzel text-sm font-bold text-white leading-tight">
                            {lang === "es" ? cat.labelEs : cat.label}
                          </p>
                          <p className="font-inter text-[10px] mt-0.5" style={{ color: cat.color }}>
                            {cat.books.length} {cat.books.length === 1 ? "book" : "books"}
                          </p>
                        </div>
                        {isActive && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: cat.color }}>
                            <Check className="w-3 h-3 text-black" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* ── BOOKS modal — Step 2: Books in category ── */}
              {modal === "books" && selectedCategory && !selectedBook && (
                <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {selectedCategory.books.map(bname => {
                    const bData = BIBLE_BOOKS.find(b => b.name === bname);
                    const isActive = bname === book;
                    const img = BOOK_IMAGES[bname] || selectedCategory.image;
                    return (
                      <motion.button
                        key={bname}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          if (!bData) return;
                          if (bData.chapters === 1) { onNavigate(bname, 1); close(); }
                          else setSelectedBook(bData);
                        }}
                        className="relative rounded-2xl overflow-hidden text-left"
                        style={{ height: 110, border: isActive ? `2px solid ${selectedCategory.color}` : "2px solid rgba(255,255,255,0.08)",
                          boxShadow: isActive ? `0 0 18px ${selectedCategory.color}44` : "none" }}>
                        <img src={img} alt={bname}
                          className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0"
                          style={{ background: "linear-gradient(160deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)" }} />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="font-cinzel text-sm font-bold text-white leading-tight">
                            {getTranslatedBookName(bname, lang)}
                          </p>
                          <p className="font-inter text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                            {bData?.chapters} ch.
                          </p>
                        </div>
                        {isActive && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: selectedCategory.color }}>
                            <Check className="w-3 h-3 text-black" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* ── BOOKS modal — Step 3: Chapter picker ── */}
              {modal === "books" && selectedBook && (
                <div className="max-w-2xl mx-auto">
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(ch => {
                      const isActive = selectedBook.name === book && ch === chapter;
                      return (
                        <motion.button
                          key={ch}
                          whileTap={{ scale: 0.88 }}
                          onClick={() => { onNavigate(selectedBook.name, ch); close(); }}
                          className="aspect-square rounded-2xl flex items-center justify-center font-cinzel text-sm font-semibold transition-all"
                          style={{
                            background: isActive ? "rgba(0,245,255,0.18)" : "rgba(255,255,255,0.05)",
                            color: isActive ? "#00f5ff" : "rgba(255,255,255,0.65)",
                            border: isActive ? "1.5px solid rgba(0,245,255,0.5)" : "1px solid rgba(255,255,255,0.08)",
                          }}>
                          {ch}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── TRANSLATION modal ── */}
              {modal === "translation" && (
                <div className="space-y-2 max-w-lg mx-auto">
                  {TRANSLATIONS.map(tr => {
                    const isActive = tr.code === translation;
                    return (
                      <motion.button
                        key={tr.code}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { onTranslationChange?.(tr.code); close(); }}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all"
                        style={{
                          background: isActive ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.04)",
                          border: isActive ? "1.5px solid rgba(251,191,36,0.4)" : "1px solid rgba(255,255,255,0.07)",
                        }}>
                        <span className="font-cinzel text-sm font-bold" style={{ color: isActive ? "#fbbf24" : "rgba(255,255,255,0.8)" }}>
                          {tr.code}
                        </span>
                        <span className="text-xs font-inter flex-1 text-left ml-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {tr.name}
                        </span>
                        {isActive && <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#fbbf24" }} />}
                      </motion.button>
                    );
                  })}
                </div>
              )}

            </div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}