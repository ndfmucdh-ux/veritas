import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

const SECTIONS = [
  {
    label: "For Men", emoji: "⚔️", path: "/discover?category=men",
    gradient: "from-blue-600/20 to-cyan-400/10", border: "rgba(56,189,248,0.2)",
    glow: "rgba(56,189,248,0.15)", desc: "Strength & Leadership",
  },
  {
    label: "For Women", emoji: "🌸", path: "/discover?category=women",
    gradient: "from-pink-500/20 to-fuchsia-400/10", border: "rgba(244,114,182,0.2)",
    glow: "rgba(244,114,182,0.15)", desc: "Grace & Dignity",
  },
  {
    label: "Youth", emoji: "🔥", path: "/discover?category=youth",
    gradient: "from-orange-500/20 to-rose-400/10", border: "rgba(251,113,11,0.2)",
    glow: "rgba(251,113,11,0.15)", desc: "Identity & Purpose",
  },
  {
    label: "Kids", emoji: "⭐", path: "/discover?category=kids",
    gradient: "from-yellow-400/20 to-amber-300/10", border: "rgba(251,191,36,0.2)",
    glow: "rgba(251,191,36,0.15)", desc: "Stories & Fun",
  },
  {
    label: "Marriage", emoji: "💍", path: "/discover?category=marriage",
    gradient: "from-rose-500/20 to-pink-400/10", border: "rgba(244,63,94,0.2)",
    glow: "rgba(244,63,94,0.15)", desc: "Love & Covenant",
  },
  {
    label: "Plans", emoji: "🗓️", path: "/plans",
    gradient: "from-emerald-500/20 to-teal-400/10", border: "rgba(52,211,153,0.2)",
    glow: "rgba(52,211,153,0.15)", desc: "Daily Devotionals",
  },
];

export default function QuickSections() {
  const shouldReduce = useReducedMotion();

  return (
    <div>
      <p className="text-[10px] font-inter uppercase tracking-[0.2em] text-white/35 mb-3">Explore</p>
      <div className="grid grid-cols-3 gap-2.5">
        {SECTIONS.map(({ label, emoji, path, gradient, border, glow, desc }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.06 * i, type: "spring", stiffness: 300, damping: 24 }}
          >
            <Link to={path}>
              <motion.div
                whileTap={shouldReduce ? {} : { scale: 0.93 }}
                whileHover={shouldReduce ? {} : { scale: 1.04, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${gradient} cursor-pointer`}
                style={{
                  border: `1px solid ${border}`,
                  boxShadow: `0 4px 20px ${glow}`,
                }}
              >
                <motion.span
                  className="text-2xl"
                  whileHover={shouldReduce ? {} : { rotate: [-5, 5, -5, 0], scale: 1.15 }}
                  transition={{ duration: 0.4 }}
                >
                  {emoji}
                </motion.span>
                <span className="text-xs font-cinzel font-semibold text-white/85 text-center leading-tight">
                  {label}
                </span>
                <span className="text-[9px] font-inter text-white/35 text-center leading-tight">
                  {desc}
                </span>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}