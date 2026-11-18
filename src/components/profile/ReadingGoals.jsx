import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Check, Minus, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";

const GOAL_OPTIONS = {
  daily: [1, 2, 3, 5, 7, 10],
  weekly: [5, 10, 15, 20, 30, 42],
};

export default function ReadingGoals() {
  const { t } = useLang();
  const [mode, setMode] = useState(() => localStorage.getItem("veritas_goal_mode") || "daily");
  const [target, setTarget] = useState(() => parseInt(localStorage.getItem("veritas_goal_target") || "3"));
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [mode]);

  const loadProgress = async () => {
    try {
      const today = new Date();
      let since;
      if (mode === "daily") {
        since = today.toISOString().split("T")[0];
      } else {
        const day = today.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diff);
        since = monday.toISOString().split("T")[0];
      }
      const all = await base44.entities.ReadingProgress.list("-completed_at", 200).catch(() => []);
      const inPeriod = (all || []).filter((r) => r.completed_at && r.completed_at.split("T")[0] >= since);
      setProgress(new Set(inPeriod.map((r) => `${r.book}:${r.chapter}`)).size);
    } catch {}
  };

  const saveGoal = () => {
    localStorage.setItem("veritas_goal_mode", mode);
    localStorage.setItem("veritas_goal_target", String(target));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const step = (dir) => {
    const opts = GOAL_OPTIONS[mode];
    const idx = Math.max(0, opts.indexOf(target));
    const next = opts[Math.min(opts.length - 1, Math.max(0, idx + dir))];
    setTarget(next);
  };

  const changeMode = (m) => {
    setMode(m);
    if (!GOAL_OPTIONS[m].includes(target)) setTarget(GOAL_OPTIONS[m][2]);
  };

  const pct = Math.min(100, Math.round((progress / target) * 100));
  const done = progress >= target;
  const stepBtn = "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0";

  return (
    <div className="rounded-2xl p-3.5 space-y-3" style={{ background: "hsl(var(--card))", border: "1px solid var(--hairline)" }}>
      <div className="flex items-center gap-3">
        <div className="flex p-0.5 rounded-full flex-shrink-0" style={{ background: "var(--fill-2)" }}>
          {["daily", "weekly"].map((m) => (
            <button key={m} onClick={() => changeMode(m)} className="px-3 min-h-8 rounded-full text-xs font-cinzel font-semibold transition-all"
              style={{ background: mode === m ? "#d9b77e" : "transparent", color: mode === m ? "#1a1408" : "rgb(var(--ink) / 0.75)" }}>
              {m === "daily" ? t.s5Daily : t.s5Weekly}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => step(-1)} aria-label="-" className={stepBtn} style={{ background: "var(--fill-3)", color: "hsl(var(--foreground))" }}><Minus className="w-4 h-4" /></button>
          <span className="font-cinzel text-2xl font-bold w-8 text-center text-foreground">{target}</span>
          <button onClick={() => step(1)} aria-label="+" className={stepBtn} style={{ background: "var(--fill-3)", color: "hsl(var(--foreground))" }}><Plus className="w-4 h-4" /></button>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs font-inter mb-1.5" style={{ color: "rgb(var(--ink) / 0.75)" }}>
          <span>{progress} / {target} {mode === "daily" ? t.s5PerDay : t.s5PerWeek}</span>
          <span style={{ color: done ? "hsl(var(--success))" : "var(--t-gold)" }}>{done ? t.s5GoalMet : `${pct}%`}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--fill-3)" }}>
          <motion.div key={`${progress}-${target}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }}
            className="h-full rounded-full" style={{ background: done ? "hsl(var(--success))" : "#d9b77e" }} />
        </div>
      </div>

      <button onClick={saveGoal} className="w-full min-h-10 rounded-xl text-sm font-cinzel font-semibold flex items-center justify-center gap-2"
        style={{ background: saved ? "hsl(var(--success) / 0.2)" : "var(--fill-2)", color: saved ? "hsl(var(--success))" : "hsl(var(--foreground))", border: "1px solid var(--hairline)" }}>
        {saved ? <><Check className="w-4 h-4" /> {t.s5GoalSaved}</> : <><Target className="w-4 h-4" /> {t.s5SaveGoal}</>}
      </button>
    </div>
  );
}