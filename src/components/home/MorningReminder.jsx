import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/lib/LanguageContext";
import PhotoCard, { GOLD } from "@/components/ui/PhotoCard";

export default function MorningReminder() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5 || hour >= 12) return;
    if (localStorage.getItem("veritas_morning_dismissed") === new Date().toDateString()) return;
    setVisible(true);
  }, []);

  // Derived from the active language so it changes instantly with the toggle.
  const message = t.morningMessages[new Date().getDay() % t.morningMessages.length];

  const dismiss = () => {
    localStorage.setItem("veritas_morning_dismissed", new Date().toDateString());
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        >
          <PhotoCard photo="sunrise" mark={Bell} markClass="w-24 h-24" className="rounded-2xl" innerClassName="p-4 flex gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ border: `1px solid ${GOLD}`, background: "rgba(0,0,0,0.35)" }}>
              <Bell className="w-4 h-4" style={{ color: GOLD }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-cinzel text-sm font-semibold mb-1" style={{ color: GOLD }}>{t.morningReminderTitle}</p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>{message}</p>
              <Link to="/plans" onClick={dismiss}
                className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-cinzel font-semibold px-3.5 min-h-9 rounded-full"
                style={{ background: GOLD, color: "#141414" }}>
                <BookOpen className="w-3.5 h-3.5" /> {t.openMyPlan}
              </Link>
            </div>
            <button type="button" onClick={dismiss} aria-label="Close" className="flex-shrink-0 w-9 h-9 -mt-1 -mr-1 rounded-full flex items-center justify-center">
              <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.7)" }} />
            </button>
          </PhotoCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}