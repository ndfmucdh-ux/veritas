import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, StickyNote, BookOpen, Mic } from "lucide-react";
import { setNote, getNote } from "@/lib/dataAccess";
import { listReflectionsForVerse } from "@/lib/services/audioReflectionService";
import AudioReflectionRecorder from "./AudioReflectionRecorder";
import AudioReflectionPlayback from "./AudioReflectionPlayback";

export default function VerseSidePanel({ verse, book, chapter, translation, onClose, onNoteSaved }) {
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [audioReflections, setAudioReflections] = useState([]);
  const textareaRef = useRef(null);

  const verseRef = `${book} ${chapter}:${verse?.verse} ${translation}`;

  useEffect(() => {
    if (!verse) return;
    setNoteText("");
    setSaved(false);
    setShowAudioRecorder(false);
    setAudioReflections([]);

    // Load note (consolidated-first) and audio reflections in parallel
    const ref = `${book} ${chapter}:${verse.verse} ${translation}`;
    Promise.all([
      getNote({ book, chapter, verse: verse.verse, translation }),
      listReflectionsForVerse(ref),
    ]).then(([noteTextValue, reflections]) => {
      if (noteTextValue) setNoteText(noteTextValue);
      setAudioReflections(reflections || []);
    }).catch(() => {});

    // Focus textarea after animation
    setTimeout(() => textareaRef.current?.focus(), 350);
  }, [verse?.verse, book, chapter, translation]);

  const handleSave = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await setNote({ translation, book, chapter, verse: verse.verse, verse_ref: verseRef }, noteText);
      setSaved(true);
      onNoteSaved?.(verse.verse, noteText);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {verse && (
        <>
          {/* Backdrop - very subtle, doesn't obscure text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.25)" }}
          />

          {/* Side panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
            style={{
              width: "min(340px, 88vw)",
              background: "var(--panel-surface)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderLeft: "1px solid rgb(var(--ink) / 0.08)",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b flex-shrink-0"
              style={{ borderColor: "rgb(var(--ink) / 0.07)" }}>
              <StickyNote className="w-4 h-4" style={{ color: "#a78bfa" }} />
              <div className="flex-1 min-w-0">
                <p className="font-cinzel text-xs font-semibold" style={{ color: "#a78bfa" }}>
                  {book} {chapter}:{verse.verse}
                </p>
                <p className="text-[10px] font-inter" style={{ color: "rgb(var(--ink) / 0.3)" }}>{translation}</p>
              </div>
              <motion.button aria-label="Close" whileTap={{ scale: 0.88 }} onClick={onClose}
                className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "var(--fill-3)" }}>
                <X className="w-3.5 h-3.5" style={{ color: "rgb(var(--ink) / 0.45)" }} />
              </motion.button>
            </div>

            {/* Verse preview */}
            <div className="px-4 py-3 border-b flex-shrink-0"
              style={{ borderColor: "rgb(var(--ink) / 0.05)", background: "rgba(167,139,250,0.04)" }}>
              <p className="font-playfair italic text-sm leading-relaxed"
                style={{ color: verse.red_letter ? "#f87171" : "rgb(var(--ink) / 0.78)", fontSize: "13px" }}>
                "{verse.text}"
              </p>
            </div>

            {/* Note input */}
            <div className="flex-1 flex flex-col px-4 pt-4 pb-4 min-h-0">
              <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2"
                style={{ color: "rgb(var(--ink) / 0.25)" }}>Your Reflection</p>
              <textarea
                ref={textareaRef}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Write your thoughts, prayers, questions…"
                className="flex-1 w-full rounded-xl p-3 text-sm font-inter resize-none focus:outline-none"
                style={{
                  background: "var(--fill-2)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  color: "rgb(var(--ink) / 0.82)",
                  minHeight: "140px",
                  lineHeight: "1.65",
                }}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave(); }}
              />
              <p className="text-[10px] font-inter mt-1.5" style={{ color: "rgb(var(--ink) / 0.2)" }}>
                ⌘+Enter to save
              </p>

              <div className="flex gap-2 mt-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={saving || !noteText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-cinzel text-sm transition-all"
                  style={{
                    background: saved ? "rgba(52,211,153,0.15)" : "rgba(167,139,250,0.12)",
                    color: saved ? "#34d399" : "#a78bfa",
                    border: saved ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(167,139,250,0.2)",
                    opacity: !noteText.trim() ? 0.45 : 1,
                  }}
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : saved ? (
                    <><Check className="w-4 h-4" /> Saved</>
                  ) : (
                    <><StickyNote className="w-4 h-4" /> Save Note</>
                  )}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAudioRecorder(!showAudioRecorder)}
                  className="px-3 py-2.5 rounded-xl font-cinzel text-sm transition-all"
                  style={{
                    background: "rgba(0,229,255,0.12)",
                    color: "#00f5ff",
                    border: "1px solid rgba(0,229,255,0.2)",
                  }}
                >
                  <Mic className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Audio recorder */}
              <AnimatePresence>
                {showAudioRecorder && (
                  <AudioReflectionRecorder
                    verseRef={verseRef}
                    book={book}
                    chapter={chapter}
                    verse={verse.verse}
                    translation={translation}
                    onSaved={() => {
                      setShowAudioRecorder(false);
                      listReflectionsForVerse(verseRef)
                        .then(reflections => setAudioReflections(reflections || []))
                        .catch(() => {});
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Playback */}
              <AudioReflectionPlayback
                reflections={audioReflections}
                onDeleted={(id) => setAudioReflections(r => r.filter(ref => ref.id !== id))}
              />
            </div>

            {/* Read full chapter link */}
            <div className="px-4 pb-5 flex-shrink-0">
              <a href={`/read?book=${encodeURIComponent(book)}&chapter=${chapter}`}
                className="flex items-center gap-2 text-xs font-cinzel py-2 justify-center"
                style={{ color: "rgb(var(--ink) / 0.25)" }}>
                <BookOpen className="w-3.5 h-3.5" />
                Read full chapter
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}