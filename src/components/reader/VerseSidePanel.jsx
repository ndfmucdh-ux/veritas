import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, StickyNote, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function VerseSidePanel({ verse, book, chapter, translation, onClose, onNoteSaved }) {
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef(null);

  const verseRef = `${book} ${chapter}:${verse?.verse} ${translation}`;

  useEffect(() => {
    if (verse) {
      setNoteText("");
      setSaved(false);
      // Load existing note
      base44.entities.UserNote.filter({ verse_ref: verseRef })
        .then(notes => { if (notes?.[0]) setNoteText(notes[0].note_text); })
        .catch(() => {});
      // Focus textarea after animation
      setTimeout(() => textareaRef.current?.focus(), 350);
    }
  }, [verse?.verse]);

  const handleSave = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      const existing = await base44.entities.UserNote.filter({ verse_ref: verseRef });
      if (existing?.[0]) {
        await base44.entities.UserNote.update(existing[0].id, { note_text: noteText });
      } else {
        await base44.entities.UserNote.create({
          verse_ref: verseRef, book, chapter, verse: verse.verse, translation, note_text: noteText
        });
        base44.functions.invoke("updateXP", { action: "ADD_NOTE", xp_amount: 15 }).catch(() => {});
      }
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
              background: "rgba(8,13,26,0.97)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b flex-shrink-0"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <StickyNote className="w-4 h-4" style={{ color: "#a78bfa" }} />
              <div className="flex-1 min-w-0">
                <p className="font-cinzel text-xs font-semibold" style={{ color: "#a78bfa" }}>
                  {book} {chapter}:{verse.verse}
                </p>
                <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>{translation}</p>
              </div>
              <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
                className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.45)" }} />
              </motion.button>
            </div>

            {/* Verse preview */}
            <div className="px-4 py-3 border-b flex-shrink-0"
              style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(167,139,250,0.04)" }}>
              <p className="font-playfair italic text-sm leading-relaxed"
                style={{ color: verse.red_letter ? "#f87171" : "rgba(255,255,255,0.78)", fontSize: "13px" }}>
                "{verse.text}"
              </p>
            </div>

            {/* Note input */}
            <div className="flex-1 flex flex-col px-4 pt-4 pb-4 min-h-0">
              <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2"
                style={{ color: "rgba(255,255,255,0.25)" }}>Your Reflection</p>
              <textarea
                ref={textareaRef}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Write your thoughts, prayers, questions…"
                className="flex-1 w-full rounded-xl p-3 text-sm font-inter resize-none focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  color: "rgba(255,255,255,0.82)",
                  minHeight: "140px",
                  lineHeight: "1.65",
                }}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave(); }}
              />
              <p className="text-[10px] font-inter mt-1.5" style={{ color: "rgba(255,255,255,0.2)" }}>
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
              </div>
            </div>

            {/* Read full chapter link */}
            <div className="px-4 pb-5 flex-shrink-0">
              <a href={`/read?book=${encodeURIComponent(book)}&chapter=${chapter}`}
                className="flex items-center gap-2 text-xs font-cinzel py-2 justify-center"
                style={{ color: "rgba(255,255,255,0.25)" }}>
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