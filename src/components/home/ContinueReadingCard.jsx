import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

export default function ContinueReadingCard() {
  const { t } = useLang();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Link to="/read">
        <motion.div
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="flex items-center gap-4 px-5 py-5 rounded-2xl"
          style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.07), rgba(0,245,255,0.03))", border: "1px solid rgba(0,245,255,0.14)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,245,255,0.12)", border: "1px solid rgba(0,245,255,0.2)" }}
          >
            <BookOpen className="w-5 h-5" style={{ color: "#00f5ff" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-cinzel text-sm font-semibold text-white/90">{t.continueReading}</p>
            <p className="font-inter text-xs mt-0.5" style={{ color: "rgb(var(--ink) / 0.35)" }}>{t.pickUp}</p>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(0,245,255,0.5)" }} />
        </motion.div>
      </Link>
    </motion.div>
  );
}