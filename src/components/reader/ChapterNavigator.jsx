import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check, Search, X } from "lucide-react";
import { BIBLE_BOOKS, TRANSLATIONS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

const GROUPS = [
  { id: "Law",        label: "📖 The Law",          books: [1,2,3,4,5] },
  { id: "History",    label: "⚔️ Historical",        books: [6,7,8,9,10,11,12,13,14,15,16,17] },
  { id: "Wisdom",     label: "💎 Wisdom & Poetry",   books: [18,19,20,21,22] },
  { id: "MajorProp",  label: "🔥 Major Prophets",    books: [23,24,25,26,27] },
  { id: "MinorProp",  label: "⚡ Minor Prophets",    books: [28,29,30,31,32,33,34,35,36,37,38,39] },
  { id: "Gospels",    label: "✝️ Gospels",            books: [40,41,42,43] },
  { id: "Epistles",   label: "🌍 Acts & Epistles",   books: [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65] },
  { id: "Revelation", label: "👑 Revelation",        books: [66] },
];

export default function ChapterNavigator({ book, chapter, translation, onNavigate, onTranslationChange }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);   // is panel open?
  const [tab, setTab] = useState("book");    // "book" | "chapter" | "translation"
  const [selBook, setSelBook] = useState(book);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [bookSearch, setBookSearch] = useState("");
  const containerRef = useRef(null);
  const panelRef = useRef(null);

  // Keep selBook in sync when book prop changes externally
  useEffect(() => { setSelBook(book); }, [book]);

  // Auto-expand the group for the current book when opening book tab
  useEffect(() => {
    if (open && tab === "book") {
      const num = BIBLE_BOOKS.find(b => b.name === selBook)?.num;
      if (num) {
        const g = GROUPS.find(g => g.books.includes(num));
        if (g) setExpandedGroup(g.id);
      }
    }
  }, [open, tab, selBook]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  const bookData = BIBLE_BOOKS.find(b => b.name === book);
  const selBookData = BIBLE_BOOKS.find(b => b.name === selBook);
  const totalChapters = bookData?.chapters || 1;
  const displayBook = getTranslatedBookName(book, lang);
  const tabs = onTranslationChange ? ["book", "chapter", "translation"] : ["book", "chapter"];

  const goTo = (newBook, newChapter) => {
    onNavigate(newBook, newChapter);
    setOpen(false);
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

  const openTab = (newTab) => {
    setTab(newTab);
    setOpen(true);
  };

  const chapterNums = Array.from({ length: selBookData?.chapters || 1 }, (_, i) => i + 1);

  // Filter books by search
  const filteredGroups = bookSearch.trim()
    ? GROUPS.map(g => ({
        ...g,
        matchedBooks: BIBLE_BOOKS.filter(b =>
          g.books.includes(b.num) &&
          getTranslatedBookName(b.name, lang).toLowerCase().includes(bookSearch.toLowerCase())
        )
      })).filter(g => g.matchedBooks.length > 0)
    : GROUPS.map(g => ({ ...g, matchedBooks: BIBLE_BOOKS.filter(b => g.books.includes(b.num)) }));

  return (
    <div ref={containerRef} className="relative">
      {/* ── Nav bar ── */}
      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          onClick={prevChapter}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors active:scale-90"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Book + Chapter pill */}
        <button
          onClick={() => open ? setOpen(false) : openTab("book")}
          className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl font-cinzel text-sm font-semibold transition-all"
          style={{
            background: open ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.06)",
            color: open ? "#00f5ff" : "rgba(255,255,255,0.85)",
            border: open ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent",
          }}
        >
          <span>{displayBook}</span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>{chapter}</span>
          <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ color: "rgba(255,255,255,0.35)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
        </button>

        {/* Translation badge */}
        {onTranslationChange && (
          <button
            onClick={() => openTab("translation")}
            className="px-3 h-9 rounded-xl font-cinzel text-xs font-semibold flex-shrink-0 transition-all"
            style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.18)" }}
          >
            {translation}
          </button>
        )}

        {/* Next */}
        <button
          onClick={nextChapter}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors active:scale-90"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Dropdown Panel ── */}
      {open && (
        <div
          ref={panelRef}
          className="absolute left-0 right-0 top-full mt-2 z-[9999] rounded-2xl flex flex-col"
          style={{
            background: "rgba(8,13,26,0.99)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(0,245,255,0.18)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
            maxHeight: "60vh",
            overflow: "hidden",
          }}
        >
          {/* Tabs */}
          <div className="flex flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-[10px] font-cinzel uppercase tracking-widest relative transition-colors"
                style={{ color: tab === t ? "#00f5ff" : "rgba(255,255,255,0.3)" }}
              >
                {t}
                {tab === t && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full bg-cyan" />
                )}
              </button>
            ))}
            <button onClick={() => setOpen(false)} className="px-3 py-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ── BOOK TAB ── */}
          {tab === "book" && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Search */}
              <div className="px-3 pt-3 pb-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
                  <input
                    value={bookSearch}
                    onChange={e => setBookSearch(e.target.value)}
                    placeholder="Search books…"
                    className="flex-1 bg-transparent text-xs font-inter focus:outline-none"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                    autoFocus
                  />
                  {bookSearch && (
                    <button onClick={() => setBookSearch("")} style={{ color: "rgba(255,255,255,0.3)" }}>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Groups */}
              <div className="overflow-y-auto scrollbar-hide flex-1 px-2 pb-3 space-y-1">
                {filteredGroups.map(group => {
                  const isExp = bookSearch.trim() ? true : expandedGroup === group.id;
                  return (
                    <div key={group.id}>
                      {!bookSearch.trim() && (
                        <button
                          onClick={() => setExpandedGroup(isExp ? null : group.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all"
                          style={{
                            background: isExp ? "rgba(0,245,255,0.07)" : "transparent",
                            borderLeft: isExp ? "2px solid #00f5ff" : "2px solid transparent",
                          }}
                        >
                          <ChevronDown className="w-3 h-3 flex-shrink-0 transition-transform"
                            style={{ color: isExp ? "#00f5ff" : "rgba(255,255,255,0.25)", transform: isExp ? "none" : "rotate(-90deg)" }} />
                          <span className="text-[11px] font-cinzel" style={{ color: isExp ? "#00f5ff" : "rgba(255,255,255,0.6)" }}>
                            {group.label}
                          </span>
                        </button>
                      )}
                      {isExp && (
                        <div className={bookSearch.trim() ? "space-y-0.5" : "pl-4 pr-2 pb-1 space-y-0.5"}>
                          {group.matchedBooks.map(b => (
                            <button
                              key={b.name}
                              onClick={() => { setSelBook(b.name); setTab("chapter"); setBookSearch(""); }}
                              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg transition-all"
                              style={{
                                background: selBook === b.name ? "rgba(0,245,255,0.12)" : "transparent",
                                color: selBook === b.name ? "#00f5ff" : "rgba(255,255,255,0.6)",
                              }}
                            >
                              <span className="text-xs font-inter">{getTranslatedBookName(b.name, lang)}</span>
                              <span className="text-[9px] font-inter" style={{ color: "rgba(255,255,255,0.2)" }}>{b.chapters} ch</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CHAPTER TAB ── */}
          {tab === "chapter" && (
            <div className="flex flex-col flex-1 overflow-hidden p-2">
              <p className="text-[9px] font-cinzel uppercase tracking-widest px-2 mb-2 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>
                {getTranslatedBookName(selBook, lang)} — {selBookData?.chapters} chapters
              </p>
              <div className="overflow-y-auto scrollbar-hide flex-1 space-y-0.5">
                {chapterNums.map(ch => {
                  const isActive = selBook === book && ch === chapter;
                  return (
                    <button
                      key={ch}
                      onClick={() => goTo(selBook, ch)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all"
                      style={{
                        background: isActive ? "rgba(0,245,255,0.12)" : "transparent",
                        color: isActive ? "#00f5ff" : "rgba(255,255,255,0.65)",
                        borderLeft: isActive ? "3px solid #00f5ff" : "3px solid transparent",
                      }}
                    >
                      <span className="text-sm font-inter">Chapter {ch}</span>
                      {isActive && <Check className="w-3.5 h-3.5" style={{ color: "#00f5ff" }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TRANSLATION TAB ── */}
          {tab === "translation" && (
            <div className="overflow-y-auto scrollbar-hide flex-1 p-3 space-y-4">
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
                        <button
                          key={t.code}
                          onClick={() => { onTranslationChange?.(t.code); setOpen(false); }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all"
                          style={{
                            background: translation === t.code ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.03)",
                            border: translation === t.code ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-cinzel text-xs font-bold" style={{ color: translation === t.code ? "#00f5ff" : "rgba(255,255,255,0.8)" }}>
                              {t.code}
                            </span>
                            <span className="text-[10px] font-inter truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
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
          )}
        </div>
      )}
    </div>
  );
}