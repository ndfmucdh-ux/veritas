import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, AlertCircle, Columns, FileText, Lightbulb, Sparkles, X, Mic, Play, Pause } from "lucide-react";
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

  const depths = [
    { id: "overview", label: "Overview", icon: "📄" },
    { id: "detailed", label: "Detailed", icon: "📖" },
    { id: "advanced", label: "Advanced", icon: "🎓" }
  ];

  return (
    <div className="md:ml-16 min-h-screen pb-28 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto pt-6 mb-6">
        <h1 className="font-cinzel text-2xl font-bold text-white mb-1">Study Center</h1>
        <p className="text-sm text-white/50 mb-5">Deep dive into scripture with AI-powered analysis</p>

        {/* Tabs + Cross-ref toggle */}
         <div className="flex gap-2">
           {[
             { id: "analysis", label: "Analysis", icon: "📖" },
             { id: "sidebyside", label: "Side by Side", icon: "⚡" },
             { id: "templates", label: "My Templates", icon: "📝" },
             { id: "memorize", label: "Memorize", icon: "🎯" },
           { id: "flashcards", label: "Flashcards", icon: "🃏" },
           ].map(tab => (
            <motion.button key={tab.id} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-cinzel text-xs font-semibold transition-all"
              style={{
                background: activeTab === tab.id ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.04)",
                color: activeTab === tab.id ? "#00f5ff" : "rgba(255,255,255,0.4)",
                border: activeTab === tab.id ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.07)",
                }}>
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
                ))}
                <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => setShowCrossRef(!showCrossRef)}
                className="px-3 py-3 rounded-xl font-cinzel text-xs font-semibold transition-all"
                style={{
                background: showCrossRef ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.04)",
                color: showCrossRef ? "#7c3aed" : "rgba(255,255,255,0.4)",
                border: showCrossRef ? "1px solid rgba(124,58,237,0.25)" : "1px solid rgba(255,255,255,0.07)",
                }} title="Related Verses Panel">
                <Lightbulb className="w-4 h-4" />
                </motion.button>
                </div>
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

            {/* Depth selector */}
            <div className="flex gap-2">
              {depths.map(d => (
                <motion.button
                  key={d.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDepth(d.id)}
                  className="flex-1 py-4 rounded-xl text-sm font-cinzel transition-all font-semibold"
                  style={{
                    background: depth === d.id ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)",
                    color: depth === d.id ? "#00f5ff" : "rgba(255,255,255,0.4)",
                    border: depth === d.id ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent"
                  }}
                >
                  {d.icon} {d.label}
                </motion.button>
              ))}
            </div>

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

            {/* ── EXPLAIN THIS ── */}
            <div className="rounded-2xl p-4" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4" style={{ color: "#fbbf24" }} />
                <p className="font-cinzel text-sm font-semibold text-white">Explain This</p>
                <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>AI theological summary</p>
              </div>
              <div className="flex gap-2">
                <input
                  value={explainVerse}
                  onChange={e => setExplainVerse(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && explainPassage()}
                  placeholder={`e.g. John 3:16, ${selectedBook} ${selectedChapter}:1-5`}
                  className="flex-1 rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                  style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(251,191,36,0.2)", color: "rgba(255,255,255,0.85)" }}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={explainPassage}
                  disabled={!explainVerse.trim() || explainLoading}
                  className="px-4 py-2.5 rounded-xl font-cinzel text-sm font-semibold transition-all"
                  style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", opacity: !explainVerse.trim() ? 0.5 : 1 }}
                >
                  {explainLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Explain"}
                </motion.button>
              </div>
              <AnimatePresence>
                {explainResult && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>{explainResult}</p>
                      <button onClick={() => setExplainResult(null)} className="flex-shrink-0"><X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} /></button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── VOICE NOTES ── */}
            {audioNotes.length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.12)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Mic className="w-4 h-4" style={{ color: "#00f5ff" }} />
                  <p className="font-cinzel text-sm font-semibold text-white">Voice Notes</p>
                  <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>{audioNotes.length} recordings</p>
                </div>
                <div className="space-y-2">
                  {audioNotes.slice(0, 5).map(note => (
                    <div key={note.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <button
                        onClick={() => {
                          if (playingAudioUrl === note.audio_url) {
                            audioElRef.current?.pause();
                            setPlayingAudioUrl(null);
                          } else {
                            if (audioElRef.current) {
                              audioElRef.current.src = note.audio_url;
                              audioElRef.current.play();
                            }
                            setPlayingAudioUrl(note.audio_url);
                          }
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff" }}
                      >
                        {playingAudioUrl === note.audio_url ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-cinzel text-xs text-white truncate">{note.verse_ref}</p>
                        <p className="text-[10px] font-inter capitalize" style={{ color: "rgba(255,255,255,0.35)" }}>{note.mood} · {new Date(note.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <audio ref={audioElRef} onEnded={() => setPlayingAudioUrl(null)} className="hidden" />
              </div>
            )}

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