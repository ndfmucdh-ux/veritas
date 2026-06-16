import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, BookOpen, Play, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { listReadingHistory } from "@/lib/dataAccess";

export default function DailySummaryCard() {
  const [streak, setStreak] = useState(0);
  const [lastVerse, setLastVerse] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.UserXP.list("-updated_date", 1).catch(() => []),
      listReadingHistory({ limit: 1 }).catch(() => []),
      base44.entities.ReadingProgress.filter({ plan_id: { $exists: true } }).catch(() => []),
    ]).then(([xp, lastRead, planProgress]) => {
      const xpRecord = xp?.[0];
      setStreak(xpRecord?.streak_days || 0);

      if (lastRead?.[0]) {
        const r = lastRead[0];
        setLastVerse({ book: r.book, chapter: r.chapter, ref: `${r.book} ${r.chapter}` });
      }

      // Find most recently active plan
      if (planProgress?.length > 0) {
        const byPlan = {};
        planProgress.forEach(p => {
          if (!p.plan_id) return;
          if (!byPlan[p.plan_id] || p.completed_at > byPlan[p.plan_id].completed_at) {
            byPlan[p.plan_id] = p;
          }
        });
        const sorted = Object.values(byPlan).sort((a, b) => (b.completed_at || "").localeCompare(a.completed_at || ""));
        if (sorted[0]) setActivePlan({ id: sorted[0].plan_id, title: sorted[0].plan_id });
      }

      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.06), rgba(251,191,36,0.04))", border: "1px solid rgba(0,245,255,0.15)" }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[9px] font-cinzel uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
          Daily Summary
        </p>
        <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>{today}</p>
      </div>

      {/* Stats */}
      <div className="px-4 py-4 space-y-3">
        {/* Streak */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.2)" }}>
            <Flame className="w-4.5 h-4.5" style={{ color: "#f97316" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>Current Streak</p>
            <p className="font-cinzel text-base font-bold" style={{ color: "#f97316" }}>
              {streak} {streak === 1 ? "day" : "days"} 🔥
            </p>
          </div>
        </div>

        {/* Last verse read */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.18)" }}>
            <BookOpen className="w-4 h-4" style={{ color: "#00f5ff" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>Last Read</p>
            {lastVerse ? (
              <a href={`/read?book=${lastVerse.book}&chapter=${lastVerse.chapter}`}
                className="font-cinzel text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: "#00f5ff" }}>
                {lastVerse.ref}
                <ChevronRight className="w-3 h-3" />
              </a>
            ) : (
              <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>Nothing yet today</p>
            )}
          </div>
        </div>

        {/* Active plan resume */}
        {activePlan && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
              <Play className="w-4 h-4" style={{ color: "#a78bfa" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>Active Plan</p>
              <p className="font-cinzel text-sm font-semibold truncate" style={{ color: "#a78bfa" }}>
                {activePlan.title.length > 22 ? activePlan.title.slice(0, 22) + "…" : activePlan.title}
              </p>
            </div>
            <a href="/plans"
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-cinzel transition-all"
              style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}>
              Resume →
            </a>
          </div>
        )}

        {!activePlan && (
          <a href="/plans"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-cinzel transition-all w-full"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <Play className="w-3.5 h-3.5" />
            Start a Reading Plan
          </a>
        )}
      </div>
    </motion.div>
  );
}