import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Check, ChevronUp, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

const GOAL_OPTIONS = {
  daily: [1, 2, 3, 5, 7, 10],
  weekly: [5, 10, 15, 20, 30, 42],
};

export default function ReadingGoals() {
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
        // Start of current week (Monday)
        const day = today.getDay();
        const diff = (day === 0 ? -6 : 1 - day);
        const monday = new Date(today);
        monday.setDate(today.getDate() + diff);
        since = monday.toISOString().split("T")[0];
      }

      const all = await base44.entities.ReadingProgress.list("-completed_at", 200).catch(() => []);
      const inPeriod = (all || []).filter(r => {
        if (!r.completed_at) return false;
        const d = r.completed_at.split("T")[0];
        return d >= since;
      });
      // Deduplicate by book+chapter
      const unique = new Set(inPeriod.map(r => `${r.book}:${r.chapter}`));
      setProgress(unique.size);
    } catch {}
  };

  const saveGoal = () => {
    localStorage.setItem("veritas_goal_mode", mode);
    localStorage.setItem("veritas_goal_target", String(target));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const pct = Math.min(100, Math.round((progress / target) * 100));
  const done = progress >= target;

  const accentColor = done ? "#34d399" : "#00f5ff";

  return (
    <div className="rounded-2xl p-4 space-y-4"
      style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.12)" }}>

      {/* Mode toggle */}
      <div className="flex gap-2">
        {["daily", "weekly"].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className="flex-1 py-2 rounded-xl text-xs font-cinzel uppercase tracking-wider transition-all"
            style={{
              background: mode === m ? "rgba(0,245,255,0.12)" : "rgb(var(--ink) / 0.04)",
              color: mode === m ? "#00f5ff" : "rgb(var(--ink) / 0.3)",
              border: mode === m ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgb(var(--ink) / 0.07)"
            }}>
            {m}
          </button>
        ))}
      </div>

      {/* Target picker */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-cinzel text-sm text-white font-semibold">
            {mode === "daily" ? "Daily" : "Weekly"} Chapter Goal
          </p>
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.3)" }}>
            How many chapters to read {mode === "daily" ? "per day" : "this week"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const opts = GOAL_OPTIONS[mode];
            const idx = opts.indexOf(target);
            if (idx > 0) setTarget(opts[idx - 1]);
          }} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "var(--fill-3)", color: "rgb(var(--ink) / 0.5)" }}>
            <ChevronDown className="w-4 h-4" />
          </button>
          <span className="font-cinzel text-2xl font-bold w-10 text-center" style={{ color: accentColor }}>
            {target}
          </span>
          <button onClick={() => {
            const opts = GOAL_OPTIONS[mode];
            const idx = opts.indexOf(target);
            if (idx < opts.length - 1) setTarget(opts[idx + 1]);
          }} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "var(--fill-3)", color: "rgb(var(--ink) / 0.5)" }}>
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-[11px] mb-1.5 font-inter" style={{ color: "rgb(var(--ink) / 0.35)" }}>
          <span>{progress} of {target} chapters</span>
          <span style={{ color: done ? "#34d399" : accentColor }}>{pct}%{done ? " ✓ Goal met!" : ""}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--fill-3)" }}>
          <motion.div
            key={`${progress}-${target}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ background: done ? "linear-gradient(90deg,#34d399,#6ee7b7)" : "linear-gradient(90deg,#00f5ff,#06b6d4)" }}
          />
        </div>
        {/* Chapter dots */}
        <div className="flex gap-1 mt-2 flex-wrap">
          {Array.from({ length: Math.min(target, 42) }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full transition-all"
              style={{ background: i < progress ? accentColor : "rgb(var(--ink) / 0.08)" }} />
          ))}
        </div>
      </div>

      {/* Save button */}
      <button onClick={saveGoal}
        className="w-full py-2.5 rounded-xl text-sm font-cinzel font-semibold transition-all flex items-center justify-center gap-2"
        style={{
          background: saved ? "rgba(52,211,153,0.15)" : "rgba(0,245,255,0.1)",
          color: saved ? "#34d399" : "#00f5ff",
          border: saved ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(0,245,255,0.2)"
        }}>
        {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Target className="w-4 h-4" /> Save Goal</>}
      </button>
    </div>
  );
}