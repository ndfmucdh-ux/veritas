import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

const STREAK_BADGES = [
  { days: 3,  label: "Faithful",    icon: "🌱", color: "#34d399" },
  { days: 7,  label: "Devoted",     icon: "🔥", color: "#f97316" },
  { days: 14, label: "Persistent",  icon: "⭐", color: "#fbbf24" },
  { days: 30, label: "Steadfast",   icon: "🏆", color: "#a78bfa" },
  { days: 60, label: "Warrior",     icon: "⚔️", color: "#60a5fa" },
  { days: 100, label: "Elder",      icon: "👑", color: "#f472b6" },
];

function getLast35Days() {
  const days = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function PrayerStreakTracker({ prayers }) {
  const { streak, longestStreak, activeDays, earnedBadges } = useMemo(() => {
    const dates = new Set(prayers.map(p => p.created_date?.slice(0, 10)).filter(Boolean));
    const allDays = getLast35Days();

    // Calculate current streak
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    let cursor = new Date();
    // allow today or yesterday as start
    if (!dates.has(today)) cursor.setDate(cursor.getDate() - 1);
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (dates.has(key)) { streak++; cursor.setDate(cursor.getDate() - 1); }
      else break;
    }

    // Longest streak from all entries
    const sorted = [...dates].sort();
    let longest = 0, current = 0, prev = null;
    for (const d of sorted) {
      if (prev) {
        const diff = (new Date(d) - new Date(prev)) / 86400000;
        if (diff === 1) { current++; longest = Math.max(longest, current); }
        else current = 1;
      } else current = 1;
      prev = d;
    }
    longest = Math.max(longest, current, streak);

    const earnedBadges = STREAK_BADGES.filter(b => longest >= b.days);
    return { streak, longestStreak: longest, activeDays: allDays.map(d => ({ date: d, active: dates.has(d) })), earnedBadges };
  }, [prayers]);

  const nextBadge = STREAK_BADGES.find(b => streak < b.days);

  return (
    <div className="rounded-2xl overflow-hidden mb-5"
      style={{ background: "var(--fill-1)", border: "1px solid rgba(255,255,255,0.07)" }}>
      {/* Streak header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4" style={{ color: streak > 0 ? "#f97316" : "rgba(255,255,255,0.2)" }} />
          <span className="font-cinzel text-sm font-bold" style={{ color: streak > 0 ? "#f97316" : "rgba(255,255,255,0.4)" }}>
            {streak} day{streak !== 1 ? "s" : ""} streak
          </span>
        </div>
        <span className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>
          Best: {longestStreak} days
        </span>
      </div>

      {/* 5-week grid */}
      <div className="px-4 pb-3">
        <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <p key={i} className="text-center text-[8px] font-cinzel mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>{d}</p>
          ))}
          {activeDays.map(({ date, active }) => (
            <motion.div key={date}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="aspect-square rounded-md flex items-center justify-center"
              style={{
                background: active ? "rgba(249,115,22,0.25)" : "rgba(255,255,255,0.04)",
                border: active ? "1px solid rgba(249,115,22,0.5)" : "1px solid rgba(255,255,255,0.05)",
              }}
              title={date}
            >
              {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#f97316" }} />}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Next badge goal */}
      {nextBadge && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-[10px] font-inter mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span>Next: {nextBadge.icon} {nextBadge.label} ({nextBadge.days} days)</span>
            <span style={{ color: nextBadge.color }}>{streak}/{nextBadge.days}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--fill-3)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (streak / nextBadge.days) * 100)}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${nextBadge.color}, ${nextBadge.color}88)` }}
            />
          </div>
        </div>
      )}

      {/* Earned badges */}
      {earnedBadges.length > 0 && (
        <div className="px-4 pb-4 flex gap-2 flex-wrap">
          {earnedBadges.map(badge => (
            <span key={badge.days}
              className="text-[10px] font-cinzel px-2.5 py-1 rounded-full flex items-center gap-1"
              style={{ background: `${badge.color}15`, color: badge.color, border: `1px solid ${badge.color}35` }}>
              {badge.icon} {badge.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}