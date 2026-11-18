import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, Target, ChevronRight } from "lucide-react";
import { BIBLE_BOOKS } from "@/lib/bibleData";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";
import PlanDetailsStep, { ACCENT_COLORS } from "@/components/plans/builder/PlanDetailsStep";
import PlanBooksStep from "@/components/plans/builder/PlanBooksStep";
import PlanConfirmStep from "@/components/plans/builder/PlanConfirmStep";

const STEPS = ["details", "books", "confirm"];
const STEP_KEYS = { details: "bpStepDetails", books: "bpStepBooks", confirm: "bpStepConfirm" };
const today = () => new Date().toISOString().split("T")[0];
const daysFrom = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

export default function CustomPlanBuilder({ onClose, onSaved }) {
  const { t } = useLang();
  const [step, setStep] = useState("details");
  const [f, setF] = useState({ title: "", description: "", startDate: today(), targetDate: "", dailyGoal: 1, accentColor: ACCENT_COLORS[0], icon: "📖" });
  const [selections, setSelections] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (patch) => setF((p) => ({ ...p, ...patch }));

  const totalChapters = useMemo(() => Object.values(selections).reduce((s, c) => s + c.size, 0), [selections]);
  const daysUntilTarget = f.targetDate ? (daysFrom(f.targetDate) > 0 ? daysFrom(f.targetDate) : null) : null;
  const daysUntilStart = f.startDate ? Math.max(0, daysFrom(f.startDate)) : 0;
  const chaptersPerDay = daysUntilTarget && totalChapters ? (totalChapters / daysUntilTarget).toFixed(1) : String(f.dailyGoal);
  const estimatedDays = totalChapters > 0 ? Math.ceil(totalChapters / f.dailyGoal) : null;

  const toggleChapter = (book, ch) => setSelections((prev) => {
    const next = { ...prev, [book]: new Set(prev[book] || []) };
    if (next[book].has(ch)) next[book].delete(ch); else next[book].add(ch);
    if (next[book].size === 0) delete next[book];
    return next;
  });

  const toggleAll = (book) => {
    const data = BIBLE_BOOKS.find((b) => b.name === book);
    if (!data) return;
    setSelections((prev) => {
      const next = { ...prev };
      if (next[book]?.size === data.chapters) delete next[book];
      else next[book] = new Set(Array.from({ length: data.chapters }, (_, i) => i + 1));
      return next;
    });
  };

  const save = async () => {
    if (!f.title.trim() || totalChapters === 0) return;
    setSaving(true);
    try {
      const plan = await base44.entities.CustomPlan.create({
        title: f.title.trim(),
        description: f.description.trim(),
        target_date: f.targetDate || null,
        accent_color: f.accentColor,
        icon: f.icon,
        selections: Object.entries(selections).map(([book, c]) => ({ book, chapters: [...c].sort((a, b) => a - b) })),
        total_chapters: totalChapters,
        completed_chapters: [],
      });
      const key = plan?.id || f.title.trim();
      localStorage.setItem(`veritas_plan_start_${key}`, f.startDate);
      localStorage.setItem(`veritas_plan_daily_${key}`, String(f.dailyGoal));
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const idx = STEPS.indexOf(step);
  const blocked = (step === "details" && !f.title.trim()) || (step === "books" && totalChapters === 0);
  const sub = step === "details" ? t.bpSubDetails : step === "books" ? t.bpSubBooks.replace("{n}", totalChapters) : t.bpSubConfirm;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg flex flex-col bg-card border border-border rounded-t-3xl md:rounded-3xl overflow-hidden" style={{ maxHeight: "92vh" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0 border-b border-border">
          <div className="min-w-0">
            <p className="font-cinzel text-xl font-semibold text-foreground">{t.bpTitle}</p>
            <p className="text-xs mt-0.5 text-muted-foreground">{sub}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t.bpBack} className="w-10 h-10 rounded-full bg-secondary text-foreground flex items-center justify-center flex-shrink-0"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex items-center gap-1.5 px-5 py-3 flex-shrink-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`flex items-center gap-1 px-3 min-h-8 rounded-full text-xs font-cinzel border ${step === s ? "bg-primary text-primary-foreground border-primary" : i < idx ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-border"}`}>
                {i < idx && <Check className="w-3 h-3" />}{t[STEP_KEYS[s]]}
              </span>
              {i < 2 && <span className="w-3 h-px bg-border" />}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-4">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}>
              {step === "details" && <PlanDetailsStep f={f} set={set} daysUntilStart={daysUntilStart} daysUntilTarget={daysUntilTarget} estimatedDays={estimatedDays} minDate={today()} />}
              {step === "books" && <PlanBooksStep selections={selections} toggleChapter={toggleChapter} toggleAll={toggleAll} totalChapters={totalChapters} chaptersPerDay={chaptersPerDay} />}
              {step === "confirm" && <PlanConfirmStep f={f} selections={selections} totalChapters={totalChapters} estimatedDays={estimatedDays} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex-shrink-0 px-5 py-4 border-t border-border flex gap-3">
          {step !== "details" && (
            <button type="button" onClick={() => setStep(STEPS[idx - 1])} className="px-5 min-h-12 rounded-full bg-secondary text-foreground font-cinzel text-sm">{t.bpBack}</button>
          )}
          <button type="button" disabled={blocked || saving}
            onClick={() => (step === "confirm" ? save() : setStep(STEPS[idx + 1]))}
            className="flex-1 min-h-12 rounded-full bg-primary text-primary-foreground font-cinzel text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : step === "confirm" ? <><Target className="w-4 h-4" /> {t.bpCreate}</> : <>{t.bpNext} <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}