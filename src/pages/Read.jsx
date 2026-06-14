import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Maximize2, Minimize2, Loader2, ChevronUp, Copy, Check, Columns, CheckSquare, FolderPlus, X as XIcon } from "lucide-react";
import FolderSaveModal from "@/components/reader/FolderSaveModal";
import { base44 } from "@/api/base44Client";
import { SAMPLE_VERSES } from "@/lib/sampleVerses";
import { getOfflineVerse, getOfflineVerseAsync } from "@/lib/offlineBible";
import { BIBLE_BOOKS, TRANSLATIONS } from "@/lib/bibleData";
import VerseRow from "@/components/reader/VerseRow.jsx";
import ChapterHeader from "@/components/reader/ChapterHeader.jsx";
import ChapterNavigator from "@/components/reader/ChapterNavigator.jsx";
import StudyDropdown from "@/components/reader/StudyDropdown.jsx";
import { SkeletonVerse } from "@/components/ui/SkeletonPulse.jsx";
import { pageTransition } from "@/hooks/useAnimations";
import ParallelPanel from "@/components/reader/ParallelPanel.jsx";
import VerseSidePanel from "@/components/reader/VerseSidePanel.jsx";
import DevotionalPanel from "@/components/reader/DevotionalPanel.jsx";
import ChapterAudioPlayer from "@/components/reader/ChapterAudioPlayer";
import GuidedReflection from "@/components/prayer/GuidedReflection";


export default function Read() {
  const params = new URLSearchParams(window.location.search);
  const [book, setBook] = useState(params.get("book") || "John");
  const [chapter, setChapter] = useState(Number(params.get("chapter")) || 3);
  const [translation, setTranslation] = useState(
    params.get("translation") || localStorage.getItem("veritas_translation") || "KJV"
  );
  const targetVerse = Number(params.get("verse")) || null;
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [immersive, setImmersive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("playfair");
  const [showNumbers, setShowNumbers] = useState(true);
  const [oledMode, setOledMode] = useState(() => localStorage.getItem("veritas_oled_mode") === "true");
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
  const [copiedSelection, setCopiedSelection] = useState(false);
  const [jumpedVerse, setJumpedVerse] = useState(null);
  const [devotionalVerse, setDevotionalVerse] = useState(null);
  const [showReflection, setShowReflection] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const glowTimerRef = useRef(null);

  const bookData = BIBLE_BOOKS.find(b => b.name === book);

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
    base44.entities.ReadingProgress.create({ book, chapter, translation, completed_at: new Date().toISOString() }).catch(() => {});
    // Show guided reflection after reading
    setTimeout(() => setShowReflection(true), 1500);
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

  const copySelectedVerses = async () => {
    const selectedNums = [...selectedVerses].sort((a, b) => a - b);
    if (!selectedNums.length) return;

    const selectedVerseData = selectedNums
      .map(num => verses.find(v => v.verse === num))
      .filter(Boolean);
    const first = selectedNums[0];
    const last = selectedNums[selectedNums.length - 1];
    const isContiguous = selectedNums.every((num, index) => index === 0 || num === selectedNums[index - 1] + 1);
    const verseLabel = selectedNums.length === 1
      ? `${first}`
      : isContiguous ? `${first}-${last}` : selectedNums.join(", ");
    const reference = `${book} ${chapter}:${verseLabel} · ${translation}`;
    const now = new Date();
    const date = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const body = selectedVerseData.map(v => `${v.verse}. ${v.text}`).join("\n");
    const plainText = `${reference}\n${date} at ${time}\n\n${body}`;
    const escapeHtml = (value) => String(value).replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
    const htmlBody = selectedVerseData.map(v => `<p style="margin: 0 0 10px; color: #ffffff; font-size: 19px; text-decoration: none;"><span style="color: #fbbf24; font-weight: 700; margin-right: 8px; text-decoration: none;">${v.verse}</span>${escapeHtml(v.text)}</p>`).join("");
    const html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #ffffff; background: #000000; line-height: 1.55; text-decoration: none;">
      <p style="margin: 0 0 8px; color: #ffffff; font-size: 18px; font-weight: 700; text-decoration: none;">${escapeHtml(reference)}</p>
      <p style="margin: 0 0 18px; color: #d1d5db; font-size: 13px; text-decoration: none;">${escapeHtml(date)} · ${escapeHtml(time)}</p>
      ${htmlBody}
    </div>`;

    if (navigator.clipboard?.write && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([plainText], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        })
      ]);
    } else {
      await navigator.clipboard?.writeText(plainText);
    }
    setCopiedSelection(true);
    setTimeout(() => setCopiedSelection(false), 1800);
  };

  const handleNavigate = (newBook, newChapter) => {
    setBook(newBook);
    setChapter(newChapter);
    navigate(`/read?book=${encodeURIComponent(newBook)}&chapter=${newChapter}`, { replace: false });
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div {...pageTransition}
      className={`flex flex-col ${immersive ? "fixed inset-0 z-50" : "md:ml-16 min-h-screen"}`}
      style={{ background: oledMode ? "#000000" : immersive ? "#06080f" : undefined }}
    >
      {/* Reader top bar */}
      <div
        className="sticky z-30 px-4 py-3 space-y-3"
        style={{
          top: immersive ? 0 : "57px",
          background: oledMode ? "rgba(0,0,0,0.97)" : "rgba(6,10,20,0.9)",
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
              onTranslationChange={(t) => { setTranslation(t); localStorage.setItem("veritas_translation", t); }}
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
          <IconBtn onClick={() => setDevotionalVerse(verses[0] ? { verse_ref: `${book} ${chapter}:${verses[0].verse}`, verse_text: verses[0].text } : null)} title="AI Devotional">✨</IconBtn>
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
                    <Stepper onClick={() => setFontSize(f => Math.max(12, f - 2))}>−</Stepper>
                    <span className="text-sm text-white/70 w-7 text-center font-inter">{fontSize}</span>
                    <Stepper onClick={() => setFontSize(f => Math.min(32, f + 2))}>+</Stepper>
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
                <SettingRow label="OLED Dark Mode">
                  <Toggle value={oledMode} onChange={() => {
                    const next = !oledMode;
                    setOledMode(next);
                    localStorage.setItem("veritas_oled_mode", String(next));
                  }} />
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
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-center gap-2 px-3 py-3 rounded-2xl max-w-[calc(100vw-24px)] flex-wrap"
            style={{ background: "rgba(8,13,26,0.97)", border: "1px solid rgba(0,245,255,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", backdropFilter: "blur(20px)" }}
          >
            <span className="font-cinzel text-sm" style={{ color: "#00f5ff" }}>{selectedVerses.size} selected</span>
            <button onClick={copySelectedVerses}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-cinzel whitespace-nowrap"
              style={{ background: copiedSelection ? "rgba(52,211,153,0.16)" : "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.28)" }}>
              {copiedSelection ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiedSelection ? "Copied" : "Copy"}
            </button>
            <button onClick={() => setShowFolderModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-cinzel whitespace-nowrap"
              style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.3)" }}>
              <FolderPlus className="w-4 h-4" /> <span className="sm:hidden">Save</span><span className="hidden sm:inline">Save to Folder</span>
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

      {/* Devotional panel */}
      <AnimatePresence>
        {devotionalVerse && (
          <DevotionalPanel
            book={book}
            chapter={chapter}
            verseRef={devotionalVerse.verse_ref}
            verseText={devotionalVerse.verse_text}
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