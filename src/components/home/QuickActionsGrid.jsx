import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Map, Compass, Palette } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

export default function QuickActionsGrid() {
  const { t } = useLang();
  const actions = [
    { label: t.studyCenter, icon: GraduationCap, path: "/study-center", color: "#00f5ff", bg: "rgba(0,245,255,0.08)", border: "rgba(0,245,255,0.15)" },
    { label: t.readingPlans, icon: Map, path: "/plans", color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.15)" },
    { label: t.discover, icon: Compass, path: "/discover", color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.15)" },
    { label: t.verseArt, icon: Palette, path: "/verse-art", color: "#f472b6", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.15)" },
  ];

  return (
    <div className="grid grid-cols-2 auto-rows-fr gap-3">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <Link key={action.path} to={action.path} className="block h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              whileTap={{ scale: 0.96 }}
              className="h-full min-h-[92px] flex flex-col gap-2 rounded-2xl px-4 py-5"
              style={{ background: action.bg, border: `1px solid ${action.border}` }}
            >
              <Icon className="w-6 h-6" style={{ color: action.color }} />
              <span className="font-cinzel text-sm font-semibold text-white/80 break-words">{action.label}</span>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}