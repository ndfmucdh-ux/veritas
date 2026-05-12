import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "@/lib/LanguageContext";
import { Shield, Heart, Zap, Star, Anchor, Sprout } from "lucide-react";

const CATEGORIES = [
  { key: "men",         icon: Shield,  color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.2)",  path: "/for-you/men" },
  { key: "women",       icon: Heart,   color: "#f472b6", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.2)", path: "/for-you/women" },
  { key: "youth",       icon: Zap,     color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.2)",  path: "/for-you/youth" },
  { key: "kids",        icon: Star,    color: "#facc15", bg: "rgba(250,204,21,0.1)",  border: "rgba(250,204,21,0.2)",  path: "/for-you/kids" },
  { key: "marriage",    icon: Anchor,  color: "#f43f5e", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.2)",   path: "/for-you/marriage" },
  { key: "newBeliever", icon: Sprout,  color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.2)",  path: "/for-you/newBeliever" },
];

export default function CategoryCards() {
  const { t } = useLang();
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {CATEGORIES.map((cat, i) => {
        const Icon = cat.icon;
        return (
          <Link key={cat.key} to={cat.path}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 360, damping: 24 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 rounded-2xl py-4 px-2 cursor-pointer"
              style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
            >
              <Icon className="w-6 h-6" style={{ color: cat.color }} />
              <span className="font-cinzel text-[11px] font-semibold text-center leading-tight" style={{ color: cat.color }}>
                {t[cat.key]}
              </span>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}