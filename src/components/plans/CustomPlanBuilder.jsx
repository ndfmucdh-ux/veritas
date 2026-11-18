import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, ChevronDown, ChevronUp, Check, CalendarDays, BookOpen, Loader2, Target } from "lucide-react";
import { BIBLE_BOOKS } from "@/lib/bibleData";
import { base44 } from "@/api/base44Client";

const THEOLOGICAL_GROUPS = [
  { id: "law",        label: "The Law",         emoji: "📜", books: [1,2,3,4,5] },
  { id: "history",    label: "Historical",      emoji: "⚔️", books: [6,7,8,9,10,11,12,13,14,15,16,17] },
  { id: "wisdom",     label: "Wisdom & Poetry", emoji: "💎", books: [18,19,20,21,22] },
  { id: "major",      label: "Major Prophets",  emoji: "🔥", books: [23,24,25,26,27] },
  { id: "minor",      label: "Minor Prophets",  emoji: "⚡", books: [28,29,30,31,32,33,34,35,36,37,38,39] },
  { id: "gospels",    label: "Gospels",          emoji: "✝️", books: [40,41,42,43] },
  { id: "acts",       label: "Acts & Epistles",  emoji: "🌍", books: [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65] },
  { id: "revelation", label: "Revelation",       emoji: "👑", books: [66] },
];

const ACCENT_COLORS = [
  "#00f5ff", "#fbbf24", "#a78bfa", "#34d399", "#f87171", "#fb923c", "#f472b6", "#60a5fa"
];
const ICONS = ["📖", "✝️", "🙏", "⭐", "🔥", "💎", "🌿", "🕊️", "🌟", "⚔️"];

export default function CustomPlanBuilder({ onClose, onSaved }) {
  const [step, setStep] = useState("details"); // details → books → confirm
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [targetDate, setTargetDate] = useState("");
  const [dailyGoal, setDailyGoal] = useState(1);
  const [accentColor, setAccentColor] = useState("#00f5ff");
  const [icon, setIcon] = useState("📖");
  const [selections, setSelections] = useState({}); // { bookName: Set<chapter> }
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [expandedBook, setExpandedBook] = useState(null);
  const [saving, setSaving] = useState(false);

  const totalChapters = useMemo(() => {
    return Object.values(selections).reduce((sum, chapters) => sum + chapters.size, 0);
  }, [selections]);

  const daysUntilTarget = useMemo(() => {
    if (!targetDate) return null;
    const diff = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  }, [targetDate]);

  const daysUntilStart = useMemo(() => {
    if (!startDate) return 0;
    const diff = Math.ceil((new Date(startDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [startDate]);

  const chaptersPerDay = daysUntilTarget && totalChapters
    ? (totalChapters / daysUntilTarget).toFixed(1)
    : dailyGoal > 0 ? String(dailyGoal) : null;

  const estimatedDays = dailyGoal > 0 && totalChapters > 0
    ? Math.ceil(totalChapters / dailyGoal)
    : null;

  const toggleChapter = (bookName, ch) => {
    setSelections(prev => {
      const updated = { ...prev };
      if (!updated[bookName]) updated[bookName] = new Set();
      else updated[bookName] = new Set(updated[bookName]);
      if (updated[bookName].has(ch)) updated[bookName].delete(ch);
      else updated[bookName].add(ch);
      if (updated[bookName].size === 0) delete updated[bookName];
      return updated;
    });
  };

  const toggleAllChapters = (bookName) => {
    const bookData = BIBLE_BOOKS.find(b => b.name === bookName);
    if (!bookData) return;
    const allChapters = Array.from({ length: bookData.chapters }, (_, i) => i + 1);
    setSelections(prev => {
      const updated = { ...prev };
      const current = updated[bookName];
      if (current && current.size === bookData.chapters) {
        delete updated[bookName];
      } else {
        updated[bookName] = new Set(allChapters);
      }
      return updated;
    });
  };

  const save = async () => {
    if (!title.trim() || totalChapters === 0) return;
    setSaving(true);
    try {
      const trimmedTitle = title.trim();
      const selectionsArr = Object.entries(selections).map(([book, chapters]) => ({
        book,
        chapters: Array.from(chapters).sort((a, b) => a - b),
      }));
      const plan = await base44.entities.CustomPlan.create({
        title: trimmedTitle,
        description: description.trim(),
        target_date: targetDate || null,
        accent_color: accentColor,
        icon,
        selections: selectionsArr,
        total_chapters: totalChapters,
        completed_chapters: [],
      });
      // Key by plan ID (not title) so renames/duplicates don't collide
      const key = plan?.id || trimmedTitle;
      localStorage.setItem(`veritas_plan_start_${key}`, startDate);
      localStorage.setItem(`veritas_plan_daily_${key}`, String(dailyGoal));
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg flex flex-col"
        style={{
          maxHeight: "92vh",
          borderRadius: "24px 24px 0 0",
          background: "var(--popover-surface)",
          border: "1px solid rgba(0,245,255,0.15)",
          boxShadow: "0 -8px 60px rgba(0,0,0,0.7)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgb(var(--ink) / 0.07)" }}>
          <div>
            <p className="font-cinzel text-base font-bold text-white">Build Custom Plan</p>
            <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.35)" }}>
              {step === "details" ? "Name & schedule your plan" : step === "books" ? `Select chapters · ${totalChapters} chosen` : "Review & save"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "var(--fill-3)", color: "rgb(var(--ink) / 0.4)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step pills */}
        <div className="flex gap-2 px-5 py-3 flex-shrink-0">
          {[["details","Details"],["books","Books"],["confirm","Confirm"]].map(([s, l], i) => {
            const steps = ["details","books","confirm"];
            const past = steps.indexOf(step) > i;
            const active = step === s;
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-cinzel"
                  style={{
                    background: active ? "rgba(0,245,255,0.12)" : past ? "rgba(52,211,153,0.1)" : "rgb(var(--ink) / 0.04)",
                    color: active ? "#00f5ff" : past ? "#34d399" : "rgb(var(--ink) / 0.3)",
                    border: active ? "1px solid rgba(0,245,255,0.3)" : past ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgb(var(--ink) / 0.07)",
                  }}>
                  {past && <Check className="w-3 h-3" />}
                  {l}
                </div>
                {i < 2 && <div className="w-4 h-px" style={{ background: "rgb(var(--ink) / 0.12)" }} />}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-4">
          <AnimatePresence mode="wait">

            {/* STEP 1: Details */}
            {step === "details" && (
              <motion.div key="details" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="space-y-4 pt-2">
                {/* Icon + Accent */}
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgb(var(--ink) / 0.3)" }}>Icon</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ICONS.map(em => (
                        <button key={em} onClick={() => setIcon(em)}
                          className="w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all"
                          style={{ background: icon === em ? "rgba(0,245,255,0.15)" : "rgb(var(--ink) / 0.05)", border: icon === em ? "1px solid rgba(0,245,255,0.4)" : "1px solid rgb(var(--ink) / 0.08)" }}>
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgb(var(--ink) / 0.3)" }}>Color</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ACCENT_COLORS.map(c => (
                        <button key={c} onClick={() => setAccentColor(c)}
                          className="w-7 h-7 rounded-full transition-all"
                          style={{ background: c, boxShadow: accentColor === c ? `0 0 0 2px hsl(var(--surface-4)), 0 0 0 4px ${c}` : "none" }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgb(var(--ink) / 0.3)" }}>Plan Title *</p>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Paul's Letters Deep Dive"
                    className="w-full rounded-xl px-4 py-3 text-sm font-inter focus:outline-none"
                    style={{ background: "var(--fill-2)", border: "1px solid rgb(var(--ink) / 0.1)", color: "rgb(var(--ink) / 0.85)" }}
                  />
                </div>

                {/* Description */}
                <div>
                  <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgb(var(--ink) / 0.3)" }}>Description</p>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What is the purpose of this plan?"
                    rows={2}
                    className="w-full rounded-xl px-4 py-3 text-sm font-inter resize-none focus:outline-none"
                    style={{ background: "var(--fill-2)", border: "1px solid rgb(var(--ink) / 0.1)", color: "rgb(var(--ink) / 0.85)" }}
                  />
                </div>

                {/* Start date */}
                <div>
                  <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgb(var(--ink) / 0.3)" }}>Start Date</p>
                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgb(var(--ink) / 0.3)" }} />
                    <input
                      type="date"
                      value={startDate}
                      min={minDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm font-inter focus:outline-none"
                      style={{ background: "var(--fill-2)", border: "1px solid rgb(var(--ink) / 0.1)", color: "rgb(var(--ink) / 0.85)", fontSize: "16px" }}
                    />
                  </div>
                  {daysUntilStart > 0 && (
                    <p className="text-[10px] font-inter mt-1.5" style={{ color: accentColor }}>Starts in {daysUntilStart} days</p>
                  )}
                </div>

                {/* Daily chapter goal */}
                <div>
                  <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgb(var(--ink) / 0.3)" }}>Daily Chapter Goal</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setDailyGoal(g => Math.max(1, g - 1))}
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                      style={{ background: "var(--fill-3)", color: "rgb(var(--ink) / 0.6)" }}>−</button>
                    <div className="flex-1 text-center">
                      <p className="font-cinzel text-2xl font-bold" style={{ color: accentColor }}>{dailyGoal}</p>
                      <p className="text-[10px] font-inter" style={{ color: "rgb(var(--ink) / 0.3)" }}>chapter{dailyGoal > 1 ? "s" : ""} / day</p>
                    </div>
                    <button onClick={() => setDailyGoal(g => Math.min(10, g + 1))}
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                      style={{ background: "var(--fill-3)", color: "rgb(var(--ink) / 0.6)" }}>+</button>
                  </div>
                  {estimatedDays && (
                    <p className="text-[10px] font-inter mt-2 text-center" style={{ color: "rgb(var(--ink) / 0.4)" }}>
                      Est. completion in <span style={{ color: accentColor }}>{estimatedDays} days</span>
                    </p>
                  )}
                </div>

                {/* Target date */}
                <div>
                  <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgb(var(--ink) / 0.3)" }}>Target Completion Date (optional)</p>
                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgb(var(--ink) / 0.3)" }} />
                    <input
                      type="date"
                      value={targetDate}
                      min={minDate}
                      onChange={e => setTargetDate(e.target.value)}
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm font-inter focus:outline-none"
                      style={{ background: "var(--fill-2)", border: "1px solid rgb(var(--ink) / 0.1)", color: targetDate ? "rgb(var(--ink) / 0.85)" : "rgb(var(--ink) / 0.3)", fontSize: "16px" }}
                    />
                  </div>
                  {daysUntilTarget && (
                    <p className="text-[10px] font-inter mt-1.5" style={{ color: accentColor }}>
                      {daysUntilTarget} days until target
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Book/Chapter selection */}
            {step === "books" && (
              <motion.div key="books" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-2 pt-2">
                {/* Stats bar */}
                {totalChapters > 0 && (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-3"
                    style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}25` }}>
                    <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
                    <span className="text-xs font-cinzel" style={{ color: accentColor }}>{totalChapters} chapters</span>
                    {chaptersPerDay && (
                      <span className="text-xs font-inter ml-auto" style={{ color: "rgb(var(--ink) / 0.4)" }}>
                        ~{chaptersPerDay} ch/day
                      </span>
                    )}
                  </div>
                )}

                {THEOLOGICAL_GROUPS.map(group => {
                  const groupBooks = BIBLE_BOOKS.filter(b => group.books.includes(b.num));
                  const isGroupExpanded = expandedGroup === group.id;
                  const groupSelectedCount = groupBooks.reduce((s, b) => s + (selections[b.name]?.size || 0), 0);

                  return (
                    <div key={group.id}>
                      <button
                        onClick={() => setExpandedGroup(isGroupExpanded ? null : group.id)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                        style={{
                          background: isGroupExpanded ? "rgb(var(--ink) / 0.05)" : "rgb(var(--ink) / 0.03)",
                          border: `1px solid ${groupSelectedCount > 0 ? accentColor + "30" : "rgb(var(--ink) / 0.07)"}`,
                        }}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{group.emoji}</span>
                          <span className="font-cinzel text-xs font-semibold" style={{ color: groupSelectedCount > 0 ? accentColor : "rgb(var(--ink) / 0.7)" }}>{group.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {groupSelectedCount > 0 && (
                            <span className="text-[10px] font-cinzel px-1.5 py-0.5 rounded-md" style={{ background: `${accentColor}20`, color: accentColor }}>{groupSelectedCount} ch</span>
                          )}
                          {isGroupExpanded ? <ChevronUp className="w-3.5 h-3.5" style={{ color: "rgb(var(--ink) / 0.3)" }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: "rgb(var(--ink) / 0.3)" }} />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isGroupExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="pl-2 pt-1 pb-2 space-y-1">
                              {groupBooks.map(b => {
                                const sel = selections[b.name];
                                const selCount = sel?.size || 0;
                                const allSelected = selCount === b.chapters;
                                const isBookExpanded = expandedBook === b.name;

                                return (
                                  <div key={b.name}>
                                    <div className="flex items-center gap-2 px-2 py-2 rounded-lg">
                                      <button onClick={() => setExpandedBook(isBookExpanded ? null : b.name)}
                                        className="flex-1 flex items-center gap-2 text-left">
                                        <span className="text-xs font-inter" style={{ color: selCount > 0 ? accentColor : "rgb(var(--ink) / 0.6)" }}>{b.name}</span>
                                        <span className="text-[10px] font-inter" style={{ color: "rgb(var(--ink) / 0.25)" }}>{b.chapters} ch</span>
                                        {selCount > 0 && <span className="text-[10px] font-cinzel" style={{ color: accentColor }}>({selCount} sel.)</span>}
                                      </button>
                                      <button
                                        onClick={() => toggleAllChapters(b.name)}
                                        className="text-[10px] px-2 py-1 rounded-lg font-cinzel transition-all flex-shrink-0"
                                        style={{
                                          background: allSelected ? `${accentColor}20` : "rgb(var(--ink) / 0.05)",
                                          color: allSelected ? accentColor : "rgb(var(--ink) / 0.4)",
                                          border: allSelected ? `1px solid ${accentColor}40` : "1px solid rgb(var(--ink) / 0.08)",
                                        }}>
                                        {allSelected ? "All ✓" : "All"}
                                      </button>
                                      <button onClick={() => setExpandedBook(isBookExpanded ? null : b.name)}
                                        style={{ color: "rgb(var(--ink) / 0.25)" }}>
                                        {isBookExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      </button>
                                    </div>

                                    <AnimatePresence>
                                      {isBookExpanded && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                                          <div className="grid grid-cols-8 gap-1 px-2 pb-2">
                                            {Array.from({ length: b.chapters }, (_, i) => i + 1).map(ch => {
                                              const selected = sel?.has(ch);
                                              return (
                                                <button key={ch} onClick={() => toggleChapter(b.name, ch)}
                                                  className="aspect-square rounded-lg text-xs font-cinzel font-semibold flex items-center justify-center transition-all"
                                                  style={{
                                                    background: selected ? `${accentColor}20` : "rgb(var(--ink) / 0.04)",
                                                    color: selected ? accentColor : "rgb(var(--ink) / 0.4)",
                                                    border: selected ? `1px solid ${accentColor}50` : "1px solid rgb(var(--ink) / 0.06)",
                                                    fontSize: "10px",
                                                  }}>
                                                  {ch}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* STEP 3: Confirm */}
            {step === "confirm" && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4 pt-2">
                {/* Preview card */}
                <div className="rounded-2xl p-5" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}25` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{icon}</span>
                    <div>
                      <p className="font-cinzel text-base font-bold text-white">{title}</p>
                      {description && <p className="text-xs font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.45)" }}>{description}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Stat label="Chapters" value={totalChapters} color={accentColor} />
                    <Stat label="Daily Goal" value={`${dailyGoal} ch`} color={accentColor} />
                    {startDate && <Stat label="Start" value={new Date(startDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} color={accentColor} />}
                    {estimatedDays && <Stat label="Est. Days" value={estimatedDays} color={accentColor} />}
                    {targetDate && <Stat label="Deadline" value={new Date(targetDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} color={accentColor} />}
                  </div>
                </div>

                {/* Book breakdown */}
                <div>
                  <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgb(var(--ink) / 0.3)" }}>Books Selected</p>
                  <div className="space-y-1.5">
                    {Object.entries(selections).map(([book, chapters]) => (
                      <div key={book} className="flex items-center justify-between px-3 py-2 rounded-xl"
                        style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
                        <span className="text-sm font-cinzel text-white">{book}</span>
                        <span className="text-xs font-inter" style={{ color: accentColor }}>
                          {chapters.size === BIBLE_BOOKS.find(b => b.name === book)?.chapters ? "All chapters" : `${chapters.size} chapters`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4" style={{ borderTop: "1px solid rgb(var(--ink) / 0.07)", background: "rgba(0,0,0,0.2)" }}>
          <div className="flex gap-3">
            {step !== "details" && (
              <button onClick={() => setStep(step === "confirm" ? "books" : "details")}
                className="px-4 py-3 rounded-2xl font-cinzel text-sm transition-all"
                style={{ background: "var(--fill-2)", color: "rgb(var(--ink) / 0.5)", border: "1px solid rgb(var(--ink) / 0.08)" }}>
                Back
              </button>
            )}
            <motion.button whileTap={{ scale: 0.96 }}
              disabled={(step === "details" && !title.trim()) || (step === "books" && totalChapters === 0) || saving}
              onClick={() => {
                if (step === "details") setStep("books");
                else if (step === "books") setStep("confirm");
                else save();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-cinzel text-sm font-bold transition-all"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
                color: "#06080f",
                opacity: ((step === "details" && !title.trim()) || (step === "books" && totalChapters === 0)) ? 0.4 : 1,
              }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : step === "confirm" ? <><Target className="w-4 h-4" /> Create Plan</> : <>Next <ChevronDown className="w-4 h-4 rotate-[-90deg]" /></>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: "var(--fill-2)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
      <p className="font-cinzel text-base font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.35)" }}>{label}</p>
    </div>
  );
}