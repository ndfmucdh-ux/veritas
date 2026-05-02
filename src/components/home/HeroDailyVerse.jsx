import { useState, useEffect } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Share2, BookOpen, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SkeletonCard } from "@/components/ui/SkeletonPulse";

export default function HeroDailyVerse() {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const shouldReduce = useReducedMotion();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  useEffect(() => {
    base44.functions.invoke("getVerseOfTheDay", {})
      .then(r => setVerse(r.data?.dailyVerse))
      .catch(() => setVerse({
        text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.",
        verse_ref: "Isaiah 40:31", translation: "KJV",
        reflection: "When you feel depleted, stop striving and start trusting. God promises to renew your strength as you wait on Him.",
        theme: "strength",
      }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonCard className="min-h-[200px]" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: "linear-gradient(135deg, rgba(0,245,255,0.07) 0%, rgba(167,139,250,0.06) 50%, rgba(255,215,0,0.06) 100%)",
        border: "1px solid rgba(255,215,0,0.18)",
        boxShadow: "0 0 40px rgba(255,215,0,0.08), 0 0 80px rgba(0,245,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Breathing glow orb */}
      {!shouldReduce && (
        <motion.div
          className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,215,0,0.12), transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {!shouldReduce && (
        <motion.div
          className="pointer-events-none absolute -bottom-12 -left-12 w-40 h-40 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,245,255,0.08), transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      )}

      {/* Inner shine */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)" }} />

      <div className="relative p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                animate={shouldReduce ? {} : { rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              </motion.div>
              <span className="text-[10px] font-inter uppercase tracking-[0.2em] text-yellow-400/80">
                Verse of the Day
              </span>
            </div>
            <p className="text-xs text-white/30 font-inter">{today}</p>
          </div>
          {verse?.theme && (
            <span className="text-[10px] px-2.5 py-1 rounded-full font-inter uppercase tracking-wider"
              style={{ background: "rgba(255,215,0,0.1)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.2)" }}>
              {verse.theme}
            </span>
          )}
        </div>

        {/* Verse text */}
        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="font-playfair italic leading-[1.85] text-white/92 mb-4"
          style={{ fontSize: "clamp(16px, 4vw, 20px)" }}
        >
          "{verse?.text}"
        </motion.blockquote>

        {/* Reference */}
        <motion.p
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="font-cinzel text-sm tracking-wide mb-5"
          style={{ color: "#FFD700" }}
        >
          — {verse?.verse_ref} <span className="text-white/30 font-inter font-normal text-xs">({verse?.translation})</span>
        </motion.p>

        {/* Reflection */}
        <AnimatePresence>
          {expanded && verse?.reflection && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="border-l-2 pl-4 mb-5" style={{ borderColor: "rgba(0,245,255,0.3)" }}>
                <p className="text-sm text-white/65 font-inter leading-relaxed">{verse.reflection}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action row */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1.5 text-xs font-inter px-3 py-2 rounded-xl transition-colors"
            style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.15)" }}
          >
            <BookOpen className="w-3 h-3" />
            {expanded ? "Hide" : "Reflect"}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigator.share?.({ title: "Veritas", text: `"${verse?.text}" — ${verse?.verse_ref}` })}
            className="flex items-center gap-1.5 text-xs font-inter px-3 py-2 rounded-xl transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Share2 className="w-3 h-3" />
            Share
          </motion.button>

          {verse?.book && (
            <motion.a
              whileTap={{ scale: 0.95 }}
              href={`/read?book=${verse.book}&chapter=${verse.chapter}&verse=${verse.verse}`}
              className="ml-auto flex items-center gap-1.5 text-xs font-inter px-3 py-2 rounded-xl transition-colors"
              style={{ background: "rgba(255,215,0,0.1)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.2)" }}
            >
              Read context →
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
}