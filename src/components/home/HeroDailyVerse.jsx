import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2, BookOpen, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function HeroDailyVerse() {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    base44.functions.invoke("getVerseOfTheDay", {})
      .then(res => {
        const data = res.data?.dailyVerse || res.data;
        setVerse({
          verse_ref: data?.verse_ref || data?.ref,
          text: data?.text,
          reflection: data?.reflection,
          theme: data?.theme,
        });
      })
      .catch(() => setVerse({
        verse_ref: "John 3:16",
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        reflection: "God's love is not passive — it is sacrificial. Today, rest in the truth that you are loved completely.",
        theme: "love",
      }))
      .finally(() => setLoading(false));
  }, []);

  const handleShare = () => {
    if (!verse) return;
    const text = `"${verse.text}" — ${verse.verse_ref}`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard?.writeText(text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(0,245,255,0.07) 0%, rgba(255,215,0,0.05) 100%)",
        border: "1px solid rgb(var(--ink) / 0.09)",
        boxShadow: "0 0 40px rgba(0,245,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-[10px] font-inter uppercase tracking-[0.2em] mb-4" style={{ color: "rgb(var(--ink) / 0.3)" }}>
          ✦ Verse of the Day
        </p>

        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 rounded-full" style={{ background: "var(--fill-3)", width: "90%" }} />
            <div className="h-4 rounded-full" style={{ background: "var(--fill-2)", width: "75%" }} />
            <div className="h-4 rounded-full" style={{ background: "var(--fill-2)", width: "60%" }} />
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-playfair italic leading-relaxed"
            style={{ fontSize: "clamp(15px, 3.5vw, 18px)", color: "rgb(var(--ink) / 0.88)" }}
          >
            "{verse?.text}"
          </motion.p>
        )}

        {verse && (
          <p className="font-cinzel text-sm font-semibold mt-3" style={{ color: "#fbbf24" }}>
            — {verse.verse_ref}
          </p>
        )}
      </div>

      {/* Reflection */}
      {showReflection && verse?.reflection && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-5 pb-4"
        >
          <div className="rounded-xl p-3 mt-1" style={{ background: "var(--fill-2)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
            <p className="text-[10px] font-inter uppercase tracking-widest mb-1.5" style={{ color: "rgb(var(--ink) / 0.3)" }}>Reflection</p>
            <p className="text-sm font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.7)" }}>{verse.reflection}</p>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 pb-5">
        <button
          onClick={() => setShowReflection(v => !v)}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-inter transition-colors"
          style={{ background: "var(--fill-3)", color: "rgb(var(--ink) / 0.5)" }}
        >
          {showReflection ? "Hide" : "Reflect"}
        </button>
        {verse && (
          <a
            href={`/read?book=${verse.verse_ref?.split(" ").slice(0, -1).join(" ")}&chapter=${verse.verse_ref?.split(" ").pop()?.split(":")[0]}`}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-inter transition-colors"
            style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff" }}
          >
            <BookOpen className="w-3 h-3" /> Read
          </a>
        )}
        <button
          onClick={handleShare}
          className="ml-auto flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-inter transition-colors"
          style={{ background: "var(--fill-2)", color: "rgb(var(--ink) / 0.4)" }}
        >
          <Share2 className="w-3 h-3" /> Share
        </button>
      </div>
    </motion.div>
  );
}