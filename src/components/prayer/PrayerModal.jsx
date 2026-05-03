import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PrayerModal({ verse_ref, onClose, onSuccess }) {
  const [mood, setMood] = useState("grateful");
  const [loading, setLoading] = useState(false);
  const [prayer, setPrayer] = useState(null);

  const moods = [
    { id: "grateful", label: "Grateful 🙏", color: "#fbbf24" },
    { id: "confessing", label: "Confessing 🤲", color: "#f87171" },
    { id: "interceding", label: "Interceding 💗", color: "#f472b6" },
    { id: "celebrating", label: "Celebrating 🎉", color: "#34d399" }
  ];

  const handleGeneratePrayer = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("createPrayerSession", {
        verse_ref,
        mood
      });
      setPrayer(res.data.prayer);
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-3xl w-full max-w-md p-6"
        style={{
          background: "linear-gradient(135deg, rgba(6,10,20,0.98) 0%, rgba(10,15,30,0.95) 100%)",
          border: "1px solid rgba(0,245,255,0.15)",
          boxShadow: "0 20px 60px rgba(0,245,255,0.2)"
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-cinzel text-lg font-bold text-white">{verse_ref}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!prayer ? (
          <>
            <p className="text-sm text-white/60 mb-4">How do you feel right now?</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {moods.map(m => (
                <motion.button
                  key={m.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMood(m.id)}
                  className="rounded-xl p-3 text-sm font-inter transition-all"
                  style={{
                    background: mood === m.id ? `${m.color}22` : "rgba(255,255,255,0.05)",
                    color: mood === m.id ? m.color : "rgba(255,255,255,0.5)",
                    border: mood === m.id ? `1px solid ${m.color}44` : "1px solid rgba(255,255,255,0.1)"
                  }}
                >
                  {m.label}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleGeneratePrayer}
              disabled={loading}
              className="w-full py-3 rounded-xl font-cinzel text-white flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #00f5ff, #006bb3)",
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? "Creating Prayer..." : "Create Prayer"}
            </motion.button>
          </>
        ) : (
          <>
            <div
              className="rounded-xl p-4 mb-4"
              style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}
            >
              <p className="text-sm leading-relaxed text-white/70">{prayer}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPrayer(null)}
                className="flex-1 py-2 rounded-xl text-sm font-inter"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}
              >
                Back
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex-1 py-2 rounded-xl text-sm font-cinzel font-bold text-white"
                style={{ background: "linear-gradient(135deg, #00f5ff, #006bb3)" }}
              >
                Amen
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}