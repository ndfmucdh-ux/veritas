import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Check, ChevronRight, Clock, Bookmark, ArrowRight } from "lucide-react";
import { BIBLE_BOOKS } from "@/lib/bibleData";

const THEOLOGICAL_GROUPS = [
  { id: "law",        label: "The Law",         emoji: "📜", books: [1,2,3,4,5] },
  { id: "history",    label: "Historical",      emoji: "⚔️", books: [6,7,8,9,10,11,12,13,14,15,16,17] },
  { id: "wisdom",     label: "Wisdom & Poetry", emoji: "💎", books: [18,19,20,21,22] },
  { id: "major",      label: "Major Prophets",  emoji: "🔥", books: [23,24,25,26,27] },
  { id: "minor",      label: "Minor Prophets",  emoji: "⚡", books: [28,29,30,31,32,33,34,35,36,37,38,39] },
  { id: "gospels",    label: "Gospels",          emoji: "✝️", books: [40,41,42,43] },
  { id: "acts",       label: "Acts & Epistles",  emoji: "🌍", books: [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65] },
  { id: "revelation", label: "Revelation",       emoji: "👑", books: [66] },
];

// Approximate verse counts per chapter for common books — fallback is 30
const VERSE_COUNTS = {
  "Psalms": { 119: 176, 78: 72, 89: 52, 18: 50, 37: 40, 68: 35, 105: 45, 106: 48, 107: 43, 119: 176 },
};
const getVerseCount = (book, chapter) => VERSE_COUNTS[book]?.[chapter] || 30;

const HISTORY_KEY = "veritas_nav_history";
const getHistory = () => {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
};
const addToHistory = (ref) => {
  try {
    const h = getHistory().filter(r => r.ref !== ref.ref).slice(0, 7);
    localStorage.setItem(HISTORY_KEY, JSON.stringify([ref, ...h]));
  } catch {}
};

export default function BibleNavigator({ book, chapter, verse, translation, onNavigate, trigger }) {
  const [open, setOpen] = useState(false);
  const [testament, setTestament] = useState(BIBLE_BOOKS.find(b => b.name === book)?.testament || "OT");
  const [selBook, setSelBook] = useState(book);
  const [selChapter, setSelChapter] = useState(chapter || 1);
  const [selVerse, setSelVerse] = useState(verse || 1);
  const [step, setStep] = useState("book"); // "book" | "chapter" | "verse"
  const [bookSearch, setBookSearch] = useState("");
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const searchRef = useRef(null);
  const overlayRef = useRef(null);

  const bookData = BIBLE_BOOKS.find(b => b.name === selBook);
  const totalChapters = bookData?.chapters || 1;
  const totalVerses = getVerseCount(selBook, selChapter);

  const chapters = useMemo(() => Array.from({ length: totalChapters }, (_, i) => i + 1), [totalChapters]);
  const verses = useMemo(() => Array.from({ length: totalVerses }, (_, i) => i + 1), [totalVerses]);

  const filteredBooks = useMemo(() => {
    const q = bookSearch.toLowerCase();
    if (!q) return BIBLE_BOOKS.filter(b => b.testament === testament);
    return BIBLE_BOOKS.filter(b =>
      b.name.toLowerCase().includes(q) || b.abbr.toLowerCase().includes(q)
    );
  }, [bookSearch, testament]);

  const groupedBooks = useMemo(() => {
    if (bookSearch) return null;
    return THEOLOGICAL_GROUPS.filter(g => {
      const hasBooks = g.books.some(num => BIBLE_BOOKS.find(b => b.num === num)?.testament === testament);
      return hasBooks;
    });
  }, [testament, bookSearch]);

  useEffect(() => {
    if (open) {
      setHistory(getHistory());
      setBookSearch("");
      setStep("book");
      setSelBook(book);
      setSelChapter(chapter || 1);
      setSelVerse(verse || 1);
      setTestament(BIBLE_BOOKS.find(b => b.name === book)?.testament || "NT");
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleGoTo = useCallback(() => {
    const ref = { ref: `${selBook} ${selChapter}:${selVerse}`, book: selBook, chapter: selChapter, verse: selVerse };
    addToHistory(ref);
    onNavigate(selBook, selChapter, selVerse);
    setOpen(false);
  }, [selBook, selChapter, selVerse, onNavigate]);

  const selectBook = (b) => {
    setSelBook(b.name);
    setSelChapter(1);
    setSelVerse(1);
    setStep("chapter");
  };

  const selectChapter = (ch) => {
    setSelChapter(ch);
    setSelVerse(1);
    setStep("verse");
  };

  const selectVerse = (v) => {
    setSelVerse(v);
  };

  const displayRef = `${book} ${chapter}${verse ? `:${verse}` : ""}`;

  return (
    <>
      {/* Trigger */}
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <motion.button
          onClick={() => setOpen(true)}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-cinzel font-semibold text-sm transition-all"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          <span>{displayRef}</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        </motion.button>
      )}

      {/* Full-screen overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100]"
              style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
              onClick={() => setOpen(false)}
            />

            {/* Navigator Panel — bottom sheet on mobile, centered modal on desktop */}
            <motion.div
              ref={overlayRef}
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="fixed z-[101] left-0 right-0 bottom-0 md:inset-x-auto md:left-1/2 md:bottom-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
              style={{
                width: "min(680px, 100vw)",
                maxHeight: "92vh",
                borderRadius: "24px 24px 0 0",
                background: "rgba(7,10,22,0.97)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 -8px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,215,0,0.06)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0 md:hidden">
                <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
              </div>

              {/* Header */}
              <div className="px-5 py-4 flex-shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-cinzel text-base font-bold text-white tracking-wide">Navigate Scripture</p>
                    <p className="text-[11px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Select book · chapter · verse
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Current selection pill */}
                    <div className="font-cinzel text-sm px-3 py-1.5 rounded-xl"
                      style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)", color: "#FFD700" }}>
                      {selBook} {selChapter}:{selVerse}
                    </div>
                    <button onClick={() => setOpen(false)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
                      style={{ color: "rgba(255,255,255,0.4)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,215,0,0.5)" }} />
                  <input
                    ref={searchRef}
                    value={bookSearch}
                    onChange={e => { setBookSearch(e.target.value); setStep("book"); }}
                    placeholder="Search book by name or abbreviation..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-inter focus:outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,215,0,0.15)",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  />
                </div>
              </div>

              {/* OT / NT Tabs — only when on book step */}
              {step === "book" && !bookSearch && (
                <div className="flex px-5 pt-3 gap-2 flex-shrink-0">
                  {["OT", "NT"].map(t => (
                    <button key={t} onClick={() => setTestament(t)}
                      className="flex-1 py-2 rounded-xl font-cinzel text-xs font-semibold uppercase tracking-widest transition-all"
                      style={{
                        background: testament === t ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.04)",
                        color: testament === t ? "#FFD700" : "rgba(255,255,255,0.4)",
                        border: testament === t ? "1px solid rgba(255,215,0,0.3)" : "1px solid rgba(255,255,255,0.07)",
                      }}>
                      {t === "OT" ? "Old Testament" : "New Testament"}
                    </button>
                  ))}
                </div>
              )}

              {/* Step pills */}
              <div className="flex gap-2 px-5 pt-3 pb-2 flex-shrink-0">
                {[
                  { id: "book", label: selBook },
                  { id: "chapter", label: `Ch. ${selChapter}` },
                  { id: "verse", label: `v. ${selVerse}` },
                ].map((s, i) => {
                  const isActive = step === s.id;
                  const isPast = ["book", "chapter", "verse"].indexOf(step) > i;
                  return (
                    <button key={s.id} onClick={() => setStep(s.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-cinzel transition-all"
                      style={{
                        background: isActive ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.04)",
                        color: isActive ? "#FFD700" : isPast ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)",
                        border: isActive ? "1px solid rgba(255,215,0,0.3)" : "1px solid rgba(255,255,255,0.07)",
                      }}>
                      {isPast && <Check className="w-3 h-3" style={{ color: "#FFD700" }} />}
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {/* Recent history */}
              {history.length > 0 && step === "book" && !bookSearch && (
                <div className="px-5 pb-2 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3 h-3" style={{ color: "rgba(255,255,255,0.2)" }} />
                    <p className="text-[9px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>Recent</p>
                  </div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {history.slice(0, 5).map(h => (
                      <button key={h.ref} onClick={() => { onNavigate(h.book, h.chapter, h.verse); setOpen(false); }}
                        className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-cinzel transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>
                        {h.ref}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">

                {/* BOOK STEP */}
                <AnimatePresence mode="wait">
                  {step === "book" && (
                    <motion.div key="books" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.18 }}>
                      {bookSearch ? (
                        // Search results
                        <div className="space-y-1 pt-2">
                          {filteredBooks.length === 0 && (
                            <p className="text-sm font-inter text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>No books found</p>
                          )}
                          {filteredBooks.map(b => (
                            <BookRow key={b.name} book={b} selected={selBook === b.name} onSelect={selectBook} />
                          ))}
                        </div>
                      ) : (
                        // Grouped by section
                        <div className="space-y-2 pt-1">
                          {groupedBooks?.map(group => (
                            <div key={group.id}>
                              <div className="flex items-center gap-2 px-2 py-1.5 mt-2">
                                <span className="text-sm">{group.emoji}</span>
                                <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>{group.label}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                {group.books.map(num => {
                                  const b = BIBLE_BOOKS.find(x => x.num === num);
                                  if (!b || b.testament !== testament) return null;
                                  return <BookCard key={b.name} book={b} selected={selBook === b.name} onSelect={selectBook} />;
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* CHAPTER STEP */}
                  {step === "chapter" && (
                    <motion.div key="chapters" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
                      <p className="text-[10px] font-cinzel uppercase tracking-widest pt-3 pb-2 px-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                        {selBook} — {totalChapters} chapter{totalChapters !== 1 ? "s" : ""}
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {chapters.map(ch => (
                          <motion.button key={ch} whileTap={{ scale: 0.88 }}
                            onClick={() => selectChapter(ch)}
                            className="aspect-square rounded-xl flex items-center justify-center font-cinzel text-sm font-semibold transition-all"
                            style={{
                              background: selChapter === ch ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.04)",
                              color: selChapter === ch ? "#FFD700" : "rgba(255,255,255,0.6)",
                              border: selChapter === ch ? "1.5px solid rgba(255,215,0,0.4)" : "1px solid rgba(255,255,255,0.07)",
                              boxShadow: selChapter === ch ? "0 0 16px rgba(255,215,0,0.15)" : "none",
                            }}>
                            {ch}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* VERSE STEP */}
                  {step === "verse" && (
                    <motion.div key="verses" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
                      <p className="text-[10px] font-cinzel uppercase tracking-widest pt-3 pb-2 px-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                        {selBook} {selChapter} — {totalVerses} verse{totalVerses !== 1 ? "s" : ""}
                      </p>
                      <div className="grid grid-cols-6 gap-2">
                        {verses.map(v => (
                          <motion.button key={v} whileTap={{ scale: 0.88 }}
                            onClick={() => selectVerse(v)}
                            className="aspect-square rounded-xl flex items-center justify-center font-cinzel text-sm font-semibold transition-all"
                            style={{
                              background: selVerse === v ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.04)",
                              color: selVerse === v ? "#FFD700" : "rgba(255,255,255,0.6)",
                              border: selVerse === v ? "1.5px solid rgba(255,215,0,0.4)" : "1px solid rgba(255,255,255,0.07)",
                              boxShadow: selVerse === v ? "0 0 16px rgba(255,215,0,0.15)" : "none",
                            }}>
                            {v}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer — Go To button */}
              <div className="flex-shrink-0 px-5 py-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.3)" }}>
                <div className="flex gap-3">
                  {step !== "verse" && (
                    <button
                      onClick={() => setStep(step === "book" ? "chapter" : "verse")}
                      className="flex items-center gap-2 px-4 py-3 rounded-2xl font-cinzel text-sm font-semibold transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", flex: 1 }}>
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleGoTo}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl font-cinzel text-sm font-bold transition-all"
                    style={{
                      background: "linear-gradient(135deg, #FFD700, #f59e0b)",
                      color: "#06080f",
                      flex: 2,
                      boxShadow: "0 4px 24px rgba(255,215,0,0.25)",
                    }}>
                    Go to {selBook} {selChapter}:{selVerse}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function BookCard({ book, selected, onSelect }) {
  return (
    <motion.button whileTap={{ scale: 0.94 }} onClick={() => onSelect(book)}
      className="flex flex-col items-start px-3 py-2.5 rounded-xl transition-all text-left"
      style={{
        background: selected ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.03)",
        border: selected ? "1px solid rgba(255,215,0,0.35)" : "1px solid rgba(255,255,255,0.07)",
      }}>
      <span className="font-cinzel text-xs font-semibold" style={{ color: selected ? "#FFD700" : "rgba(255,255,255,0.8)" }}>
        {book.name}
      </span>
      <span className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
        {book.abbr} · {book.chapters} ch
      </span>
      {selected && <div className="absolute top-2 right-2"><Check className="w-3 h-3" style={{ color: "#FFD700" }} /></div>}
    </motion.button>
  );
}

function BookRow({ book, selected, onSelect }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={() => onSelect(book)}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
      style={{
        background: selected ? "rgba(255,215,0,0.08)" : "transparent",
        borderLeft: selected ? "3px solid #FFD700" : "3px solid transparent",
      }}>
      <div className="flex items-center gap-3 text-left">
        <span className="font-cinzel text-xs font-bold w-8" style={{ color: "#FFD700" }}>{book.abbr}</span>
        <span className="font-inter text-sm" style={{ color: selected ? "#FFD700" : "rgba(255,255,255,0.7)" }}>{book.name}</span>
      </div>
      <span className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.2)" }}>{book.chapters} ch</span>
    </motion.button>
  );
}