import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "@/lib/LanguageContext";

const CATEGORIES = [
  { key: "men",    emoji: "⚔️", color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.2)",  path: "/plans?cat=men" },
  { key: "women",  emoji: "🌸", color: "#f472b6", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.2)", path: "/plans?cat=women" },
  { key: "youth",  emoji: "🔥", color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.2)",  path: "/plans?cat=youth" },
  { key: "kids",   emoji: "⭐", color: "#facc15", bg: "rgba(250,204,21,0.1)",  border: "rgba(250,204,21,0.2)",  path: "/discover?category=kids" },
  { key: "marriage",    emoji: "💍", color: "#f43f5e", bg: "rgba(244,63,94,0.1)", border: "rgba(244,63,94,0.2)", path: "/plans?cat=marriage" },
  { key: "newBeliever", emoji: "🌱", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)", path: "/plans?cat=new_believer" },
];

export default function CategoryCards() {
  const { t } = useLang();
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {CATEGORIES.map((cat, i) => (
        <Link key={cat.key} to={cat.path}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 360, damping: 24 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 rounded-2xl py-4 px-2 cursor-pointer"
            style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
          >
            <span className="text-2xl">{cat.emoji}</span>
            <span className="font-cinzel text-[11px] font-semibold text-center leading-tight" style={{ color: cat.color }}>
              {t[cat.key]}
            </span>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}