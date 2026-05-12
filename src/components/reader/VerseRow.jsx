import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Highlighter, StickyNote, X, Check, Share2, FolderPlus, CheckSquare, Square, Mic, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import FolderSaveModal from "@/components/reader/FolderSaveModal";

const COLORS = ["yellow", "cyan", "purple", "green", "red", "orange", "pink"];
const COLOR_STYLES = {
  yellow: { bg: "rgba(251,191,36,0.2)",  border: "#fbbf24" },
  cyan:   { bg: "rgba(0,229,255,0.15)",  border: "#00e5ff" },
  purple: { bg: "rgba(167,139,250,0.2)", border: "#a78bfa" },
  green:  { bg: "rgba(52,211,153,0.2)",  border: "#34d399" },
  red:    { bg: "rgba(248,113,113,0.2)", border: "#f87171" },
  orange: { bg: "rgba(251,146,60,0.2)",  border: "#fb923c" },
  pink:   { bg: "rgba(244,114,182,0.2)", border: "#f472b6" },
};
const COLOR_HEX = { yellow: "#fbbf24", cyan: "#00e5ff", purple: "#a78bfa", green: "#34d399", red: "#f87171", orange: "#fb923c", pink: "#f472b6" };

export default function VerseRow({
  verseNum, text, redLetter, book, chapter, translation,
  highlight, isBookmarked, note, showNumbers, fontSize, onUpdate, onOpenNote,
  isSelected, onToggleSelect, selectionMode, isJumped
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [noteMode, setNoteMode] = useState(false);
  const [noteText, setNoteText] = useState(note || "");
  const [showFolderModal, setShowFolderModal] = useState(false);
  // Inline quick-record
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recSaved, setRecSaved] = useState(false);
  const mediaRecRef = useRef(null);
  const chunksRef = useRef([]);

  const hlStyle = highlight ? {
    background: COLOR_STYLES[highlight.color]?.bg,
    borderLeft: `3px solid ${COLOR_STYLES[highlight.color]?.border}`,
    paddingLeft: "10px",
  } : {};

  const applyHighlight = async (color) => {
    if (highlight?.color === color) {
      const existing = await base44.entities.UserHighlight.filter({ verse_ref: verseRef });
      if (existing?.[0]) await base44.entities.UserHighlight.delete(existing[0].id);
      onUpdate({ type: "highlight", verseNum, data: null });
    } else {
      const existing = await base44.entities.UserHighlight.filter({ verse_ref: verseRef });
      if (existing?.[0]) {
        await base44.entities.UserHighlight.update(existing[0].id, { color });
      } else {
        await base44.entities.UserHighlight.create({ verse_ref: verseRef, book, chapter, verse: verseNum, translation, color });
      }
      onUpdate({ type: "highlight", verseNum, data: { color } });
    }
    setMenuOpen(false);
  };

  const toggleBookmark = async () => {
    if (isBookmarked) {
      const existing = await base44.entities.Bookmark.filter({ verse_ref: verseRef });
      if (existing?.[0]) await base44.entities.Bookmark.delete(existing[0].id);
      onUpdate({ type: "bookmark", verseNum, data: false });
    } else {
      await base44.entities.Bookmark.create({ verse_ref: verseRef, book, chapter, verse: verseNum, translation });
      onUpdate({ type: "bookmark", verseNum, data: true });
      base44.functions.invoke("updateXP", { action: "ADD_BOOKMARK", xp_amount: 5 }).catch(() => {});
    }
    setMenuOpen(false);
  };

  const saveNote = async () => {
    if (!noteText.trim()) return;
    const existing = await base44.entities.UserNote.filter({ verse_ref: verseRef });
    if (existing?.[0]) {
      await base44.entities.UserNote.update(existing[0].id, { note_text: noteText });
    } else {
      await base44.entities.UserNote.create({ verse_ref: verseRef, book, chapter, verse: verseNum, translation, note_text: noteText });
      base44.functions.invoke("updateXP", { action: "ADD_NOTE", xp_amount: 15 }).catch(() => {});
    }
    onUpdate({ type: "note", verseNum, data: noteText });
    setNoteMode(false);
    setMenuOpen(false);
  };

  // Inline quick voice note
  const startRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setUploading(true);
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: blob });
          await base44.entities.VerseAudioReflection.create({
            verse_ref: verseRef, book, chapter, verse: verseNum, translation,
            audio_url: file_url, mood: "grateful", is_private: true,
          });
          setRecSaved(true);
          setTimeout(() => setRecSaved(false), 2500);
        } finally {
          setUploading(false);
        }
      };
      mr.start();
      mediaRecRef.current = mr;
      setRecording(true);
    } catch {}
  };

  const stopRecord = () => {
    if (mediaRecRef.current && recording) {
      mediaRecRef.current.stop();
      setRecording(false);
    }
  };

  const verseRef = `${book} ${chapter}:${verseNum} ${translation}`;

  return (
    <div className="relative">
      {showFolderModal && (
        <FolderSaveModal
          verseRefs={[verseRef]}
          onClose={() => setShowFolderModal(false)}
          onSaved={() => {}}
        />
      )}
      <motion.div
        className="rounded-lg px-2 py-1.5 cursor-pointer transition-all flex items-start gap-2"
        animate={isJumped ? { boxShadow: ["0 0 0px rgba(0,245,255,0)", "0 0 18px rgba(0,245,255,0.45)", "0 0 0px rgba(0,245,255,0)"] } : {}}
        transition={{ duration: 1.8, ease: "easeInOut" }}
        style={{ ...hlStyle, background: isJumped ? "rgba(0,245,255,0.1)" : isSelected ? "rgba(0,245,255,0.08)" : hlStyle.background, outline: isSelected ? "1px solid rgba(0,245,255,0.3)" : isJumped ? "1px solid rgba(0,245,255,0.4)" : "none" }}
        onClick={(e) => {
          e.stopPropagation();
          if (selectionMode) { onToggleSelect?.(verseNum); return; }
          setMenuOpen(v => !v);
        }}
        whileTap={{ scale: 0.995 }}
      >
        {selectionMode && (
          <span className="flex-shrink-0 mt-0.5" style={{ color: isSelected ? "#00f5ff" : "rgba(255,255,255,0.2)" }}>
            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          </span>
        )}
        <span className="font-inter leading-relaxed select-text"
          style={{
            fontSize,
            color: redLetter ? "#f87171" : "rgba(255,255,255,0.88)",
            textShadow: redLetter ? "0 0 18px rgba(248,113,113,0.45), 0 0 8px rgba(248,113,113,0.25)" : "none",
            transition: "text-shadow 0.3s ease",
          }}>
          {showNumbers && (
            <span className="text-xs mr-2 font-cinzel select-none" style={{ color: "rgba(255,255,255,0.25)", verticalAlign: "super", fontSize: "10px" }}>
              {verseNum}
            </span>
          )}
          {text}
          {isBookmarked && <span className="ml-1.5 text-xs" style={{ color: "#fbbf24" }}>🔖</span>}
          {note && <span className="ml-1 text-xs" style={{ color: "#a78bfa" }}>✍</span>}
          {recSaved && <span className="ml-1 text-xs" style={{ color: "#00f5ff" }}>🎙</span>}
        </span>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 right-0 z-20 rounded-2xl p-3 mt-1"
            style={{ background: "rgba(10,15,30,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
          >
            <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              {book} {chapter}:{verseNum}
            </p>

            {/* Highlight colors */}
            <div className="flex items-center gap-2 mb-3">
              <Highlighter className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
              {COLORS.map(c => (
                <button key={c} onClick={() => applyHighlight(c)}
                  className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: COLOR_HEX[c],
                    boxShadow: highlight?.color === c ? `0 0 0 2px white, 0 0 0 4px ${COLOR_HEX[c]}` : "none"
                  }} />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button onClick={toggleBookmark}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-inter transition-colors min-h-[36px]"
                style={{ background: isBookmarked ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.06)", color: isBookmarked ? "#fbbf24" : "rgba(255,255,255,0.5)" }}>
                <Bookmark className="w-3.5 h-3.5" />
                {isBookmarked ? "Saved" : "Bookmark"}
              </button>
              <button onClick={() => {
                  setMenuOpen(false);
                  onOpenNote?.({ verse: verseNum, text, red_letter: redLetter });
                }}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-inter transition-colors min-h-[36px]"
                style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa" }}>
                <StickyNote className="w-3.5 h-3.5" />
                Note
              </button>
              {/* Inline quick mic */}
              <button
                onClick={recording ? stopRecord : startRecord}
                disabled={uploading}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-inter transition-colors min-h-[36px]"
                style={{
                  background: recording ? "rgba(248,113,113,0.15)" : recSaved ? "rgba(52,211,153,0.15)" : "rgba(0,245,255,0.08)",
                  color: recording ? "#f87171" : recSaved ? "#34d399" : "#00f5ff",
                  border: recording ? "1px solid rgba(248,113,113,0.3)" : "1px solid transparent"
                }}>
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mic className="w-3.5 h-3.5" />}
                {uploading ? "Saving…" : recording ? "Stop" : recSaved ? "Saved!" : "Voice"}
              </button>
              <button onClick={() => {
                  setMenuOpen(false);
                  const ref = encodeURIComponent(`${book} ${chapter}:${verseNum}`);
                  const txt = encodeURIComponent(text);
                  window.location.href = `/verse-art?ref=${ref}&text=${txt}`;
                }}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-inter transition-colors min-h-[36px]"
                style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>
                <Share2 className="w-3.5 h-3.5" />
                Art
              </button>
              <button onClick={() => { setMenuOpen(false); setShowFolderModal(true); }}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-inter transition-colors min-h-[36px]"
                style={{ background: "rgba(0,245,255,0.07)", color: "#00f5ff" }}>
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setMenuOpen(false)}
                className="ml-auto flex items-center justify-center w-9 h-9 rounded-xl"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Note input */}
            <AnimatePresence>
              {noteMode && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    <textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Write your reflection..."
                      rows={3}
                      className="w-full rounded-xl p-3 text-sm font-inter resize-none focus:outline-none"
                      style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
                    />
                    <button onClick={saveNote}
                      className="mt-2 flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-cinzel"
                      style={{ background: "rgba(167,139,250,0.2)", color: "#a78bfa" }}>
                      <Check className="w-3.5 h-3.5" /> Save Note
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}