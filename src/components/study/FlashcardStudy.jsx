import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Plus, Loader2, RotateCcw, Check, X, Zap, BookOpen, Trash2, ChevronRight } from "lucide-react";
import { LoadingState } from "@/components/ui/states";

// SM-2 spaced repetition algorithm
function sm2(card, quality) {
  // quality: 0=again, 1=hard, 2=ok, 3=good, 4=easy, 5=perfect
  let { ease_factor = 2.5, interval_days = 1, repetitions = 0 } = card;
  if (quality < 3) {
    repetitions = 0;
    interval_days = 1;
  } else {
    if (repetitions === 0) interval_days = 1;
    else if (repetitions === 1) interval_days = 6;
    else interval_days = Math.round(interval_days * ease_factor);
    repetitions += 1;
  }
  ease_factor = Math.max(1.3, ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const next = new Date();
  next.setDate(next.getDate() + interval_days);
  const next_review = next.toISOString().slice(0, 10);
  return { ease_factor, interval_days, repetitions, next_review, last_quality: quality };
}

const QUALITY_BUTTONS = [
  { q: 0, label: "Again", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  { q: 2, label: "Hard", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  { q: 3, label: "Good", color: "#00f5ff", bg: "rgba(0,245,255,0.12)" },
  { q: 5, label: "Easy", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
];

export default function FlashcardStudy() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("browse"); // "browse" | "study" | "create"
  const [dueCards, setDueCards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ seen: 0, correct: 0 });
  const [importing, setImporting] = useState(false);
  const [newCard, setNewCard] = useState({ front: "", back: "", deck: "General" });

  useEffect(() => { loadCards(); }, []);

  const loadCards = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.Flashcard.list("-created_date", 100);
      setCards(all || []);
      const today = new Date().toISOString().slice(0, 10);
      setDueCards((all || []).filter(c => !c.next_review || c.next_review <= today));
    } finally {
      setLoading(false);
    }
  };

  const importFromLibrary = async () => {
    setImporting(true);
    try {
      const [highlights, notes] = await Promise.all([
        base44.entities.UserHighlight.list("-created_date", 50),
        base44.entities.UserNote.list("-created_date", 50),
      ]);
      const existing = new Set(cards.map(c => c.verse_ref));
      const toCreate = [];

      for (const h of (highlights || [])) {
        if (!existing.has(h.verse_ref)) {
          toCreate.push({
            verse_ref: h.verse_ref,
            front: h.verse_ref,
            back: `[Highlighted verse — ${h.color}]\n\nOpen the Reader to review this verse.`,
            source: "highlight",
            source_color: h.color,
            deck: "Highlights",
          });
        }
      }
      for (const n of (notes || [])) {
        const key = `${n.verse_ref}::note`;
        if (!existing.has(key)) {
          toCreate.push({
            verse_ref: key,
            front: n.verse_ref,
            back: n.note_text,
            source: "note",
            deck: "Notes",
          });
        }
      }
      if (toCreate.length > 0) {
        await base44.entities.Flashcard.bulkCreate(toCreate);
        await loadCards();
      }
    } finally {
      setImporting(false);
    }
  };

  const createCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;
    await base44.entities.Flashcard.create({ ...newCard, source: "manual" });
    setNewCard({ front: "", back: "", deck: "General" });
    setMode("browse");
    loadCards();
  };

  const deleteCard = async (id) => {
    await base44.entities.Flashcard.delete(id);
    setCards(c => c.filter(x => x.id !== id));
    setDueCards(c => c.filter(x => x.id !== id));
  };

  const handleRate = async (quality) => {
    const card = dueCards[currentIdx];
    const updates = sm2(card, quality);
    await base44.entities.Flashcard.update(card.id, updates);
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, ...updates } : c));
    setSessionStats(s => ({ seen: s.seen + 1, correct: s.correct + (quality >= 3 ? 1 : 0) }));

    if (currentIdx + 1 < dueCards.length) {
      setCurrentIdx(i => i + 1);
      setFlipped(false);
    } else {
      setMode("done");
    }
  };

  const startStudy = () => {
    setCurrentIdx(0);
    setFlipped(false);
    setSessionStats({ seen: 0, correct: 0 });
    setMode("study");
  };

  const SOURCE_COLORS = { highlight: "#fbbf24", note: "#a78bfa", manual: "#00f5ff" };
  const decks = [...new Set(cards.map(c => c.deck || "General"))];

  if (loading) return <LoadingState label="Loading your flashcards…" size="lg" />;

  // ── STUDY SESSION ──
  if (mode === "study") {
    const card = dueCards[currentIdx];
    if (!card) return null;
    return (
      <div className="space-y-4">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-cinzel" style={{ color: "rgba(255,255,255,0.4)" }}>
            {currentIdx + 1} / {dueCards.length}
          </span>
          <div className="flex-1 mx-4 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
            <div className="h-full rounded-full bg-cyan" style={{ width: `${((currentIdx) / dueCards.length) * 100}%`, transition: "width 0.3s" }} />
          </div>
          <button onClick={() => setMode("browse")} className="text-xs font-cinzel" style={{ color: "rgba(255,255,255,0.3)" }}>Exit</button>
        </div>

        {/* Card */}
        <motion.div
          key={card.id + flipped}
          initial={{ opacity: 0, rotateY: -15 }}
          animate={{ opacity: 1, rotateY: 0 }}
          className="rounded-2xl p-6 min-h-52 flex flex-col justify-between cursor-pointer"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,245,255,0.18)" }}
          onClick={() => !flipped && setFlipped(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
              {flipped ? "Answer" : "Reference"}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-cinzel"
              style={{ background: `${SOURCE_COLORS[card.source] || "#00f5ff"}15`, color: SOURCE_COLORS[card.source] || "#00f5ff" }}>
              {card.deck || "General"}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={flipped ? "back" : "front"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className={flipped ? "text-sm font-inter leading-relaxed" : "font-cinzel text-lg font-semibold"}
                style={{ color: flipped ? "rgba(255,255,255,0.8)" : "white" }}>
                {flipped ? card.back : card.front}
              </p>
            </motion.div>
          </AnimatePresence>

          {!flipped && (
            <p className="text-xs font-inter mt-4 text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
              Tap to reveal answer
            </p>
          )}
        </motion.div>

        {/* Rating buttons */}
        <AnimatePresence>
          {flipped && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-2">
              {QUALITY_BUTTONS.map(({ q, label, color, bg }) => (
                <button key={q} onClick={() => handleRate(q)}
                  className="py-3 rounded-xl font-cinzel text-xs font-semibold transition-all"
                  style={{ background: bg, color, border: `1px solid ${color}30` }}>
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── SESSION DONE ──
  if (mode === "done") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-8 text-center space-y-4"
        style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "rgba(52,211,153,0.15)" }}>
          <Zap className="w-8 h-8" style={{ color: "#34d399" }} />
        </div>
        <h2 className="font-cinzel text-xl font-bold text-white">Session Complete!</h2>
        <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.5)" }}>
          {sessionStats.seen} cards reviewed · {sessionStats.correct} correct
        </p>
        <div className="flex gap-2 justify-center">
          <button onClick={() => { loadCards(); setMode("browse"); }}
            className="px-5 py-2.5 rounded-xl font-cinzel text-sm"
            style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.25)" }}>
            Back to Decks
          </button>
        </div>
      </motion.div>
    );
  }

  // ── CREATE CARD ──
  if (mode === "create") {
    return (
      <div className="space-y-4">
        <button onClick={() => setMode("browse")} className="flex items-center gap-1.5 text-xs font-cinzel"
          style={{ color: "rgba(255,255,255,0.35)" }}>
          <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back
        </button>
        <h2 className="font-cinzel text-base font-semibold text-white">New Flashcard</h2>
        {[
          { key: "front", label: "Front (Reference / Question)", placeholder: "e.g. John 3:16 KJV" },
          { key: "back", label: "Back (Verse text / Answer)", placeholder: "For God so loved the world..." },
          { key: "deck", label: "Deck", placeholder: "General" },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="text-[10px] font-cinzel uppercase tracking-widest mb-1.5 block" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</label>
            <textarea rows={key === "back" ? 3 : 1}
              value={newCard[key]}
              onChange={e => setNewCard(n => ({ ...n, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full rounded-xl px-3 py-2.5 text-sm font-inter resize-none focus:outline-none"
              style={{ fontSize: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,245,255,0.2)", color: "rgba(255,255,255,0.85)" }}
            />
          </div>
        ))}
        <button onClick={createCard} disabled={!newCard.front.trim() || !newCard.back.trim()}
          className="w-full py-3 rounded-xl font-cinzel text-sm transition-all"
          style={{ background: "rgba(0,245,255,0.15)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.3)", opacity: (!newCard.front.trim() || !newCard.back.trim()) ? 0.5 : 1 }}>
          Save Card
        </button>
      </div>
    );
  }

  // ── BROWSE ──
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.15)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-cinzel text-sm font-semibold text-white">Flashcard Decks</p>
            <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              {cards.length} cards · {dueCards.length} due today
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMode("create")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-cinzel text-xs"
              style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.2)" }}>
              <Plus className="w-3.5 h-3.5" /> New
            </button>
            <button onClick={importFromLibrary} disabled={importing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-cinzel text-xs"
              style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
              {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
              Import
            </button>
          </div>
        </div>

        {dueCards.length > 0 ? (
          <button onClick={startStudy}
            className="w-full py-3 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2 transition-all"
            style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.25)" }}>
            <Zap className="w-4 h-4" /> Study {dueCards.length} Due Card{dueCards.length !== 1 ? "s" : ""}
          </button>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs font-inter" style={{ color: "rgba(52,211,153,0.8)" }}>
              ✓ All caught up! No cards due today.
            </p>
          </div>
        )}
      </div>

      {/* Decks */}
      {decks.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>No flashcards yet.</p>
          <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.2)" }}>
            Import from your highlights & notes, or create cards manually.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {decks.map(deck => {
            const deckCards = cards.filter(c => (c.deck || "General") === deck);
            const today = new Date().toISOString().slice(0, 10);
            const due = deckCards.filter(c => !c.next_review || c.next_review <= today).length;
            return (
              <div key={deck} className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-cinzel text-sm font-semibold text-white">{deck}</p>
                    <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {deckCards.length} cards{due > 0 ? ` · ${due} due` : " · all caught up"}
                    </p>
                  </div>
                  {due > 0 && (
                    <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.2)" }}>
                      {due} due
                    </span>
                  )}
                </div>
                <div className="px-4 pb-3 space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide">
                  {deckCards.slice(0, 5).map(card => (
                    <div key={card.id} className="flex items-center gap-3 py-1.5 border-t"
                      style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: SOURCE_COLORS[card.source] || "#00f5ff" }} />
                      <p className="text-xs font-inter flex-1 truncate" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {card.front}
                      </p>
                      <button onClick={() => deleteCard(card.id)}>
                        <Trash2 className="w-3 h-3" style={{ color: "rgba(255,255,255,0.2)" }} />
                      </button>
                    </div>
                  ))}
                  {deckCards.length > 5 && (
                    <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.2)" }}>
                      +{deckCards.length - 5} more cards
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}