import { motion } from "framer-motion";
import { Flame, BookOpen, Clock, TrendingUp } from "lucide-react";

export default function DashboardSummary({ xpData, readingProgress }) {
  // Estimate time spent: ~3 min per chapter read
  const chaptersRead = xpData?.chapters_read || 0;
  const estimatedMinutes = chaptersRead * 3;
  const hours = Math.floor(estimatedMinutes / 60);
  const mins = estimatedMinutes % 60;
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const streak = xpData?.streak_days || 0;
  const longestStreak = xpData?.longest_streak || 0;

  const stats = [
    {
      icon: BookOpen,
      color: "#00f5ff",
      value: chaptersRead,
      label: "Chapters Read",
      sub: `${readingProgress} sessions`,
      glow: "rgba(0,245,255,0.15)",
    },
    {
      icon: Flame,
      color: "#f97316",
      value: `${streak}d`,
      label: "Current Streak",
      sub: `Best: ${longestStreak}d`,
      glow: "rgba(249,115,22,0.15)",
    },
    {
      icon: Clock,
      color: "#a78bfa",
      value: timeLabel,
      label: "Time in Word",
      sub: "Est. reading time",
      glow: "rgba(167,139,250,0.15)",
    },
    {
      icon: TrendingUp,
      color: "#34d399",
      value: xpData?.total_xp?.toLocaleString() || "0",
      label: "Total XP",
      sub: "Keep going!",
      glow: "rgba(52,211,153,0.15)",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="rounded-2xl p-4"
          style={{
            background: s.glow,
            border: `1px solid ${s.color}25`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <s.icon className="w-4 h-4" style={{ color: s.color }} />
            <p className="text-[9px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
              {s.label}
            </p>
          </div>
          <p className="font-cinzel text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{s.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}