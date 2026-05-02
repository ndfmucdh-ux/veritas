import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Highlighter, Bookmark, StickyNote, Share2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const HIGHLIGHT_COLORS = [
  { id: "yellow", class: "verse-highlight-yellow", dot: "bg-yellow-400" },
  { id: "cyan", class: "verse-highlight-cyan", dot: "bg-cyan" },
  { id: "purple", class: "verse-highlight-purple", dot: "bg-purple-400" },
  { id: "green", class: "verse-highlight-green", dot: "bg-green-400" },
  { id: "red", class: "verse-highlight-red", dot: "bg-red-400" },
];

export default function VerseItem({ 
  verseNum, text, redLetter, book, chapter, translation,
  highlight, isBookmarked, note, showNumbers, onUpdate
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [noteText, setNoteText] = useState(note || "");
  const [showNoteInput, setShowNoteInput] = useState(false);

  const verseRef = `${book} ${chapter}:${verseNum} ${translation}`;

  const handleHighlight = async (color) => {
    try {
      if (highlight?.color === color) {
        // Remove highlight
        const existing = await base44.entities.UserHighlight.filter({ verse_ref: verseRef });
        if (existing[0]) await base44.entities.UserHighlight.delete(existing[0].id);
        onUpdate?.({ type: "highlight", verseNum, data: null });
      } else {
        const existing = await base44.entities.UserHighlight.filter({ verse_ref: verseRef });
        if (existing[0]) {
          await base44.entities.UserHighlight.update(existing[0].id, { color });
        } else {
          await base44.entities.UserHighlight.create({
            verse_ref: verseRef, book, chapter, verse: verseNum, translation, color
          });
          base44.functions.invoke("updateXP", { action: "ADD_HIGHLIGHT", xp_amount: 5 });
        }
        onUpdate?.({ type: "highlight", verseNum, data: { color } });
      }
      setShowMenu(false);
    } catch (e) { console.error(e); }
  };

  const handleBookmark = async () => {
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
      setShowMenu(false);
    } catch (e) { console.error(e); }
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    try {
      const existing = await base44.entities.UserNote.filter({ verse_ref: verseRef });
      if (existing[0]) {
        await base44.entities.UserNote.update(existing[0].id, { note_text: noteText });
      } else {
        await base44.entities.UserNote.create({
          verse_ref: verseRef, book, chapter, verse: verseNum, translation,
          note_text: noteText, is_private: true
        });
        base44.functions.invoke("updateXP", { action: "ADD_NOTE", xp_amount: 15 });
      }
      onUpdate?.({ type: "note", verseNum, data: noteText });
      setShowNoteInput(false);
      setShowMenu(false);
    } catch (e) { console.error(e); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${book} ${chapter}:${verseNum}`,
        text: `"${text}" — ${book} ${chapter}:${verseNum} (${translation})`,
      });
    }
    setShowMenu(false);
  };

  const highlightClass = highlight ? HIGHLIGHT_COLORS.find(h => h.id === highlight.color)?.class : "";

  return (
    <div className="relative group">
      <div
        className={`px-2 py-1.5 rounded-lg cursor-pointer transition-all hover:bg-white/5 ${highlightClass}`}
        onClick={() => setShowMenu(!showMenu)}
      >
        {showNumbers && (
          <sup className="text-[10px] text-muted-foreground mr-1.5 font-inter select-none">
            {verseNum}
          </sup>
        )}
        <span className={`reading-text font-playfair ${redLetter ? "red-letter" : "text-foreground"}`}>
          {text}
        </span>
        {isBookmarked && <span className="ml-1 text-gold text-sm">✦</span>}
        {note && <span className="ml-1 text-cyan text-sm">✎</span>}
      </div>

      {/* Verse Action Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute left-0 top-full z-50 mt-1 glass-strong rounded-xl p-3 shadow-2xl min-w-[220px]"
            onClick={e => e.stopPropagation()}
          >
            {/* Reference */}
            <p className="text-xs font-cinzel text-muted-foreground mb-3 border-b border-border pb-2">
              {book} {chapter}:{verseNum}
            </p>

            {/* Highlight Colors */}
            <div className="flex items-center gap-2 mb-3">
              <Highlighter className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="flex gap-1.5">
                {HIGHLIGHT_COLORS.map(({ id, dot }) => (
                  <button
                    key={id}
                    onClick={() => handleHighlight(id)}
                    className={`w-5 h-5 rounded-full ${dot} border-2 transition-all ${
                      highlight?.color === id ? "border-foreground scale-110" : "border-transparent hover:scale-110"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1">
              <button
                onClick={handleBookmark}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5 text-left"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-gold text-gold" : ""}`} />
                {isBookmarked ? "Remove bookmark" : "Add bookmark"}
              </button>
              <button
                onClick={() => { setShowNoteInput(!showNoteInput); }}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-cyan transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5 text-left"
              >
                <StickyNote className="w-3.5 h-3.5" />
                {note ? "Edit note" : "Add note"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-purple transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5 text-left"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share verse
              </button>
            </div>

            {/* Note Input */}
            <AnimatePresence>
              {showNoteInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-border"
                >
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Write your note..."
                    className="w-full text-xs bg-muted rounded-lg p-2 text-foreground placeholder-muted-foreground resize-none h-20 focus:outline-none focus:ring-1 focus:ring-cyan"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveNote}
                      className="flex-1 text-xs bg-cyan text-background py-1.5 rounded-lg font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowNoteInput(false)}
                      className="text-xs text-muted-foreground px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Close */}
            <button
              onClick={() => setShowMenu(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}