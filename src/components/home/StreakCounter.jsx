import { motion } from "framer-motion";
import { Flame, Zap, BookOpen } from "lucide-react";

export default function StreakCounter({ streak, xp, level, nextLevelXp, chapters }) {
  const progress = nextLevelXp ? Math.min((xp / nextLevelXp) * 100, 100) : 0;

  return (
    <div className="rounded-2xl p-4 space-y-4"
      style={{ background: "var(--fill-1)", border: "1px solid rgba(255,255,255,0.07)" }}>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill icon={<Flame className="w-4 h-4" style={{ color: "#fb923c" }} />} value={streak} label="Day Streak" color="#fb923c" />
        <StatPill icon={<Zap className="w-4 h-4" style={{ color: "#fbbf24" }} />} value={xp.toLocaleString()} label="Total XP" color="#fbbf24" />
        <StatPill icon={<BookOpen className="w-4 h-4" style={{ color: "#00f5ff" }} />} value={chapters} label="Chapters" color="#00f5ff" />
      </div>

      {/* Level + XP bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-cinzel text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{level}</span>
          <span className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>{xp.toLocaleString()} / {nextLevelXp?.toLocaleString()} XP</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--fill-3)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }}
          />
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, value, label, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl py-3"
      style={{ background: "var(--fill-1)" }}>
      {icon}
      <span className="font-cinzel font-bold text-base text-white">{value}</span>
      <span className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
    </div>
  );
}