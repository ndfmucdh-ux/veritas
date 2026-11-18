import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Crown, Heart, ChevronRight } from "lucide-react";

const TILES = [
  { path: "/read", icon: BookOpen, title: "Today's Reading", desc: "Continue your plan with purpose.", bg: "hsl(var(--card))" },
  { path: "/plans", icon: Crown, title: "Plans", desc: "Grow deeper in His Word.", bg: "hsl(var(--gold) / 0.14)" },
  { path: "/prayer-journal", icon: Heart, title: "Prayer", desc: "Talk to God about anything.", bg: "hsl(var(--purple) / 0.14)" },
];

export default function HomeTiles() {
  return (
    <div className="grid grid-cols-3 auto-rows-fr gap-3">
      {TILES.map((tile, i) => {
        const Icon = tile.icon;
        return (
          <Link key={tile.path} to={tile.path} className="block h-full">
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              whileTap={{ scale: 0.97 }}
              className="h-full min-h-[150px] rounded-2xl p-3.5 flex flex-col"
              style={{ background: tile.bg, border: "1px solid var(--hairline)" }}
            >
              <Icon className="w-7 h-7 mb-3" strokeWidth={1.4} style={{ color: "var(--t-gold)" }} />
              <p className="font-cinzel text-xl font-semibold leading-tight text-foreground break-words">{tile.title}</p>
              <p className="font-inter text-sm mt-1 leading-snug break-words" style={{ color: "rgb(var(--ink) / 0.75)" }}>{tile.desc}</p>
              <ChevronRight className="w-4 h-4 mt-auto pt-0" style={{ color: "rgb(var(--ink) / 0.7)" }} />
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}