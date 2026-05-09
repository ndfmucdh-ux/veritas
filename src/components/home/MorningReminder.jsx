import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const MESSAGES = [
  "Good morning! Your reading plan is waiting. A few minutes in the Word sets the tone for the day. 🌅",
  "Today's a great day to dig into Scripture. Your streak is counting on you! 🔥",
  "A new day, a new chapter. Open your reading plan and meet God in His Word. ✝️",
  "Your personalized plan is ready. Just a few verses can transform your morning. 📖",
];

export default function MorningReminder() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    const isMorning = hour >= 5 && hour < 12;
    if (!isMorning) return;

    const today = new Date().toDateString();
    const dismissed = localStorage.getItem("veritas_morning_dismissed");
    if (dismissed === today) return;

    const idx = new Date().getDay() % MESSAGES.length;
    setMessage(MESSAGES[idx]);
    setVisible(true);
  }, []);

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
          className="rounded-2xl p-4 flex gap-3"
          style={{
            background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.04))",
            border: "1px solid rgba(251,191,36,0.2)",
          }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.25)" }}>
            <Bell className="w-4 h-4" style={{ color: "#fbbf24" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-cinzel text-xs font-semibold mb-1" style={{ color: "#fbbf24" }}>Morning Reading Reminder</p>
            <p className="font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{message}</p>
            <Link to="/plans" onClick={dismiss}
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-cinzel px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
              <BookOpen className="w-3 h-3" /> Open My Plan
            </Link>
          </div>
          <button onClick={dismiss} className="flex-shrink-0 p-1 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}