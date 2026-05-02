import { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Highlighter, Bookmark, StickyNote, Share2, X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const COLORS = [
  { id: "yellow", hex: "#fbbf24", bg: "rgba(251,191,36,0.18)",  border: "rgba(251,191,36,0.4)" },
  { id: "cyan",   hex: "#00f5ff", bg: "rgba(0,245,255,0.12)",   border: "rgba(0,245,255,0.4)" },
  { id: "purple", hex: "#a78bfa", bg: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.4)" },
  { id: "green",  hex: "#34d399", bg: "rgba(52,211,153,0.15)",  border: "rgba(52,211,153,0.4)" },
  { id: "red",    hex: "#f87171", bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.4)" },
];

export default function VerseRow({
  verseNum, text, redLetter,
  book, chapter, translation,
  highlight, isBookmarked, note,
  showNumbers = true, fontSize = 18,
  onUpdate,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [noteMode, setNoteMode] = useState(false);
  const [noteText, setNoteText] = useState(note || "");
  const [justSaved, setJustSaved] = useState(false);
  const [highlightFlash, setHighlightFlash] = useState(false);
  const shouldReduce = useReducedMotion();
  const longPressTimer = useRef(null);

  const verseRef = `${book} ${chapter}:${verseNum} ${translation}`;
  const activeColor = highlight ? COLORS.find(c => c.id === highlight.color) : null;

  // Long press / click to open menu
  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => setMenuOpen(true), 420);
  };
  const handlePointerUp = () => clearTimeout(longPressTimer.current);
  const handleClick = () => {
    clearTimeout(longPressTimer.current);
    setMenuOpen(v => !v);
  };

  const applyHighlight = async (colorId) => {
    const isRemoving = highlight?.color === colorId;
    try {
      const existing = await base44.entities.UserHighlight.filter({ verse_ref: verseRef });
      if (isRemoving) {
        if (existing[0]) await base44.entities.UserHighlight.delete(existing[0].id);
        onUpdate?.({ type: "highlight", verseNum, data: null });
      } else {
        setHighlightFlash(true);
        setTimeout(() => setHighlightFlash(false), 600);
        if (existing[0]) {
          await base44.entities.UserHighlight.update(existing[0].id, { color: colorId });
        } else {
          await base44.entities.UserHighlight.create({
            verse_ref: verseRef, book, chapter, verse: verseNum, translation, color: colorId
          });
          base44.functions.invoke("updateXP", { action: "ADD_HIGHLIGHT", xp_amount: 5 }).catch(() => {});
        }
        onUpdate?.({ type: "highlight", verseNum, data: { color: colorId } });
      }
    } catch (e) {}
    setMenuOpen(false);
  };

  const toggleBookmark = async () => {
    try {
      if (isBookmarked) {
        const existing = await base44.entities.Bookmark.filter({ verse_ref: verseRef });
        if (existing[0]) await base44.entities.Bookmark.delete(existing[0].id);
        onUpdate?.({ type: "bookmark", verseNum, data: false });
      } else {
        await base44.entities.Bookmark.create({
          verse_ref: verseRef, book, chapter, verse: verseNum, translation
        });
        onUpdate?.({ type: "bookmark", verseNum, data: true });
      }
    } catch (e) {}
    setMenuOpen(false);
  };

  const saveNote = async () => {
    if (!noteText.trim()) return;
    try {
      const existing = await base44.entities.UserNote.filter({ verse_ref: verseRef });
      if (existing[0]) {
        await base44.entities.UserNote.update(existing[0].id, { note_text: noteText });
      } else {
        await base44.entities.UserNote.create({
          verse_ref: verseRef, book, chapter, verse: verseNum, translation, note_text: noteText, is_private: true,
        });
        base44.functions.invoke("updateXP", { action: "ADD_NOTE", xp_amount: 15 }).catch(() => {});
      }
      onUpdate?.({ type: "note", verseNum, data: noteText });
      setJustSaved(true);
      setTimeout(() => { setJustSaved(false); setNoteMode(false); setMenuOpen(false); }, 900);
    } catch (e) {}
  };

  const shareVerse = () => {
    navigator.share?.({ title: `${book} ${chapter}:${verseNum}`, text: `"${text}" — ${book} ${chapter}:${verseNum} (${translation})` });
    setMenuOpen(false);
  };

  return (
    <div className="relative group">
      {/* Verse text */}
      <motion.div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        className="px-3 py-2 rounded-xl cursor-pointer select-none transition-all duration-150"
        animate={highlightFlash && !shouldReduce
          ? { scale: [1, 1.015, 1], transition: { duration: 0.35 } }
          : {}}
        style={activeColor ? {
          background: activeColor.bg,
          borderLeft: `3px solid ${activeColor.hex}`,
          borderRadius: "0 12px 12px 0",
          paddingLeft: "12px",
        } : {}}
        whileTap={shouldReduce ? {} : { backgroundColor: "rgba(255,255,255,0.03)" }}
      >
        {showNumbers && (
          <sup className="text-[10px] text-white/25 mr-1.5 font-inter select-none align-top mt-1 inline-block">
            {verseNum}
          </sup>
        )}
        <span
          className="font-playfair leading-[1.9]"
          style={{
            fontSize,
            color: redLetter ? "#FF3B5C" : "rgba(255,255,255,0.88)",
            textShadow: redLetter ? "0 0 20px rgba(255,59,92,0.35)" : "none",
          }}
        >
          {text}
        </span>
        {/* Inline indicators */}
        {isBookmarked && (
          <span className="ml-1.5 inline-block text-yellow-400 text-sm align-middle">✦</span>
        )}
        {note && (
          <span className="ml-1 inline-block text-[10px] text-cyan/60 align-middle">✎</span>
        )}
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ backdropFilter: "blur(2px)" }}
              onClick={() => { setMenuOpen(false); setNoteMode(false); }}
            />

            {/* Menu */}
            <motion.div
              className="absolute left-0 top-full z-50 mt-2 w-64"
              initial={{ opacity: 0, scale: 0.88, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -4 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(12,18,32,0.92)",
                  backdropFilter: "blur(32px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}>
                {/* Inner shine */}
                <div className="absolute inset-0 pointer-events-none rounded-2xl"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)" }} />

                <div className="relative p-4">
                  {/* Verse ref */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.07]">
                    <p className="text-xs font-cinzel text-white/45">{book} {chapter}:{verseNum}</p>
                    <button onClick={() => setMenuOpen(false)} className="text-white/25 hover:text-white/60 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Highlight colors */}
                  <div className="flex items-center gap-2 mb-4">
                    <Highlighter className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                    <div className="flex items-center gap-2">
                      {COLORS.map(({ id, hex }) => (
                        <motion.button
                          key={id}
                          whileTap={{ scale: 0.85 }}
                          whileHover={{ scale: 1.2 }}
                          onClick={() => applyHighlight(id)}
                          className="w-6 h-6 rounded-full transition-all"
                          style={{
                            background: hex,
                            boxShadow: highlight?.color === id ? `0 0 10px ${hex}` : "none",
                            ring: highlight?.color === id ? `2px solid white` : "none",
                            outline: highlight?.color === id ? `2px solid rgba(255,255,255,0.7)` : "none",
                            outlineOffset: "2px",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {!noteMode ? (
                    <div className="space-y-0.5">
                      {[
                        { icon: Bookmark, label: isBookmarked ? "Remove bookmark" : "Bookmark", action: toggleBookmark, active: isBookmarked, activeColor: "#FFD700" },
                        { icon: StickyNote, label: note ? "Edit note" : "Add note", action: () => setNoteMode(true), active: !!note, activeColor: "#00f5ff" },
                        { icon: Share2, label: "Share verse", action: shareVerse, active: false },
                      ].map(({ icon: Icon, label, action, active, activeColor: ac }) => (
                        <motion.button
                          key={label}
                          whileTap={{ scale: 0.97 }}
                          onClick={action}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-inter text-left transition-colors hover:bg-white/[0.05]"
                          style={{ color: active ? ac : "rgba(255,255,255,0.55)" }}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          {label}
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <textarea
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        placeholder="Write your reflection…"
                        autoFocus
                        className="w-full text-sm font-inter text-white/80 placeholder-white/20 bg-white/[0.05] rounded-xl p-3 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-cyan-400/40 leading-relaxed"
                      />
                      <div className="flex gap-2 mt-2">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={saveNote}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-inter font-medium"
                          style={{ background: "rgba(0,245,255,0.15)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.25)" }}
                        >
                          {justSaved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Note"}
                        </motion.button>
                        <button onClick={() => setNoteMode(false)} className="px-4 text-sm text-white/35 hover:text-white/60">
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}