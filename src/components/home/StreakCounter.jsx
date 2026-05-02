import { motion, useReducedMotion } from "framer-motion";
import ProgressRing from "@/components/ui/ProgressRing";

const LEVEL_COLORS = {
  Seeker: "#94a3b8",
  Disciple: "#00f5ff",
  Scholar: "#FFD700",
  Elder: "#a78bfa",
};

export default function StreakCounter({ streak = 0, xp = 0, level = "Seeker", nextLevelXp = 500, chapters = 0 }) {
  const shouldReduce = useReducedMotion();
  const progress = Math.min(100, Math.round((xp / nextLevelXp) * 100));
  const color = LEVEL_COLORS[level] || "#00f5ff";
  const isActive = streak > 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 280, damping: 22 }}
        className="relative overflow-hidden rounded-2xl flex flex-col items-center justify-center py-5 gap-2"
        style={{
          background: isActive
            ? "linear-gradient(135deg, rgba(251,113,11,0.15), rgba(239,68,68,0.08))"
            : "rgba(255,255,255,0.03)",
          border: isActive ? "1px solid rgba(251,113,11,0.25)" : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Fire icon with flicker */}
        <div className="relative">
          {isActive && !shouldReduce && (
            <motion.div
              className="absolute inset-0 text-2xl flex items-center justify-center"
              animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              🔥
            </motion.div>
          )}
          <motion.span
            className="text-2xl relative z-10"
            animate={isActive && !shouldReduce ? { y: [0, -2, 0] } : {}}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            🔥
          </motion.span>
        </div>
        <p className="font-cinzel font-bold text-2xl leading-none text-white">{streak}</p>
        <p className="text-[10px] text-white/40 font-inter uppercase tracking-wider">Day Streak</p>
      </motion.div>

      {/* Level + XP ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 22 }}
        className="rounded-2xl flex flex-col items-center justify-center py-5 gap-2"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <ProgressRing value={progress} size={52} strokeWidth={4} color={color} className="mb-0.5">
          <span className="text-base font-bold font-cinzel" style={{ color }}>{progress}<span className="text-[8px] opacity-60">%</span></span>
        </ProgressRing>
        <p className="font-cinzel font-semibold text-xs" style={{ color }}>{level}</p>
        <p className="text-[10px] text-white/40 font-inter">{xp.toLocaleString()} XP</p>
      </motion.div>

      {/* Chapters */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 280, damping: 22 }}
        className="rounded-2xl flex flex-col items-center justify-center py-5 gap-2"
        style={{
          background: "linear-gradient(135deg, rgba(0,245,255,0.07), rgba(0,245,255,0.02))",
          border: "1px solid rgba(0,245,255,0.12)",
        }}
      >
        <motion.span
          className="text-2xl"
          animate={!shouldReduce ? { rotateY: [0, 360] } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          📖
        </motion.span>
        <p className="font-cinzel font-bold text-2xl leading-none text-white">{chapters}</p>
        <p className="text-[10px] text-white/40 font-inter uppercase tracking-wider">Chapters</p>
      </motion.div>
    </div>
  );
}