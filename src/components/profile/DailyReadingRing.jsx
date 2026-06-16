import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { listReadingActivity } from "@/lib/dataAccess";

const DAILY_GOAL = 3;

export default function DailyReadingRing({ chaptersReadToday: initialCount }) {
  const [count, setCount] = useState(initialCount || 0);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    // Consolidated reading activity (ReadingSession-first, legacy fallback)
    const refresh = () => {
      listReadingActivity({ limit: 50 })
        .then(records => {
          const todays = (records || []).filter(r => (r.created_date || "").slice(0, 10) === today);
          const unique = new Set(todays.map(r => `${r.book}:${r.chapter}`));
          setCount(unique.size);
        })
        .catch(() => {});
    };
    refresh();

    // Subscribe to both sources so the ring updates live regardless of which one is active
    const unsubSession = base44.entities.ReadingSession.subscribe((event) => {
      if (event.type === "create") refresh();
    });
    const unsubProgress = base44.entities.ReadingProgress.subscribe((event) => {
      if (event.type === "create") refresh();
    });
    return () => { unsubSession?.(); unsubProgress?.(); };
  }, []);

  const progress = Math.min(count / DAILY_GOAL, 1);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const pct = Math.round(progress * 100);
  const done = count >= DAILY_GOAL;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={done ? "#34d399" : "#00f5ff"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: done ? "drop-shadow(0 0 8px #34d39966)" : "drop-shadow(0 0 8px #00f5ff66)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-cinzel text-xl font-bold" style={{ color: done ? "#34d399" : "#00f5ff" }}>
            {count}
          </span>
          <span className="text-[9px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>
            / {DAILY_GOAL} ch
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-cinzel font-semibold" style={{ color: done ? "#34d399" : "rgba(255,255,255,0.6)" }}>
          {done ? "🎉 Goal Met!" : "Daily Goal"}
        </p>
        <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>
          {pct}% complete
        </p>
      </div>
    </div>
  );
}