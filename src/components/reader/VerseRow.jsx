import { useState, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Highlighter, StickyNote, X, Check, Share2, FolderPlus, CheckSquare, Square, Mic, Loader2, Sparkles, Copy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { setBookmark, setHighlight, setNote } from "@/lib/dataAccess";
import { createReflection } from "@/lib/services/audioReflectionService";
import FolderSaveModal from "@/components/reader/FolderSaveModal";
import useSmoothNavigate from "@/hooks/useSmoothNavigate";

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

function VerseRow({
  verseNum, text, redLetter, book, chapter, translation,
  highlight, isBookmarked, note, showNumbers, fontSize, onUpdate, onOpenNote,
  isSelected, onToggleSelect, selectionMode, isJumped
}) {
  const navigate = useSmoothNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [noteMode, setNoteMode] = useState(false);
  const [noteText, setNoteText] = useState(note || "");
  const [showFolderModal, setShowFolderModal] = useState(false);
  // Inline quick-record
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recSaved, setRecSaved] = useState(false);
  const [reflecting, setReflecting] = useState(false);
  const [reflection, setReflection] = useState(null);
  const [copiedLongPress, setCopiedLongPress] = useState(false);
  const mediaRecRef = useRef(null);
  const chunksRef = useRef([]);
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);

  const hlStyle = highlight ? {
    background: COLOR_STYLES[highlight.color]?.bg,
    borderLeft: `3px solid ${COLOR_STYLES[highlight.color]?.border}`,
    paddingLeft: "10px",
  } : {};

  // verseRef must be computed before it's used — moved above these handlers
  const verseRef = `${book} ${chapter}:${verseNum} ${translation}`;

  const descriptor = { translation, book, chapter, verse: verseNum, verse_ref: verseRef };

  const applyHighlight = async (color) => {
    // Optimistic UI update immediately, then consolidated upsert
    if (highlight?.color === color) {
      onUpdate({ type: "highlight", verseNum, data: null });
      await setHighlight(descriptor, "none");
    } else {
      onUpdate({ type: "highlight", verseNum, data: { color } });
      await setHighlight(descriptor, color);
    }
    setMenuOpen(false);
  };

  const toggleBookmark = async () => {
    // Optimistic UI update
    onUpdate({ type: "bookmark", verseNum, data: !isBookmarked });
    setMenuOpen(false);
    await setBookmark(descriptor, !isBookmarked);
  };

  const saveNote = async () => {
    if (!noteText.trim()) return;
    // Optimistic UI update
    onUpdate({ type: "note", verseNum, data: noteText });
    setNoteMode(false);
    setMenuOpen(false);
    await setNote(descriptor, noteText);
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
          await createReflection({
            verseRef, book, chapter, verse: verseNum, translation,
            audioUrl: file_url, mood: "grateful",
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

  const fetchReflection = async () => {
    setReflecting(true);
    setReflection(null);
    try {
      const res = await base44.functions.invoke("getVerseReflection", {
        verseRef: `${book} ${chapter}:${verseNum} ${translation}`,
        verseText: text,
      });
      setReflection(res.data);
    } catch {}
    setReflecting(false);
  };

  const copyLongPressVerse = async () => {
    const now = new Date();
    const date = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const reference = `${book} ${chapter}:${verseNum} · ${translation}`;
    const plainText = `${reference}\n${date} at ${time}\n\n“${text}”`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #ffffff; background: #000000; line-height: 1.55;">
        <p style="margin: 0 0 10px; color: #ffffff; font-size: 18px; font-weight: 700; text-decoration: none;">${reference}</p>
        <p style="margin: 0 0 18px; color: #d1d5db; font-size: 13px; text-decoration: none;">${date} · ${time}</p>
        <p style="margin: 0; color: #ffffff; font-size: 20px; text-decoration: none;">“${text}”</p>
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
    setCopiedLongPress(true);
    setTimeout(() => setCopiedLongPress(false), 1800);
  };

  const startLongPressCopy = () => {
    longPressTriggeredRef.current = false;
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      copyLongPressVerse();
    }, 500);
  };

  const cancelLongPressCopy = () => clearTimeout(longPressTimerRef.current);

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
        className="rounded-lg px-2 py-3 cursor-pointer transition-all flex items-start gap-2"
        animate={isJumped ? { boxShadow: ["0 0 0px rgba(0,245,255,0)", "0 0 18px rgba(0,245,255,0.45)", "0 0 0px rgba(0,245,255,0)"] } : {}}
        transition={{ duration: 1.8, ease: "easeInOut" }}
        style={{ ...hlStyle, background: isJumped ? "rgba(0,245,255,0.1)" : isSelected ? "rgba(0,245,255,0.08)" : hlStyle.background, outline: isSelected ? "1px solid rgba(0,245,255,0.3)" : isJumped ? "1px solid rgba(0,245,255,0.4)" : "none" }}
        onPointerDown={startLongPressCopy}
        onPointerUp={cancelLongPressCopy}
        onPointerCancel={cancelLongPressCopy}
        onPointerLeave={cancelLongPressCopy}
        onTouchStart={startLongPressCopy}
        onTouchEnd={cancelLongPressCopy}
        onMouseDown={startLongPressCopy}
        onMouseUp={cancelLongPressCopy}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          if (longPressTriggeredRef.current) { longPressTriggeredRef.current = false; return; }
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
            <span className="font-cinzel font-bold select-none mr-2.5 inline-block"
              style={{ color: "rgba(0,245,255,0.6)", fontSize: "clamp(13px, 3vw, 16px)", verticalAlign: "top", lineHeight: "1.4", minWidth: "1.8em", display: "inline-block" }}>
              {verseNum}
            </span>
          )}
          {text}
          {isBookmarked && <span className="ml-1.5 text-xs" style={{ color: "#fbbf24" }}>🔖</span>}
          {note && <span className="ml-1 text-xs" style={{ color: "#a78bfa" }}>✍</span>}
          {recSaved && <span className="ml-1 text-xs" style={{ color: "#00f5ff" }}>🎙</span>}
          {copiedLongPress && <span className="ml-2 inline-flex items-center gap-1 text-xs" style={{ color: "#34d399" }}><Copy className="w-3 h-3" /> Copied</span>}
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
            style={{ background: "var(--popover-surface)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
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
                  copyLongPressVerse();
                }}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-inter transition-colors min-h-[36px]"
                style={{ background: "rgba(52,211,153,0.1)", color: "#34d399" }}>
                <Copy className="w-3.5 h-3.5" />
                Copy
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
                  navigate(`/verse-art?ref=${ref}&text=${txt}`);
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
              <button
                onClick={() => { fetchReflection(); }}
                disabled={reflecting}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-inter transition-colors min-h-[36px]"
                style={{ background: "rgba(167,139,250,0.12)", color: "#c084fc", border: "1px solid rgba(167,139,250,0.2)" }}>
                {reflecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Reflect
              </button>
              <button onClick={() => setMenuOpen(false)}
                className="ml-auto flex items-center justify-center w-9 h-9 rounded-xl"
                style={{ background: "var(--fill-2)", color: "rgba(255,255,255,0.3)" }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* AI Reflection result */}
            <AnimatePresence>
              {reflection && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(167,139,250,0.15)" }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3 h-3" style={{ color: "#c084fc" }} />
                      <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "#c084fc" }}>
                        {reflection.type === "prayer" ? "A Prayer for You" : "For Reflection"}
                      </p>
                    </div>
                    <p className="text-sm font-inter leading-relaxed italic" style={{ color: "rgba(255,255,255,0.75)" }}>
                      {reflection.reflection}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                      style={{ fontSize: "16px", background: "var(--fill-2)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
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

// Memoized: a chapter renders 30–150 VerseRows. Without this, any parent state
// change (highlight/bookmark/note edit, scroll-driven isJumped, selection) would
// re-render every verse. We compare only the props that affect this row's output;
// callback props from Read are intentionally ignored (their identity changes each
// render but their behavior is stable).
function areEqual(prev, next) {
  return (
    prev.text === next.text &&
    prev.redLetter === next.redLetter &&
    prev.showNumbers === next.showNumbers &&
    prev.fontSize === next.fontSize &&
    prev.isBookmarked === next.isBookmarked &&
    prev.note === next.note &&
    prev.isSelected === next.isSelected &&
    prev.selectionMode === next.selectionMode &&
    prev.isJumped === next.isJumped &&
    prev.highlight?.color === next.highlight?.color &&
    prev.book === next.book &&
    prev.chapter === next.chapter &&
    prev.translation === next.translation &&
    prev.verseNum === next.verseNum
  );
}

export default memo(VerseRow, areEqual);