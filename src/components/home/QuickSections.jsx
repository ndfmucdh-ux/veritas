import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const SECTIONS = [
  { label: "Reading Plans", emoji: "📖", path: "/plans", gradient: "rgba(0,245,255,0.08)", border: "rgba(0,245,255,0.15)" },
  { label: "Discover", emoji: "✨", path: "/discover", gradient: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.15)" },
  { label: "My Library", emoji: "🔖", path: "/library", gradient: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.15)" },
  { label: "Search", emoji: "🔍", path: "/search", gradient: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.15)" },
];

export default function QuickSections() {
  return (
    <div>
      <p className="text-[10px] font-inter uppercase tracking-[0.2em] mb-3" style={{ color: "rgb(var(--ink) / 0.3)" }}>
        Quick Access
      </p>
      <div className="grid grid-cols-2 auto-rows-fr gap-3">
        {SECTIONS.map((s, i) => (
          <Link key={s.path} to={s.path} className="block h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.96 }}
              className="h-full min-h-[64px] rounded-2xl px-4 py-4 flex items-center gap-3"
              style={{ background: s.gradient, border: `1px solid ${s.border}` }}
            >
              <span className="text-xl">{s.emoji}</span>
              <span className="font-cinzel text-sm font-semibold text-white/80 min-w-0 break-words">{s.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}