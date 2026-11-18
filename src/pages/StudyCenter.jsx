import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LoadingState, ErrorState } from "@/components/ui/states";
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
import { listRecentReflections } from "@/lib/services/audioReflectionService";
import NotesArchive from "@/components/study/NotesArchive";
import StudyProgressMap from "@/components/study/StudyProgressMap";
import StudyCenterTabs from "@/components/study/StudyCenterTabs.jsx";
import StudyDepthSelector from "@/components/study/StudyDepthSelector.jsx";
import ExplainThisPanel from "@/components/study/ExplainThisPanel.jsx";
import VoiceNotesPanel from "@/components/study/VoiceNotesPanel.jsx";

export default function StudyCenter() {
  const { lang, t } = useLang();
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
      const notes = await listRecentReflections(20);
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
    { id: "Pentateuch", name: t.grpLaw, books: BIBLE_BOOKS.filter(b => [1,2,3,4,5].includes(b.num)) },
    { id: "Historical", name: t.grpHistory, books: BIBLE_BOOKS.filter(b => [6,7,8,9,10,11,12,13,14,15,16,17].includes(b.num)) },
    { id: "Wisdom", name: t.grpWisdom, books: BIBLE_BOOKS.filter(b => [18,19,20,21,22].includes(b.num)) },
    { id: "Prophetic", name: t.grpMajor, books: BIBLE_BOOKS.filter(b => [23,24,25,26,27].includes(b.num)) },
    { id: "MinorProphets", name: t.grpMinor, books: BIBLE_BOOKS.filter(b => [28,29,30,31,32,33,34,35,36,37,38,39].includes(b.num)) },
    { id: "Gospels", name: t.grpGospels, books: BIBLE_BOOKS.filter(b => [40,41,42,43].includes(b.num)) },
    { id: "Acts", name: t.grpActs, books: BIBLE_BOOKS.filter(b => [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65].includes(b.num)) },
    { id: "Revelation", name: t.grpRevelation, books: BIBLE_BOOKS.filter(b => b.num === 66) }
  ];


  return (
    <div className="md:ml-16 min-h-screen pb-28 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto pt-6 mb-6">
        <h1 className="font-cinzel text-3xl font-semibold text-foreground mb-1">{t.studyCenter}</h1>
        <p className="text-sm text-muted-foreground">{t.studySub}</p>
        <div className="mt-3 mb-5 h-px w-16" style={{ background: "var(--t-gold)", opacity: 0.6 }} />

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
            <div className="rounded-2xl p-4 md:p-6 bg-card border border-border">
              <p className="text-xs font-inter uppercase tracking-widest mb-4 text-muted-foreground">{t.booksOfBible}</p>
              <div className="space-y-2">
                {theologicalGroups.map(group => (
                  <div key={group.id}>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setExpandedCategory(expandedCategory === group.id ? null : group.id)}
                      className={`w-full flex items-center gap-2 px-4 py-3.5 rounded-xl transition-all text-left border ${expandedCategory === group.id ? "bg-primary/10 border-primary/40" : "bg-secondary border-transparent"}`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 flex-shrink-0 ${expandedCategory === group.id ? "text-primary" : "text-muted-foreground"}`}
                        style={{
                          transform: expandedCategory === group.id ? "rotate(0deg)" : "rotate(-90deg)",
                          transition: "transform 0.2s"
                        }}
                      />
                      <span className="text-base font-cinzel font-semibold text-foreground flex-1">{group.name}</span>
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
                                className={`py-3.5 px-1 rounded-xl text-xs font-cinzel transition-all text-center font-bold border ${selectedBook === b.name ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground/80 border-border"}`}
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
                onChange={setSelectedChapter}
                items={Array.from({ length: BIBLE_BOOKS.find(b => b.name === selectedBook)?.chapters || 1 }, (_, i) => ({
                  value: i + 1,
                  label: `${t.chapterLabel} ${i + 1}`
                }))}
              />
            )}

            <StudyDepthSelector depth={depth} onChange={setDepth} />

            {/* Verse dropdown */}
            {selectedChapter && !loading && (
              <StudyDropdown
                label={t.exploreVerses}
                value={expandedVerses.size > 0 ? Array.from(expandedVerses)[0] : null}
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
              <LoadingState
                label={`${t.analyzing} ${getTranslatedBookName(selectedBook, lang)}…`}
                size="xl"
                minHeight={240}
              />
            ) : error ? (
              <ErrorState
                title={t.analysisFailed}
                description={error}
                onRetry={() => loadOutline(selectedBook)}
              />
            ) : outline && typeof outline === "object" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="rounded-2xl p-4 md:p-6 bg-card border border-border">
                  <h2 className="font-cinzel text-2xl font-semibold text-foreground mb-4">{outline.book || getTranslatedBookName(selectedBook, lang)}</h2>
                  {outline.themes?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-inter uppercase tracking-widest text-muted-foreground mb-2">{t.themesLabel}</p>
                      <div className="flex flex-wrap gap-2">
                        {outline.themes.map((theme, idx) => (
                          <span key={idx} className="text-xs px-3 py-1.5 rounded-full bg-primary/12 text-primary border border-primary/25">{theme}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {outline.sections?.length > 0 && (
                    <div className="space-y-4">
                      {outline.sections.map((section, idx) => (
                        <div key={idx} className="pb-4 border-b" style={{ borderColor: "rgb(var(--ink) / 0.07)" }}>
                          <p className="font-cinzel text-lg font-semibold text-foreground mb-2">{section.title || `${idx + 1}`}</p>
                          <p className="text-sm text-foreground/75 leading-relaxed mb-2">{section.summary || ""}</p>
                          {section.key_verses?.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <p className="font-inter font-semibold mb-1">{t.keyVersesLabel}:</p>
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
                      <p className="text-xs font-inter uppercase tracking-widest text-muted-foreground mb-2">{t.theologyLabel}</p>
                      <p className="text-sm leading-relaxed text-foreground/75">{outline.theology}</p>
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