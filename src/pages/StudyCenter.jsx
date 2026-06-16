import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, AlertCircle } from "lucide-react";
import TranslationSplitView from "@/components/study/TranslationSplitView";
import StudyNoteTemplates from "@/components/study/StudyNoteTemplates";
import CrossReferencePanel from "@/components/study/CrossReferencePanel";
import MemorizeMode from "@/components/study/MemorizeMode";
import FlashcardStudy from "@/components/study/FlashcardStudy";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BIBLE_BOOKS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";
import StudyDropdown from "@/components/reader/StudyDropdown";
import NotesArchive from "@/components/study/NotesArchive";
import StudyProgressMap from "@/components/study/StudyProgressMap";
import StudyCenterTabs from "@/components/study/StudyCenterTabs.jsx";
import StudyDepthSelector from "@/components/study/StudyDepthSelector.jsx";
import ExplainThisPanel from "@/components/study/ExplainThisPanel.jsx";
import VoiceNotesPanel from "@/components/study/VoiceNotesPanel.jsx";

export default function StudyCenter() {
  const { lang } = useLang();
  const location = useLocation();
  const isMountedRef = useRef(true);

  // Restore state from URL params
  const urlParams = new URLSearchParams(location.search);
  const [selectedBook, setSelectedBook] = useState(urlParams.get("book") || "John");
  const [selectedChapter, setSelectedChapter] = useState(parseInt(urlParams.get("chapter")) || 1);
  const [expandedVerses, setExpandedVerses] = useState(new Set());
  const [verseData, setVerseData] = useState({});
  const [outline, setOutline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [depth, setDepth] = useState(urlParams.get("depth") || "overview");
  const [expandedCategory, setExpandedCategory] = useState("Gospels");
  const [splitView, setSplitView] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis"); // "analysis" | "sidebyside" | "templates"
  const [showCrossRef, setShowCrossRef] = useState(false);
  const [activeVerses, setActiveVerses] = useState([]);
  const [explainVerse, setExplainVerse] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainResult, setExplainResult] = useState(null);
  const [audioNotes, setAudioNotes] = useState([]);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playingAudioUrl, setPlayingAudioUrl] = useState(null);
  const audioElRef = useRef(null);

  // Update URL when state changes
  useEffect(() => {
    const newParams = new URLSearchParams();
    newParams.set("book", selectedBook);
    newParams.set("chapter", selectedChapter);
    newParams.set("depth", depth);
    window.history.replaceState(null, "", `?${newParams.toString()}`);
  }, [selectedBook, selectedChapter, depth]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const explainPassage = async () => {
    if (!explainVerse.trim()) return;
    setExplainLoading(true);
    setExplainResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a concise theological summary (3-4 sentences) of "${explainVerse}" from the Bible. Include: 1) Historical/cultural context, 2) Key theological meaning, 3) How it fits in the broader biblical narrative. Be scholarly but accessible.`,
      });
      setExplainResult(typeof res === "string" ? res : res?.text || "");
    } finally {
      setExplainLoading(false);
    }
  };

  const loadAudioNotes = async () => {
    setAudioLoading(true);
    try {
      const notes = await base44.entities.VerseAudioReflection.list("-created_date", 20);
      setAudioNotes(notes || []);
    } finally {
      setAudioLoading(false);
    }
  };

  useEffect(() => { loadAudioNotes(); }, []);

  const loadOutline = async (book) => {
    setLoading(true);
    setOutline(null);
    setError(null);
    try {
      const res = await base44.functions.invoke("generateBibleOutline", {
        book,
        depth,
        language: lang
      });
      if (!isMountedRef.current) return;
      const outlineData = res.data?.outline?.response || res.data?.outline;
      if (outlineData && typeof outlineData === "object") {
        setOutline(outlineData);
      } else {
        setError("Unable to load analysis. Please try again.");
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error("Error loading outline:", err);
      setError(err?.message || "Failed to analyze. Please try again.");
      setOutline(null);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const loadVerse = async (verseKey) => {
    if (verseData[verseKey]) return;
    try {
      const res = await base44.functions.invoke("getChapter", {
        book: selectedBook,
        chapter: selectedChapter,
        translation: "KJV"
      });
      if (!isMountedRef.current) return;
      if (res.data?.verses) {
        const versesMap = {};
        res.data.verses.forEach(v => {
          versesMap[`${selectedChapter}:${v.verse}`] = v.text;
        });
        setVerseData(prev => ({ ...prev, ...versesMap }));
      }
    } catch (err) {
      console.error("Error loading verse:", err);
    }
  };

  useEffect(() => {
    loadOutline(selectedBook);
  }, [selectedBook, depth, lang]);

  const theologicalGroups = [
    { id: "Pentateuch", name: "📖 The Law (Pentateuch)", books: BIBLE_BOOKS.filter(b => [1,2,3,4,5].includes(b.num)) },
    { id: "Historical", name: "⚔️ Historical Books", books: BIBLE_BOOKS.filter(b => [6,7,8,9,10,11,12,13,14,15,16,17].includes(b.num)) },
    { id: "Wisdom", name: "💎 Wisdom & Poetry", books: BIBLE_BOOKS.filter(b => [18,19,20,21,22].includes(b.num)) },
    { id: "Prophetic", name: "🔥 Major Prophets", books: BIBLE_BOOKS.filter(b => [23,24,25,26,27].includes(b.num)) },
    { id: "MinorProphets", name: "⚡ Minor Prophets", books: BIBLE_BOOKS.filter(b => [28,29,30,31,32,33,34,35,36,37,38,39].includes(b.num)) },
    { id: "Gospels", name: "✝️ The Gospels", books: BIBLE_BOOKS.filter(b => [40,41,42,43].includes(b.num)) },
    { id: "Acts", name: "🌍 Acts & Epistles", books: BIBLE_BOOKS.filter(b => [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65].includes(b.num)) },
    { id: "Revelation", name: "👑 Revelation", books: BIBLE_BOOKS.filter(b => b.num === 66) }
  ];


  return (
    <div className="md:ml-16 min-h-screen pb-28 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto pt-6 mb-6">
        <h1 className="font-cinzel text-2xl font-bold text-white mb-1">Study Center</h1>
        <p className="text-sm text-white/50 mb-5">Deep dive into scripture with AI-powered analysis</p>

        <StudyCenterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showCrossRef={showCrossRef}
          onToggleCrossRef={() => setShowCrossRef(!showCrossRef)}
        />
                </div>

      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── TEMPLATES TAB ── */}
        {activeTab === "templates" && (
          <StudyNoteTemplates book={selectedBook} chapter={selectedChapter} />
        )}

        {/* ── MEMORIZE TAB ── */}
        {activeTab === "memorize" && (
          <MemorizeMode book={selectedBook} chapter={selectedChapter} />
        )}

        {/* ── FLASHCARDS TAB ── */}
        {activeTab === "flashcards" && (
          <FlashcardStudy />
        )}

        {/* ── SIDE BY SIDE TAB ── */}
        {activeTab === "sidebyside" && (
          <TranslationSplitView book={selectedBook} chapter={selectedChapter} />
        )}

        {/* ── NOTES ARCHIVE TAB ── */}
        {activeTab === "notes" && (
          <NotesArchive />
        )}

        {/* ── JOURNEY TAB ── */}
        {activeTab === "journey" && (
          <StudyProgressMap />
        )}

        {/* ── ANALYSIS TAB ── */}
        {activeTab === "analysis" && (
          <>
            {/* Book selector */}
            <div className="rounded-2xl p-4 md:p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] font-cinzel uppercase tracking-widest mb-4 text-white/40">Books of the Bible</p>
              <div className="space-y-2">
                {theologicalGroups.map(group => (
                  <div key={group.id}>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setExpandedCategory(expandedCategory === group.id ? null : group.id)}
                      className="w-full flex items-center gap-2 px-4 py-3.5 rounded-xl transition-all text-left"
                      style={{
                        background: expandedCategory === group.id ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.05)",
                        borderLeft: expandedCategory === group.id ? "3px solid #00f5ff" : "3px solid transparent"
                      }}
                    >
                      <ChevronDown
                        className="w-4 h-4 flex-shrink-0"
                        style={{
                          color: expandedCategory === group.id ? "#00f5ff" : "rgba(255,255,255,0.3)",
                          transform: expandedCategory === group.id ? "rotate(0deg)" : "rotate(-90deg)",
                          transition: "transform 0.2s"
                        }}
                      />
                      <span className="text-sm font-cinzel text-white flex-1">{group.name}</span>
                    </motion.button>

                    <AnimatePresence>
                      {expandedCategory === group.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-2"
                        >
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 pl-4">
                            {group.books.map(b => (
                              <motion.button
                                key={b.name}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setSelectedBook(b.name);
                                  setSelectedChapter(1);
                                  setExpandedVerses(new Set());
                                  setVerseData({});
                                }}
                                className="py-4 px-2 rounded-xl text-xs font-cinzel transition-all text-center font-bold"
                                style={{
                                  background: selectedBook === b.name ? "rgba(0,245,255,0.25)" : "rgba(255,255,255,0.06)",
                                  color: selectedBook === b.name ? "#00f5ff" : "rgba(255,255,255,0.55)",
                                  border: selectedBook === b.name ? "2px solid rgba(0,245,255,0.4)" : "1px solid rgba(255,255,255,0.08)"
                                }}
                              >
                                {getTranslatedBookName(b.name, lang).substring(0, 7)}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapter selector */}
            {selectedBook && (
              <StudyDropdown
                label={getTranslatedBookName(selectedBook, lang)}
                value={selectedChapter}
                icon="📖"
                onChange={setSelectedChapter}
                items={Array.from({ length: BIBLE_BOOKS.find(b => b.name === selectedBook)?.chapters || 1 }, (_, i) => ({
                  value: i + 1,
                  label: `Chapter ${i + 1}`
                }))}
              />
            )}

            <StudyDepthSelector depth={depth} onChange={setDepth} />

            {/* Verse dropdown */}
            {selectedChapter && !loading && (
              <StudyDropdown
                label="Explore Verses"
                value={expandedVerses.size > 0 ? Array.from(expandedVerses)[0] : null}
                icon="✨"
                onChange={(verse) => {
                  const verseKey = `${selectedChapter}:${verse}`;
                  loadVerse(verseKey);
                  const newExpanded = new Set(expandedVerses);
                  newExpanded.add(verse);
                  setExpandedVerses(newExpanded);
                }}
                items={Array.from({ length: 15 }, (_, i) => i + 1).map(verse => {
                  const verseKey = `${selectedChapter}:${verse}`;
                  const text = verseData[verseKey] || "Loading...";
                  return {
                    value: verse,
                    label: `${selectedBook} ${selectedChapter}:${verse}`,
                    subtitle: text.substring(0, 60) + (text.length > 60 ? "..." : "")
                  };
                })}
              />
            )}

            <ExplainThisPanel
              value={explainVerse}
              onChange={setExplainVerse}
              onExplain={explainPassage}
              loading={explainLoading}
              result={explainResult}
              onClearResult={() => setExplainResult(null)}
              placeholder={`e.g. John 3:16, ${selectedBook} ${selectedChapter}:1-5`}
            />

            <VoiceNotesPanel
              notes={audioNotes}
              audioRef={audioElRef}
              playingAudioUrl={playingAudioUrl}
              onPlayingChange={setPlayingAudioUrl}
            />

            {/* Outline */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-cyan mb-3" />
                <p className="text-sm text-white/60">Analyzing {getTranslatedBookName(selectedBook, lang)}...</p>
                <p className="text-xs text-white/30 mt-2">This may take a moment</p>
              </div>
            ) : error ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl p-6 flex items-start gap-3"
                style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-cinzel text-red-400">Analysis Failed</p>
                  <p className="text-xs text-white/50 mt-1">{error}</p>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => loadOutline(selectedBook)}
                    className="text-xs font-cinzel mt-3 px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(248,113,113,0.15)", color: "#f87171" }}>
                    Try Again
                  </motion.button>
                </div>
              </motion.div>
            ) : outline && typeof outline === "object" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="rounded-2xl p-4 md:p-6" style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.15)" }}>
                  <h2 className="font-cinzel text-lg text-white mb-4">{outline.book || getTranslatedBookName(selectedBook, lang)}</h2>
                  {outline.themes?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-cinzel text-white/60 mb-2">THEMES</p>
                      <div className="flex flex-wrap gap-2">
                        {outline.themes.map((theme, idx) => (
                          <span key={idx} className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff" }}>{theme}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {outline.sections?.length > 0 && (
                    <div className="space-y-4">
                      {outline.sections.map((section, idx) => (
                        <div key={idx} className="pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                          <p className="font-cinzel text-white mb-2">{section.title || `Section ${idx + 1}`}</p>
                          <p className="text-sm text-white/50 leading-relaxed mb-2">{section.summary || ""}</p>
                          {section.key_verses?.length > 0 && (
                            <div className="text-[11px] text-white/40">
                              <p className="font-inter font-semibold mb-1">Key verses:</p>
                              <ul className="list-disc list-inside space-y-0.5">
                                {section.key_verses.slice(0, 3).map((v, vi) => <li key={vi}>{v}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {outline.theology && (
                    <div>
                      <p className="text-xs font-cinzel text-white/60 mb-2">THEOLOGICAL SIGNIFICANCE</p>
                      <p className="text-sm leading-relaxed text-white/60">{outline.theology}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </>
          )}
          </div>

          {/* Cross-reference side panel */}
          <AnimatePresence>
          {showCrossRef && (
           <CrossReferencePanel book={selectedBook} chapter={selectedChapter} activeVerses={activeVerses} />
          )}
          </AnimatePresence>
          </div>
          );
          }