import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Maximize2, Minimize2, Loader2, ChevronUp, Copy, Check, Columns, CheckSquare, FolderPlus, X as XIcon } from "lucide-react";
import FolderSaveModal from "@/components/reader/FolderSaveModal";
import { base44 } from "@/api/base44Client";
import { SAMPLE_VERSES } from "@/lib/sampleVerses";
import { getOfflineVerse } from "@/lib/offlineBible";
import { BIBLE_BOOKS, TRANSLATIONS } from "@/lib/bibleData";
import VerseRow from "@/components/reader/VerseRow.jsx";
import ChapterHeader from "@/components/reader/ChapterHeader.jsx";
import ChapterNavigator from "@/components/reader/ChapterNavigator.jsx";
import StudyDropdown from "@/components/reader/StudyDropdown.jsx";
import { SkeletonVerse } from "@/components/ui/SkeletonPulse.jsx";
import { pageTransition } from "@/hooks/useAnimations";
import ParallelPanel from "@/components/reader/ParallelPanel.jsx";
import VerseSidePanel from "@/components/reader/VerseSidePanel.jsx";


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
  const [copied, setCopied] = useState(false);
  const [showParallel, setShowParallel] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [sidePanelVerse, setSidePanelVerse] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState(new Set());
  const [showFolderModal, setShowFolderModal] = useState(false);
  const containerRef = useRef(null);

  const bookData = BIBLE_BOOKS.find(b => b.name === book);

  useEffect(() => {
    loadChapter();
    loadAnnotations();
  }, [book, chapter, translation]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollTop(el.scrollTop > 500);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const loadChapter = async () => {
    setLoading(true);
    setVerses([]);

    // 1. Offline cache — highest priority, always instant
    const offline = getOfflineVerse(translation, book, chapter);
    if (offline) {
      setVerses(offline);
      setLoading(false);
      trackReading();
      return;
    }

    // 2. KJV bundled samples
    const key = `${book}:${chapter}`;
    if (translation === "KJV" && SAMPLE_VERSES[key]) {
      setVerses(SAMPLE_VERSES[key]);
      setLoading(false);
      trackReading();
      return;
    }

    // 3. Backend API (with timeout safety)
    try {
      const res = await base44.functions.invoke("getChapter", { translation, book, chapter });
      if (res.data?.verses?.length > 0) {
        setVerses(res.data.verses);
      } else if (translation === "KJV") {
        // KJV-only public fallback
        await fetchKjvFallback(book, chapter);
      }
    } catch {
      if (translation === "KJV") {
        await fetchKjvFallback(book, chapter);
      }
    } finally {
      setLoading(false);
      trackReading();
    }
  };

  const fetchKjvFallback = async (b, ch) => {
    try {
      const slug = b.toLowerCase().replace(/\s+/g, "+");
      const r = await fetch(`https://bible-api.com/${slug}+${ch}?translation=kjv`);
      if (r.ok) {
        const d = await r.json();
        setVerses((d.verses || []).map(v => ({ verse: v.verse, text: v.text.trim(), red_letter: false })));
      }
    } catch {}
  };

  const trackReading = () => {
    base44.entities.ReadingProgress.create({ book, chapter, translation, completed_at: new Date().toISOString() }).catch(() => {});
    base44.functions.invoke("updateXP", { action: "READ_CHAPTER", xp_amount: 10 }).catch(() => {});
  };

  const loadAnnotations = async () => {
    try {
      const [hl, bm, nt] = await Promise.all([
        base44.entities.UserHighlight.filter({ book, chapter }),
        base44.entities.Bookmark.filter({ book, chapter }),
        base44.entities.UserNote.filter({ book, chapter }),
      ]);
      const hlMap = {}; (hl || []).forEach(h => { hlMap[h.verse] = { color: h.color }; });
      const bmMap = {}; (bm || []).forEach(b => { bmMap[b.verse] = true; });
      const ntMap = {}; (nt || []).forEach(n => { ntMap[n.verse] = n.note_text; });
      setHighlights(hlMap); setBookmarks(bmMap); setNotes(ntMap);
    } catch {}
  };

  const handleVerseUpdate = ({ type, verseNum, data }) => {
    if (type === "highlight") setHighlights(p => ({ ...p, [verseNum]: data }));
    else if (type === "bookmark") setBookmarks(p => ({ ...p, [verseNum]: data }));
    else if (type === "note") setNotes(p => ({ ...p, [verseNum]: data }));
  };

  const copyChapter = () => {
    if (!verses.length) return;
    const text = verses.map(v => `${v.verse}. ${v.text}`).join("\n");
    const header = `${book} ${chapter} (${translation})\n\n`;
    navigator.clipboard?.writeText(header + text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigate = (newBook, newChapter) => {
    setBook(newBook);
    setChapter(newChapter);
    window.history.pushState({}, "", `/read?book=${encodeURIComponent(newBook)}&chapter=${newChapter}`);
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div {...pageTransition}
      className={`flex flex-col ${immersive ? "fixed inset-0 z-50" : "md:ml-16 min-h-screen"}`}
      style={{ background: immersive ? "#06080f" : undefined }}
    >
      {/* Reader top bar */}
      <div
        className="sticky z-30 px-4 py-3 space-y-3"
        style={{
          top: immersive ? 0 : "57px",
          background: "rgba(6,10,20,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          overflow: "visible",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <ChapterNavigator
              book={book}
              chapter={chapter}
              translation={translation}
              onNavigate={handleNavigate}
              onTranslationChange={(t) => { setTranslation(t); }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1" />
          <IconBtn onClick={() => { setSelectionMode(v => !v); setSelectedVerses(new Set()); }} active={selectionMode} title="Multi-select verses">
            <CheckSquare className="w-4 h-4" />
          </IconBtn>
          <IconBtn onClick={() => copyChapter()} title="Copy chapter">
            {copied ? <Check className="w-4 h-4" style={{ color: "#34d399" }} /> : <Copy className="w-4 h-4" />}
          </IconBtn>
          <IconBtn onClick={() => setShowParallel(true)} title="Parallel view"><Columns className="w-4 h-4" /></IconBtn>
          <IconBtn onClick={() => setShowSettings(v => !v)} active={showSettings}><Settings className="w-4 h-4" /></IconBtn>
          <IconBtn onClick={() => setImmersive(v => !v)}>
            {immersive ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </IconBtn>
        </div>

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl p-4 space-y-4"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <SettingRow label="Font Size">
                  <div className="flex items-center gap-2">
                    <Stepper onClick={() => setFontSize(f => Math.max(14, f - 2))}>−</Stepper>
                    <span className="text-sm text-white/70 w-7 text-center font-inter">{fontSize}</span>
                    <Stepper onClick={() => setFontSize(f => Math.min(28, f + 2))}>+</Stepper>
                  </div>
                </SettingRow>
                <SettingRow label="Font">
                  <div className="flex gap-2">
                    {[["inter", "Sans"], ["playfair", "Serif"], ["cinzel", "Classic"]].map(([f, l]) => (
                      <button key={f} onClick={() => setFontFamily(f)}
                        className="text-xs px-3 py-1 rounded-lg font-inter transition-all"
                        style={{
                          background: fontFamily === f ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)",
                          color: fontFamily === f ? "#00f5ff" : "rgba(255,255,255,0.4)",
                          border: fontFamily === f ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent",
                        }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </SettingRow>
                <SettingRow label="Verse Numbers">
                  <Toggle value={showNumbers} onChange={() => setShowNumbers(v => !v)} />
                </SettingRow>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scrollable reading area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-visible scrollbar-hide">
        <div className="px-4 md:px-8 max-w-2xl mx-auto w-full pb-32 pt-2">
          {/* Chapter header with parallax */}
          <ChapterHeader
            book={book}
            chapter={chapter}
            testament={bookData?.testament || "OT"}
            scrollRef={containerRef}
          />

          {/* Verse selector dropdown */}
          {!loading && verses.length > 0 && (
            <div className="mb-6 mt-4">
              <StudyDropdown
                label="Jump to Verse"
                value={selectedVerse}
                icon="✨"
                onChange={(verseNum) => {
                  setSelectedVerse(verseNum);
                  const verseEl = document.getElementById(`verse-${verseNum}`);
                  if (verseEl) {
                    verseEl.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                items={verses.map(v => ({
                  value: v.verse,
                  label: `${v.verse}. ${v.text.substring(0, 50)}${v.text.length > 50 ? "..." : ""}`
                }))}
              />
            </div>
          )}

          {/* Verses */}
          {loading ? (
            <div className="space-y-1">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonVerse key={i} />)}
            </div>
          ) : (
            <motion.div
              key={`${book}-${chapter}-${translation}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-0.5"
            >
              {verses.map(v => (
                <div key={v.verse} id={`verse-${v.verse}`}>
                  <VerseRow
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
                    fontSize={fontSize}
                    onUpdate={handleVerseUpdate}
                    onOpenNote={(verseData) => setSidePanelVerse(verseData)}
                    selectionMode={selectionMode}
                    isSelected={selectedVerses.has(v.verse)}
                    onToggleSelect={(vn) => setSelectedVerses(prev => {
                      const next = new Set(prev);
                      next.has(vn) ? next.delete(vn) : next.add(vn);
                      return next;
                    })}
                  />
                </div>
              ))}
            </motion.div>
          )}

          {/* Bottom nav */}
          {!loading && verses.length > 0 && (
            <div className="mt-12">
              <ChapterNavigator book={book} chapter={chapter} translation={translation} onNavigate={handleNavigate} />
            </div>
          )}
        </div>
      </div>

      {/* Multi-select action bar */}
      <AnimatePresence>
        {selectionMode && selectedVerses.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(8,13,26,0.97)", border: "1px solid rgba(0,245,255,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", backdropFilter: "blur(20px)" }}
          >
            <span className="font-cinzel text-sm" style={{ color: "#00f5ff" }}>{selectedVerses.size} selected</span>
            <button onClick={() => setShowFolderModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-cinzel"
              style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.3)" }}>
              <FolderPlus className="w-4 h-4" /> Save to Folder
            </button>
            <button onClick={() => { setSelectionMode(false); setSelectedVerses(new Set()); }}
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
              <XIcon className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showFolderModal && (
        <FolderSaveModal
          verseRefs={[...selectedVerses].map(vn => `${book} ${chapter}:${vn} ${translation}`)}
          onClose={() => setShowFolderModal(false)}
          onSaved={() => { setSelectionMode(false); setSelectedVerses(new Set()); setShowFolderModal(false); }}
        />
      )}

      {/* Verse side panel */}
      <VerseSidePanel
        verse={sidePanelVerse}
        book={book}
        chapter={chapter}
        translation={translation}
        onClose={() => setSidePanelVerse(null)}
        onNoteSaved={(verseNum, text) => {
          handleVerseUpdate({ type: "note", verseNum, data: text });
          setSidePanelVerse(null);
        }}
      />

      {/* Parallel view */}
      <AnimatePresence>
        {showParallel && (
          <ParallelPanel
            book={book}
            chapter={chapter}
            primaryTranslation={translation}
            primaryVerses={verses}
            onClose={() => setShowParallel(false)}
          />
        )}
      </AnimatePresence>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-24 md:bottom-8 right-4 w-11 h-11 rounded-full flex items-center justify-center z-30"
            style={{
              background: "rgba(6,10,20,0.85)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <ChevronUp className="w-5 h-5 text-white/50" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Sub-components ──────────────────────────────────────────────
function IconBtn({ children, onClick, active }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
      style={{
        background: active ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.05)",
        color: active ? "#00f5ff" : "rgba(255,255,255,0.4)",
        border: active ? "1px solid rgba(0,245,255,0.2)" : "1px solid transparent",
      }}
    >
      {children}
    </motion.button>
  );
}

function Stepper({ children, onClick }) {
  return (
    <motion.button whileTap={{ scale: 0.88 }} onClick={onClick}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold font-inter"
      style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}>
      {children}
    </motion.button>
  );
}

function SettingRow({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <motion.button
      onClick={onChange}
      className="w-11 h-6 rounded-full relative flex items-center px-1 transition-colors"
      style={{ background: value ? "rgba(0,245,255,0.3)" : "rgba(255,255,255,0.08)" }}
    >
      <motion.span
        animate={{ x: value ? 18 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className="w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </motion.button>
  );
}