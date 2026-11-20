import { useState, useEffect, useRef } from "react";
import useSmoothNavigate from "@/hooks/useSmoothNavigate";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Maximize2, Minimize2, ChevronUp, Copy, Check, Columns, CheckSquare } from "lucide-react";
import FolderSaveModal from "@/components/reader/FolderSaveModal";
import { base44 } from "@/api/base44Client";
import { loadChapterAnnotations, recordReadingSession } from "@/lib/dataAccess";
import { SAMPLE_VERSES } from "@/lib/sampleVerses";
import { getOfflineVerse, getOfflineVerseAsync } from "@/lib/offlineBible";
import { BIBLE_BOOKS, getTranslatedBookName, toEnglishBookName, getTranslationLang, DEFAULT_TRANSLATION_BY_LANG } from "@/lib/bibleData";
import VerseRow from "@/components/reader/VerseRow.jsx";
import ChapterHeader from "@/components/reader/ChapterHeader.jsx";
import ChapterNavigator from "@/components/reader/ChapterNavigator.jsx";
import StudyDropdown from "@/components/reader/StudyDropdown.jsx";
import { SkeletonVerse } from "@/components/ui/SkeletonPulse.jsx";
import { EmptyState } from "@/components/ui/states";
import { pageTransition } from "@/hooks/useAnimations";
import ParallelPanel from "@/components/reader/ParallelPanel.jsx";
import VerseSidePanel from "@/components/reader/VerseSidePanel.jsx";
import DevotionalPanel from "@/components/reader/DevotionalPanel.jsx";
import ChapterAudioPlayer from "@/components/reader/ChapterAudioPlayer";
import { savePrefs } from "@/lib/preferencesSync";
import { chooseTranslation } from "@/lib/defaultBible";
import GuidedReflection from "@/components/prayer/GuidedReflection";
import MultiSelectActionBar from "@/components/reader/MultiSelectActionBar.jsx";
import ReaderSettingsPanel from "@/components/reader/ReaderSettingsPanel.jsx";
import IconBtn from "@/components/reader/ReaderIconButton.jsx";
import ChapterDownloadButton from "@/components/reader/ChapterDownloadButton.jsx";
import useVerseSelection from "@/hooks/useVerseSelection";
import { useLang } from "@/lib/LanguageContext";
import ChapterPager from "@/components/reader/ChapterPager";
import BookSidebar from "@/components/reader/BookSidebar";


export default function Read() {
  const { lang, t } = useLang();
  const params = new URLSearchParams(window.location.search);
  const [book, setBook] = useState(toEnglishBookName(params.get("book") || "John"));
  const [chapter, setChapter] = useState(Number(params.get("chapter")) || 3);
  const [translation, setTranslation] = useState(() => {
    const explicit = params.get("translation");
    if (explicit) return explicit;
    const stored = localStorage.getItem("veritas_translation");
    // The user's explicit choice always wins; the app-language default is only a first-run fallback.
    return stored || DEFAULT_TRANSLATION_BY_LANG[lang] || "KJV";
  });

  // Persist the Bible version choice (local + saved preferences).
  useEffect(() => {
    if (localStorage.getItem("veritas_translation") === translation) return;
    localStorage.setItem("veritas_translation", translation);
    savePrefs({ default_translation: translation });
  }, [translation]);

  // Language switched elsewhere → Bible text follows.
  useEffect(() => {
    const onTranslation = (e) => setTranslation(e.detail);
    window.addEventListener("veritas:translation", onTranslation);
    return () => window.removeEventListener("veritas:translation", onTranslation);
  }, []);
  const targetVerse = Number(params.get("verse")) || null;
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [immersive, setImmersive] = useState(params.get("immersive") === "1");
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem("veritas_reader_font_size")) || 18);
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem("veritas_reader_font_family") || "playfair");
  const [showNumbers, setShowNumbers] = useState(() => localStorage.getItem("veritas_verse_numbers") !== "false");

  // Persist reading settings (local + saved preferences).
  useEffect(() => {
    const changed = localStorage.getItem("veritas_reader_font_size") !== String(fontSize)
      || localStorage.getItem("veritas_reader_font_family") !== fontFamily
      || localStorage.getItem("veritas_verse_numbers") !== String(showNumbers);
    if (!changed) return;
    localStorage.setItem("veritas_reader_font_size", String(fontSize));
    localStorage.setItem("veritas_reader_font_family", fontFamily);
    localStorage.setItem("veritas_verse_numbers", String(showNumbers));
    const ff = ["inter", "playfair", "cinzel"].includes(fontFamily) ? { font_family: fontFamily } : {};
    savePrefs({ font_size: fontSize, show_verse_numbers: showNumbers, ...ff });
  }, [fontSize, fontFamily, showNumbers]);
  const [oledMode, setOledMode] = useState(() => localStorage.getItem("veritas_oled_mode") === "true");
  const [highlights, setHighlights] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [notes, setNotes] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showParallel, setShowParallel] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [sidePanelVerse, setSidePanelVerse] = useState(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [jumpedVerse, setJumpedVerse] = useState(null);
  const [devotionalVerse, setDevotionalVerse] = useState(null);
  const [showReflection, setShowReflection] = useState(false);
  const navigate = useSmoothNavigate();
  const containerRef = useRef(null);
  const glowTimerRef = useRef(null);

  const bookData = BIBLE_BOOKS.find(b => b.name === book);
  const {
    selectionMode,
    selectedVerses,
    copiedSelection,
    selectedVerseRefs,
    clearSelection,
    toggleSelectionMode,
    toggleVerseSelection,
    copySelectedVerses,
  } = useVerseSelection({ verses, book, chapter, translation });

  useEffect(() => {
    loadChapter();
    loadAnnotations();
  }, [book, chapter, translation]);

  // Auto-scroll + glow when coming from VOTD / plans / devotionals via ?verse=N
  useEffect(() => {
    if (!targetVerse || loading) return;
    clearTimeout(glowTimerRef.current);
    // Small delay to allow verses to render
    glowTimerRef.current = setTimeout(() => {
      const el = document.getElementById(`verse-${targetVerse}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      setJumpedVerse(targetVerse);
      glowTimerRef.current = setTimeout(() => setJumpedVerse(null), 2500);
    }, 400);
    return () => clearTimeout(glowTimerRef.current);
  }, [targetVerse, loading]);

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
    const offline = getOfflineVerse(translation, book, chapter)
      || (translation === "KJV" ? getOfflineVerse("PLAN_CACHE", book, chapter) : null);
    if (offline) {
      setVerses(offline);
      setLoading(false);
      trackReading(offline);
      return;
    }

    const indexedOffline = await getOfflineVerseAsync(translation, book, chapter)
      || (translation === "KJV" ? await getOfflineVerseAsync("PLAN_CACHE", book, chapter) : null);
    if (indexedOffline) {
      setVerses(indexedOffline);
      setLoading(false);
      trackReading(indexedOffline);
      return;
    }

    // 2. KJV bundled samples
    const key = `${book}:${chapter}`;
    if (translation === "KJV" && SAMPLE_VERSES[key]) {
      setVerses(SAMPLE_VERSES[key]);
      setLoading(false);
      trackReading(SAMPLE_VERSES[key]);
      return;
    }

    // 3. Backend API (with timeout safety)
    let fetchedVerses = [];
    try {
      const res = await base44.functions.invoke("getChapter", { translation, book, chapter });
      if (res.data?.verses?.length > 0) {
        fetchedVerses = res.data.verses;
        setVerses(fetchedVerses);
      } else if (translation === "KJV") {
        await fetchKjvFallback(book, chapter);
      }
    } catch {
      if (translation === "KJV") {
        await fetchKjvFallback(book, chapter);
      }
    } finally {
      setLoading(false);
      trackReading(fetchedVerses);
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

  const trackReading = (versesLoaded) => {
    if (!versesLoaded || versesLoaded.length === 0) return;
    // Idempotent reading session (consolidated), keyed per user/day/chapter
    recordReadingSession({ book, chapter, translation }).catch(() => {});
    // Show guided reflection after reading
    setTimeout(() => setShowReflection(true), 1500);
  };

  const loadAnnotations = async () => {
    const { highlights: hlMap, bookmarks: bmMap, notes: ntMap } = await loadChapterAnnotations({ book, chapter });
    setHighlights(hlMap); setBookmarks(bmMap); setNotes(ntMap);
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

  const toggleImmersive = () => {
    const next = !immersive;
    setImmersive(next);
    const sp = new URLSearchParams(window.location.search);
    if (next) sp.set("immersive", "1");
    else sp.delete("immersive");
    navigate(`/read?${sp.toString()}`, { replace: true });
  };

  const handleNavigate = (newBook, newChapter) => {
    setBook(newBook);
    setChapter(newChapter);
    const immParam = immersive ? "&immersive=1" : "";
    navigate(`/read?book=${encodeURIComponent(newBook)}&chapter=${newChapter}${immParam}`, { replace: false });
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div {...pageTransition}
      className={`flex flex-col ${immersive ? "fixed inset-0 z-50" : "min-h-screen reader-offset"}`}
      style={{ background: oledMode ? "#000000" : immersive ? "hsl(var(--background))" : undefined }}
    >
      {!immersive && <BookSidebar book={book} translation={translation} onNavigate={handleNavigate} />}
      {/* Reader top bar */}
      <div
        className="sticky z-30 px-4 py-3 space-y-3"
        style={{
          top: immersive ? 0 : "57px",
          background: oledMode ? "rgba(0,0,0,0.97)" : "var(--chrome-surface)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgb(var(--ink) / 0.06)",
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
              onTranslationChange={(code) => { setTranslation(code); chooseTranslation(code); }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1" />
          <IconBtn onClick={toggleSelectionMode} active={selectionMode} title={t.multiSelect}>
            <CheckSquare className="w-4 h-4" />
          </IconBtn>
          <IconBtn onClick={() => copyChapter()} title={t.copyChapter}>
            {copied ? <Check className="w-4 h-4" style={{ color: "#34d399" }} /> : <Copy className="w-4 h-4" />}
          </IconBtn>
          <ChapterDownloadButton book={book} chapter={chapter} translation={translation} />
          <IconBtn onClick={() => setShowParallel(true)} title={t.parallelView}><Columns className="w-4 h-4" /></IconBtn>
          <IconBtn onClick={() => setDevotionalVerse(verses[0] ? { verse_ref: `${book} ${chapter}:${verses[0].verse}`, verse_text: verses[0].text } : null)} title={t.aiDevotional}>✨</IconBtn>
          <IconBtn onClick={() => setShowSettings(v => !v)} active={showSettings} title={t.readerSettings}><Settings className="w-4 h-4" /></IconBtn>
          <IconBtn onClick={toggleImmersive} title={immersive ? t.exitFocus : t.enterFocus}>
            {immersive ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </IconBtn>
        </div>

        {/* Settings panel */}
        <ReaderSettingsPanel
          open={showSettings}
          fontSize={fontSize}
          setFontSize={setFontSize}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          showNumbers={showNumbers}
          setShowNumbers={setShowNumbers}
          oledMode={oledMode}
          setOledMode={setOledMode}
        />
      </div>

      {/* Scrollable reading area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-visible scrollbar-hide">
        <div className="mx-3 sm:mx-auto sm:w-full max-w-2xl my-3 mb-40 rounded-3xl bg-card border border-border px-4 md:px-8 pb-6 pt-1" style={{ boxShadow: "0 4px 24px rgba(40,30,15,0.08)" }}>
          {/* Chapter header with parallax */}
          <ChapterHeader
            book={book}
            chapter={chapter}
            translation={translation}
            testament={bookData?.testament || "OT"}
            scrollRef={containerRef}
          />

          {/* Verse selector dropdown */}
          {!loading && verses.length > 0 && (
            <div className="mb-6 mt-4">
              <StudyDropdown
                label={t.jumpToVerse || "Jump to Verse"}
                placeholder={t.select}
                value={selectedVerse}
                icon="✨"
                onChange={(verseNum) => {
                  setSelectedVerse(verseNum);
                  setJumpedVerse(verseNum);
                  setTimeout(() => setJumpedVerse(null), 2000);
                  const verseEl = document.getElementById(`verse-${verseNum}`);
                  if (verseEl) {
                    verseEl.scrollIntoView({ behavior: "smooth", block: "center" });
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
          ) : verses.length === 0 ? (
            <EmptyState
              icon="📖"
              title={`${getTranslatedBookName(book, getTranslationLang(translation))} ${chapter} ${t.notOfflineTitle}`}
              description={t.notOfflineDesc}
            />
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
                    isJumped={jumpedVerse === v.verse}
                    onToggleSelect={toggleVerseSelection}
                  />
                </div>
              ))}
            </motion.div>
          )}

          {/* Guided Reflection — shown after chapter is read */}
          <AnimatePresence>
            {showReflection && !loading && verses.length > 0 && (
              <div className="mt-8">
                <GuidedReflection
                  book={book}
                  chapter={chapter}
                  verses={verses}
                  onClose={() => setShowReflection(false)}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Bottom nav */}
          {!loading && verses.length > 0 && (
            <ChapterPager book={book} chapter={chapter} translation={translation} onNavigate={handleNavigate} />
          )}
        </div>
      </div>

      {/* Multi-select action bar */}
      <AnimatePresence>
        {selectionMode && selectedVerses.size > 0 && (
          <MultiSelectActionBar
            selectedCount={selectedVerses.size}
            copied={copiedSelection}
            onCopy={copySelectedVerses}
            onSave={() => setShowFolderModal(true)}
            onCancel={clearSelection}
          />
        )}
      </AnimatePresence>

      {showFolderModal && (
        <FolderSaveModal
          verseRefs={selectedVerseRefs}
          onClose={() => setShowFolderModal(false)}
          onSaved={() => { clearSelection(); setShowFolderModal(false); }}
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

      {/* Devotional panel */}
      <AnimatePresence>
        {devotionalVerse && (
          <DevotionalPanel
            book={book}
            chapter={chapter}
            verseRef={devotionalVerse.verse_ref}
            verseText={devotionalVerse.verse_text}
            translation={translation}
            onClose={() => setDevotionalVerse(null)}
          />
        )}
      </AnimatePresence>

      {/* Chapter Audio Player */}
      {!loading && verses.length > 0 && (
        <ChapterAudioPlayer book={book} chapter={chapter} translation={translation} verses={verses} />
      )}

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-24 min-[1101px]:bottom-8 right-4 w-11 h-11 rounded-full flex items-center justify-center z-30"
            style={{
              background: "hsl(var(--surface-4) / 0.92)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgb(var(--ink) / 0.1)",
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