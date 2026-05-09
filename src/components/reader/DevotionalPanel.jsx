import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, X, Volume2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DevotionalPanel({ book, chapter, verseRef, verseText, onClose }) {
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMood, setUserMood] = useState("seeking");

  const moods = [
    { id: "seeking", label: "Seeking", emoji: "🔍" },
    { id: "struggling", label: "Struggling", emoji: "💔" },
    { id: "grateful", label: "Grateful", emoji: "🙏" },
    { id: "questioning", label: "Questioning", emoji: "❓" },
  ];

  useEffect(() => {
    generateDevotional();
  }, [verseRef, userMood]);

  const generateDevotional = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateDailyDevotional", {
        verse_ref: verseRef,
        verse_text: verseText,
        user_mood: userMood,
      });
      if (res.data?.devotional) {
        setDevotional(res.data.devotional);
      }
    } catch (err) {
      console.error(err);
      setDevotional("Unable to generate devotional. Pray with this verse and listen for the Spirit's voice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="fixed right-0 top-0 bottom-0 z-40 w-full md:w-96"
      style={{ background: "rgba(6,10,20,0.98)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(0,245,255,0.15)" }}
    >
      {/* Header */}
      <div className="sticky top-0 px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: "#a78bfa" }} />
          <h2 className="font-cinzel text-sm font-semibold text-white">Daily Devotional</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <X className="w-4 h-4 text-white/40" />
        </button>
      </div>

      {/* Mood selector */}
      <div className="px-5 py-4 space-y-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] font-cinzel uppercase tracking-widest text-white/35">How are you feeling?</p>
        <div className="flex gap-1.5 flex-wrap">
          {moods.map(m => (
            <button
              key={m.id}
              onClick={() => setUserMood(m.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter transition-all"
              style={{
                background: userMood === m.id ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.04)",
                border: userMood === m.id ? "1px solid rgba(167,139,250,0.25)" : "1px solid transparent",
                color: userMood === m.id ? "#a78bfa" : "rgba(255,255,255,0.4)",
              }}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Devotional content */}
      <div className="px-5 py-6 space-y-4 overflow-y-auto scrollbar-hide" style={{ height: "calc(100vh - 180px)" }}>
        {/* Verse reference */}
        <div className="rounded-xl p-3" style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}>
          <p className="font-cinzel text-xs font-semibold mb-2" style={{ color: "#a78bfa" }}>
            {verseRef}
          </p>
          <p className="text-sm font-playfair italic leading-relaxed text-white/75">
            "{verseText}"
          </p>
        </div>

        {/* Devotional */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#a78bfa" }} />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <p className="text-sm font-inter leading-relaxed text-white/70">
              {devotional}
            </p>

            {/* Audio indicator */}
            <div className="mt-6 flex items-center gap-2 p-3 rounded-lg" style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.15)" }}>
              <Volume2 className="w-4 h-4" style={{ color: "#00f5ff" }} />
              <p className="text-[10px] font-inter text-white/50">
                Text-to-speech coming soon
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}