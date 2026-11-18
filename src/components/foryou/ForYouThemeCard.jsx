import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import { ES_TO_EN_BOOK } from "@/components/foryou/forYouSections";

export default function ForYouThemeCard({ theme, index, color, isExpanded, onToggle }) {
  const ThemeIcon = theme.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
      <motion.button whileTap={{ scale: 0.98 }} onClick={onToggle}
        className="w-full rounded-2xl p-4 text-left transition-all"
        style={{ background: isExpanded ? `${color}12` : "rgb(var(--ink) / 0.04)", border: `1px solid ${isExpanded ? color + "44" : "rgb(var(--ink) / 0.07)"}` }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
            <ThemeIcon className="w-5 h-5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-cinzel text-sm font-semibold text-white">{theme.label}</p>
            <p className="text-xs font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.4)" }}>{theme.desc}</p>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform"
            style={{ color: "rgb(var(--ink) / 0.3)", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }} />
        </div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-2 rounded-2xl p-4 space-y-2" style={{ background: `${color}07`, border: `1px solid ${color}22` }}>
              {theme.verses.map((verse, vi) => {
                const lastSpaceIdx = verse.lastIndexOf(" ");
                const book = verse.substring(0, lastSpaceIdx);
                const chapterVerse = verse.substring(lastSpaceIdx + 1);
                const chapter = chapterVerse.split(":")[0];
                const engBook = ES_TO_EN_BOOK[book] || book;
                return (
                  <Link key={vi} to={`/read?book=${encodeURIComponent(engBook)}&chapter=${chapter}`}>
                    <motion.div whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                      style={{ background: "var(--fill-2)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
                      <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color }} />
                      <span className="font-cinzel text-sm" style={{ color: "rgb(var(--ink) / 0.8)" }}>{verse}</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0" style={{ color: "rgb(var(--ink) / 0.25)" }} />
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}