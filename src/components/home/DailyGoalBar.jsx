import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, X, Check, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { listReadingActivity } from "@/lib/dataAccess";
import { useLang } from "@/lib/LanguageContext";

const GOAL_KEY = "veritas_daily_goal";
const DEFAULT_GOAL = { type: "chapters", target: 3 };

function loadGoal() {
  try {
    const saved = localStorage.getItem(GOAL_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_GOAL;
  } catch { return DEFAULT_GOAL; }
}

function saveGoal(goal) {
  localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
}

export default function DailyGoalBar() {
  const { t } = useLang();
  const [goal, setGoal] = useState(loadGoal);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [editType, setEditType] = useState(goal.type);
  const [editTarget, setEditTarget] = useState(goal.target);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayProgress();
  }, [goal]);

  const loadTodayProgress = async () => {
    setLoading(true);
    try {
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) { setLoading(false); return; }

      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      // Consolidated reading activity (ReadingSession-first, legacy fallback)
      const records = await listReadingActivity({ limit: 50 });
      const todayRecords = (records || []).filter(r => r.created_date?.slice(0, 10) === today);
      // Dedupe by book+chapter
      const unique = new Set(todayRecords.map(r => `${r.book}:${r.chapter}`));
      // chapters → unique chapter count; verses → approx 26 verses/chapter
      setProgress(goal.type === "chapters" ? unique.size : unique.size * 26);
    } catch {
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const newGoal = { type: editType, target: Math.max(1, parseInt(editTarget) || 1) };
    setGoal(newGoal);
    saveGoal(newGoal);
    setShowSettings(false);
  };

  const pct = Math.min(100, goal.target > 0 ? Math.round((progress / goal.target) * 100) : 0);
  const done = pct >= 100;
  const displayProgress = goal.type === "chapters" ? progress : progress;
  const unit = goal.type === "chapters" ? t.unitChapters : t.unitVerses;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--fill-1)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="px-4 py-3">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 flex-shrink-0" style={{ color: done ? "#34d399" : "#fbbf24" }} />
            <span className="text-[10px] font-inter uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.4)" }}>
              {t.dailyGoal}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-cinzel font-semibold" style={{ color: done ? "#34d399" : "rgba(255,255,255,0.7)" }}>
              {loading ? "…" : `${displayProgress} / ${goal.target} ${unit}`}
            </span>
            <button
              onClick={() => { setEditType(goal.type); setEditTarget(goal.target); setShowSettings(v => !v); }}
              className="w-5 h-5 flex items-center justify-center rounded-md transition-colors"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              <ChevronDown className="w-3.5 h-3.5" style={{ transform: showSettings ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--fill-3)" }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: done
                ? "linear-gradient(90deg, #34d399, #10b981)"
                : "linear-gradient(90deg, #fbbf24, #f59e0b)",
              boxShadow: done ? "0 0 8px rgba(52,211,153,0.4)" : "0 0 8px rgba(251,191,36,0.3)",
            }}
          />
        </div>

        {done && !loading && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-inter mt-1.5 text-center" style={{ color: "#34d399" }}>
            ✓ Goal complete! Well done today.
          </motion.p>
        )}
      </div>

      {/* Settings drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t space-y-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>{t.setDailyGoal}</p>

              {/* Type toggle */}
              <div className="flex gap-2">
                {[["chapters", t.chaptersLabel], ["verses", t.versesLabel]].map(([val, label]) => (
                  <button key={val} onClick={() => setEditType(val)}
                    className="flex-1 py-2 rounded-xl text-xs font-cinzel font-semibold transition-all"
                    style={{
                      background: editType === val ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)",
                      color: editType === val ? "#fbbf24" : "rgba(255,255,255,0.4)",
                      border: editType === val ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Target number */}
              <div className="flex items-center gap-3">
                <button onClick={() => setEditTarget(v => Math.max(1, parseInt(v) - 1))}
                  className="w-9 h-9 rounded-xl text-lg font-bold flex items-center justify-center"
                  style={{ background: "var(--fill-3)", color: "rgba(255,255,255,0.6)" }}>−</button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-cinzel font-bold text-white">{editTarget}</span>
                  <span className="text-xs font-inter ml-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {editType === "chapters" ? "chapters/day" : "verses/day"}
                  </span>
                </div>
                <button onClick={() => setEditTarget(v => Math.min(100, parseInt(v) + 1))}
                  className="w-9 h-9 rounded-xl text-lg font-bold flex items-center justify-center"
                  style={{ background: "var(--fill-3)", color: "rgba(255,255,255,0.6)" }}>+</button>
              </div>

              {/* Presets */}
              <div className="flex gap-1.5 flex-wrap">
                {(editType === "chapters" ? [1,2,3,5,10] : [10,25,50,100]).map(n => (
                  <button key={n} onClick={() => setEditTarget(n)}
                    className="px-3 py-1 rounded-lg text-xs font-inter"
                    style={{
                      background: editTarget === n ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
                      color: editTarget === n ? "#fbbf24" : "rgba(255,255,255,0.35)",
                      border: editTarget === n ? "1px solid rgba(251,191,36,0.25)" : "1px solid rgba(255,255,255,0.06)",
                    }}>{n}</button>
                ))}
              </div>

              <button onClick={handleSave}
                className="w-full py-2.5 rounded-xl text-sm font-cinzel font-semibold flex items-center justify-center gap-2"
                style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
                <Check className="w-4 h-4" /> {t.saveGoal}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}