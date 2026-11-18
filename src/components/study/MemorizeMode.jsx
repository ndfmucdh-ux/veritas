import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Check, X, ChevronRight, Loader2, RotateCcw, Trophy, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LoadingState } from "@/components/ui/states";

// Mask every other word or random words based on difficulty
function maskVerse(text, difficulty) {
  const words = text.split(" ");
  if (difficulty === "easy") {
    // Hide every 4th word
    return words.map((w, i) => ({ word: w, hidden: i > 0 && (i + 1) % 4 === 0 }));
  } else if (difficulty === "medium") {
    // Hide every other word
    return words.map((w, i) => ({ word: w, hidden: i > 0 && i % 2 === 1 }));
  } else {
    // Hide all but first and last word
    return words.map((w, i) => ({ word: w, hidden: i > 0 && i < words.length - 1 }));
  }
}

const DIFFICULTIES = [
  { id: "easy", label: "Guided", desc: "Some words hidden" },
  { id: "medium", label: "Recall", desc: "Half words hidden" },
  { id: "hard", label: "Complete", desc: "Full recitation" },
];

export default function MemorizeMode({ book, chapter }) {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [difficulty, setDifficulty] = useState("easy");
  const [revealed, setRevealed] = useState(new Set());
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState(null); // "pass" | "fail" | null
  const [recitations, setRecitations] = useState([]); // persisted progress
  const [showRecite, setShowRecite] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!book || !chapter) return;
    setLoading(true);
    base44.functions.invoke("getChapter", { book, chapter, translation: "KJV" })
      .then(res => setVerses(res.data?.verses || []))
      .catch(() => setVerses([]))
      .finally(() => setLoading(false));
    // Load memorization progress
    base44.entities.UserNote.filter({ book, chapter, note_text: { $regex: "^[MEMORIZE]" } })
      .then(notes => setRecitations(notes || []))
      .catch(() => {});
  }, [book, chapter]);

  const selectVerse = (v) => {
    setSelectedVerse(v);
    setRevealed(new Set());
    setUserInput("");
    setResult(null);
    setShowRecite(false);
  };

  const maskedWords = selectedVerse ? maskVerse(selectedVerse.text, difficulty) : [];

  const toggleReveal = (idx) => {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const revealAll = () => setRevealed(new Set(maskedWords.map((_, i) => i)));
  const hideAll = () => setRevealed(new Set());

  const checkRecitation = async () => {
    if (!userInput.trim() || !selectedVerse) return;
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
    const inputNorm = normalize(userInput);
    const verseNorm = normalize(selectedVerse.text);
    // Calculate similarity
    const inputWords = inputNorm.split(" ");
    const verseWords = verseNorm.split(" ");
    const matches = inputWords.filter(w => verseWords.includes(w)).length;
    const accuracy = Math.round((matches / verseWords.length) * 100);
    const pass = accuracy >= 70;
    setResult(pass ? "pass" : "fail");
    if (pass) {
      const xpAmt = difficulty === "hard" ? 50 : difficulty === "medium" ? 30 : 15;
      base44.functions.invoke("updateXP", { action: "MEMORIZE_VERSE", xp_amount: xpAmt }).catch(() => {});
      // Save progress note
      const verseRef = `${book} ${chapter}:${selectedVerse.verse} KJV`;
      const noteText = `[MEMORIZE] ${difficulty} · ${accuracy}% · ${new Date().toISOString()}`;
      base44.entities.UserNote.create({ verse_ref: verseRef, book, chapter, verse: selectedVerse.verse, translation: "KJV", note_text: noteText }).catch(() => {});
    }
  };

  const alreadyMemorized = (verseNum) => recitations.some(r => r.verse === verseNum);

  if (loading) return <LoadingState label="Loading chapter…" size="lg" />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)" }}>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4" style={{ color: "#a78bfa" }} />
          <p className="font-cinzel text-sm font-semibold text-white">Memorize Mode</p>
        </div>
        <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.45)" }}>
          Select a verse, choose difficulty, and recite it from memory. Earn XP for accurate recitations.
        </p>
      </div>

      {/* Difficulty */}
      <div className="flex gap-2">
        {DIFFICULTIES.map(d => (
          <button key={d.id} onClick={() => setDifficulty(d.id)}
            className="flex-1 py-3 rounded-xl text-center transition-all"
            style={{
              background: difficulty === d.id ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
              border: difficulty === d.id ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.07)",
            }}>
            <p className="font-cinzel text-xs font-semibold" style={{ color: difficulty === d.id ? "#a78bfa" : "rgba(255,255,255,0.55)" }}>{d.label}</p>
            <p className="text-[9px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{d.desc}</p>
          </button>
        ))}
      </div>

      {/* Verse picker */}
      {!selectedVerse ? (
        <div className="space-y-2">
          <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
            {book} {chapter} — Select a verse
          </p>
          {verses.length === 0 && (
            <p className="text-xs text-white/30 text-center py-8 font-inter">
              No verses loaded. Go to the Analysis tab and select {book} {chapter} first.
            </p>
          )}
          <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-hide">
            {verses.map(v => (
              <motion.button key={v.verse} whileTap={{ scale: 0.99 }}
                onClick={() => selectVerse(v)}
                className="w-full text-left px-4 py-3 rounded-xl transition-all flex items-start gap-3"
                style={{
                  background: "var(--fill-1)",
                  border: alreadyMemorized(v.verse) ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(255,255,255,0.07)",
                }}>
                <span className="font-cinzel text-xs font-bold flex-shrink-0 pt-0.5"
                  style={{ color: alreadyMemorized(v.verse) ? "#34d399" : "rgba(255,255,255,0.3)" }}>
                  {v.verse}
                </span>
                <p className="text-xs font-inter leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.7)" }}>{v.text}</p>
                {alreadyMemorized(v.verse) && (
                  <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#34d399" }} />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Back */}
          <button onClick={() => setSelectedVerse(null)} className="flex items-center gap-1.5 text-xs font-cinzel"
            style={{ color: "rgba(255,255,255,0.35)" }}>
            <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to verses
          </button>

          {/* Verse reference */}
          <p className="font-cinzel text-sm font-semibold" style={{ color: "#a78bfa" }}>
            {book} {chapter}:{selectedVerse.verse} (KJV)
          </p>

          {/* Masked verse display */}
          <div className="rounded-2xl p-5" style={{ background: "var(--fill-1)", border: "1px solid rgba(167,139,250,0.18)" }}>
            <div className="flex flex-wrap gap-1.5 leading-loose">
              {maskedWords.map((item, idx) => (
                item.hidden ? (
                  <button key={idx} onClick={() => toggleReveal(idx)}
                    className="inline-block px-2 py-0.5 rounded-md font-playfair text-sm transition-all"
                    style={{
                      background: revealed.has(idx) ? "rgba(167,139,250,0.2)" : "rgba(167,139,250,0.1)",
                      border: "1px solid rgba(167,139,250,0.3)",
                      color: revealed.has(idx) ? "#a78bfa" : "transparent",
                      minWidth: `${Math.max(40, item.word.length * 9)}px`,
                      textAlign: "center",
                    }}>
                    {revealed.has(idx) ? item.word : "·".repeat(Math.max(3, item.word.length))}
                  </button>
                ) : (
                  <span key={idx} className="font-playfair text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {item.word}
                  </span>
                )
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button onClick={revealAll} className="text-[10px] font-cinzel px-3 py-1.5 rounded-lg"
                style={{ background: "var(--fill-2)", color: "rgba(255,255,255,0.4)" }}>
                <Eye className="w-3 h-3 inline mr-1" />Reveal All
              </button>
              <button onClick={hideAll} className="text-[10px] font-cinzel px-3 py-1.5 rounded-lg"
                style={{ background: "var(--fill-2)", color: "rgba(255,255,255,0.4)" }}>
                <EyeOff className="w-3 h-3 inline mr-1" />Hide All
              </button>
              <button onClick={() => setShowRecite(!showRecite)}
                className="ml-auto text-[10px] font-cinzel px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: showRecite ? "rgba(167,139,250,0.15)" : "rgba(167,139,250,0.08)",
                  color: "#a78bfa",
                  border: "1px solid rgba(167,139,250,0.25)"
                }}>
                Recite from Memory
              </button>
            </div>
          </div>

          {/* Recitation input */}
          <AnimatePresence>
            {showRecite && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="space-y-3">
                  <textarea
                    ref={inputRef}
                    value={userInput}
                    onChange={e => { setUserInput(e.target.value); setResult(null); }}
                    placeholder="Type the verse from memory..."
                    rows={4}
                    className="w-full rounded-xl p-4 text-sm font-playfair resize-none focus:outline-none"
                    style={{ fontSize: "16px", background: "var(--fill-2)", border: "1px solid rgba(167,139,250,0.2)", color: "rgba(255,255,255,0.85)", lineHeight: "1.75" }}
                  />
                  <div className="flex gap-2">
                    <button onClick={checkRecitation} disabled={!userInput.trim()}
                      className="flex-1 py-3 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2 transition-all"
                      style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)", opacity: !userInput.trim() ? 0.5 : 1 }}>
                      <Check className="w-4 h-4" /> Check Recitation
                    </button>
                    <button onClick={() => { setUserInput(""); setResult(null); }}
                      className="px-4 py-3 rounded-xl"
                      style={{ background: "var(--fill-2)", color: "rgba(255,255,255,0.35)" }}>
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Result */}
                  <AnimatePresence>
                    {result && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="rounded-2xl p-4 flex items-start gap-3"
                        style={{
                          background: result === "pass" ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                          border: `1px solid ${result === "pass" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                        }}>
                        {result === "pass" ? (
                          <>
                            <Trophy className="w-5 h-5 flex-shrink-0" style={{ color: "#34d399" }} />
                            <div>
                              <p className="font-cinzel text-sm font-semibold" style={{ color: "#34d399" }}>Well recited!</p>
                              <p className="text-xs font-inter mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                                +{difficulty === "hard" ? 50 : difficulty === "medium" ? 30 : 15} XP awarded. Keep practicing to master this verse.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <X className="w-5 h-5 flex-shrink-0" style={{ color: "#f87171" }} />
                            <div>
                              <p className="font-cinzel text-sm font-semibold" style={{ color: "#f87171" }}>Keep practicing</p>
                              <p className="text-xs font-inter mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                                Study the verse more and try again. Use "Reveal All" to review the full text.
                              </p>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}