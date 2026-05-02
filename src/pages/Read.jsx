import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Maximize2, Minimize2, Loader2, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SAMPLE_VERSES } from "@/lib/sampleVerses";
import { BIBLE_BOOKS, TRANSLATIONS } from "@/lib/bibleData";
import VerseItem from "@/components/reader/VerseItem";
import ChapterNavigator from "@/components/reader/ChapterNavigator";

export default function Read() {
  const params = new URLSearchParams(window.location.search);
  const [book, setBook] = useState(params.get("book") || "John");
  const [chapter, setChapter] = useState(Number(params.get("chapter")) || 3);
  const [translation, setTranslation] = useState("KJV");
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [immersive, setImmersive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("playfair");
  const [showNumbers, setShowNumbers] = useState(true);
  const [highlights, setHighlights] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [notes, setNotes] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    loadChapter();
    loadAnnotations();
  }, [book, chapter, translation]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollTop(el.scrollTop > 400);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const loadChapter = async () => {
    setLoading(true);
    setVerses([]);
    try {
      // Try cached sample data first
      const key = `${book}:${chapter}`;
      if (SAMPLE_VERSES[key]) {
        setVerses(SAMPLE_VERSES[key]);
        setLoading(false);
        trackReading();
        return;
      }

      const res = await base44.functions.invoke("getChapter", { translation, book, chapter });
      if (res.data?.verses?.length > 0) {
        setVerses(res.data.verses);
      } else {
        // Fallback to bible-api.com directly
        const bookSlug = book.toLowerCase().replace(/\s+/g, "+");
        const apiRes = await fetch(`https://bible-api.com/${bookSlug}+${chapter}?translation=kjv`);
        if (apiRes.ok) {
          const data = await apiRes.json();
          setVerses((data.verses || []).map(v => ({
            verse: v.verse, text: v.text.trim(), red_letter: false
          })));
        }
      }
      trackReading();
    } catch (e) {
      const bookSlug = book.toLowerCase().replace(/\s+/g, "+");
      fetch(`https://bible-api.com/${bookSlug}+${chapter}?translation=kjv`)
        .then(r => r.json())
        .then(data => {
          setVerses((data.verses || []).map(v => ({
            verse: v.verse, text: v.text.trim(), red_letter: false
          })));
        })
        .catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const trackReading = async () => {
    try {
      await base44.entities.ReadingProgress.create({
        book, chapter, translation,
        completed_at: new Date().toISOString()
      });
      base44.functions.invoke("updateXP", { action: "READ_CHAPTER", xp_amount: 10 });
    } catch (e) {}
  };

  const loadAnnotations = async () => {
    try {
      const prefix = `${book} ${chapter}:`;
      const [hlList, bmList, noteList] = await Promise.all([
        base44.entities.UserHighlight.filter({ book, chapter }),
        base44.entities.Bookmark.filter({ book, chapter }),
        base44.entities.UserNote.filter({ book, chapter }),
      ]);

      const hlMap = {};
      hlList?.forEach(h => { hlMap[h.verse] = { color: h.color }; });
      setHighlights(hlMap);

      const bmMap = {};
      bmList?.forEach(b => { bmMap[b.verse] = true; });
      setBookmarks(bmMap);

      const noteMap = {};
      noteList?.forEach(n => { noteMap[n.verse] = n.note_text; });
      setNotes(noteMap);
    } catch (e) {}
  };

  const handleVerseUpdate = ({ type, verseNum, data }) => {
    if (type === "highlight") {
      setHighlights(prev => ({ ...prev, [verseNum]: data }));
    } else if (type === "bookmark") {
      setBookmarks(prev => ({ ...prev, [verseNum]: data }));
    } else if (type === "note") {
      setNotes(prev => ({ ...prev, [verseNum]: data }));
    }
  };

  const handleNavigate = (newBook, newChapter, newTranslation) => {
    setBook(newBook);
    setChapter(newChapter);
    if (newTranslation) setTranslation(newTranslation);
    window.history.pushState({}, "", `/read?book=${newBook}&chapter=${newChapter}`);
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const bookData = BIBLE_BOOKS.find(b => b.name === book);

  return (
    <div className={`flex flex-col ${immersive ? "fixed inset-0 z-50 bg-background" : "md:ml-16 min-h-screen"}`}>
      {/* Reader Header */}
      {!immersive && (
        <div className="sticky top-[57px] md:top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50 px-4 py-3 space-y-3">
          <ChapterNavigator
            book={book}
            chapter={chapter}
            translation={translation}
            onNavigate={handleNavigate}
          />
          <div className="flex items-center gap-2">
            {/* Translation Selector */}
            <select
              value={translation}
              onChange={e => { setTranslation(e.target.value); loadChapter(); }}
              className="text-xs bg-muted text-muted-foreground rounded-lg px-2 py-1.5 border-0 focus:outline-none focus:ring-1 focus:ring-cyan"
            >
              {TRANSLATIONS.map(t => (
                <option key={t.code} value={t.code}>{t.code}</option>
              ))}
            </select>

            <div className="flex-1" />

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setImmersive(!immersive)}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              {immersive ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="glass rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Font Size</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setFontSize(f => Math.max(14, f - 2))} className="w-7 h-7 rounded-lg bg-muted text-sm font-bold">−</button>
                      <span className="text-sm w-8 text-center">{fontSize}</span>
                      <button onClick={() => setFontSize(f => Math.min(28, f + 2))} className="w-7 h-7 rounded-lg bg-muted text-sm font-bold">+</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Font</span>
                    <div className="flex gap-2">
                      {[["inter","Sans"], ["playfair","Serif"], ["cinzel","Classic"]].map(([f, l]) => (
                        <button key={f} onClick={() => setFontFamily(f)}
                          className={`text-xs px-2 py-1 rounded-lg transition-colors ${fontFamily === f ? "bg-cyan/20 text-cyan" : "bg-muted text-muted-foreground"}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Verse Numbers</span>
                    <button onClick={() => setShowNumbers(!showNumbers)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${showNumbers ? "bg-cyan" : "bg-muted"}`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${showNumbers ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Immersive header */}
      {immersive && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          <h2 className="font-cinzel text-lg">{book} {chapter}</h2>
          <button onClick={() => setImmersive(false)} className="text-muted-foreground hover:text-foreground">
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Reading Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-8 py-6 max-w-3xl mx-auto w-full"
      >
        {/* Chapter Title */}
        <motion.div
          key={`${book}-${chapter}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="font-cinzel text-3xl font-bold text-foreground">{book}</h1>
          <p className="text-muted-foreground mt-1">Chapter {chapter}</p>
          {bookData && (
            <span className="text-xs text-muted-foreground/50 uppercase tracking-widest">
              {bookData.testament === "OT" ? "Old Testament" : "New Testament"}
            </span>
          )}
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Verses */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-cyan animate-spin" />
            <p className="text-muted-foreground text-sm font-cinzel">Loading scripture...</p>
          </div>
        ) : (
          <motion.div
            key={`verses-${book}-${chapter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-1"
            style={{ fontSize: `${fontSize}px`, fontFamily: `var(--font-${fontFamily})` }}
          >
            {verses.map(v => (
              <VerseItem
                key={v.verse}
                verseNum={v.verse}
                text={v.text}
                redLetter={v.red_letter}
                book={book}
                chapter={chapter}
                translation={translation}
                highlight={highlights[v.verse]}
                isBookmarked={bookmarks[v.verse]}
                note={notes[v.verse]}
                showNumbers={showNumbers}
                onUpdate={handleVerseUpdate}
              />
            ))}
          </motion.div>
        )}

        {/* Chapter Nav at Bottom */}
        {!loading && verses.length > 0 && (
          <div className="mt-12 mb-4">
            <ChapterNavigator
              book={book}
              chapter={chapter}
              translation={translation}
              onNavigate={handleNavigate}
            />
          </div>
        )}
      </div>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-24 md:bottom-6 right-4 w-10 h-10 glass rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground shadow-lg z-20"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}