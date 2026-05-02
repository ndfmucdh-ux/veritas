import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const SECTIONS = [
  { label: "For Men", emoji: "⚔️", path: "/discover?category=men", color: "from-blue-500/20 to-cyan/10", border: "border-blue-500/20" },
  { label: "For Women", emoji: "🌸", path: "/discover?category=women", color: "from-pink-500/20 to-purple/10", border: "border-pink-500/20" },
  { label: "For Youth", emoji: "🔥", path: "/discover?category=youth", color: "from-orange-500/20 to-red-500/10", border: "border-orange-500/20" },
  { label: "For Kids", emoji: "⭐", path: "/discover?category=kids", color: "from-yellow-500/20 to-gold/10", border: "border-yellow-500/20" },
  { label: "Marriage", emoji: "💍", path: "/discover?category=marriage", color: "from-rose-500/20 to-pink-500/10", border: "border-rose-500/20" },
  { label: "Plans", emoji: "📋", path: "/plans", color: "from-green-500/20 to-teal-500/10", border: "border-green-500/20" },
];

export default function QuickAccessGrid() {
  return (
    <div>
      <h3 className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-3">Explore</h3>
      <div className="grid grid-cols-3 gap-3">
        {SECTIONS.map(({ label, emoji, path, color, border }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={path}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${color} border ${border} hover:scale-105 transition-transform`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs text-center text-foreground/80 font-inter leading-tight">{label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}