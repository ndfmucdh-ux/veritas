import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Share2, ChevronRight, Sun, Leaf } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FALLBACK = {
  verse_ref: "1 Peter 5:7",
  text: "Cast all your anxiety on him because he cares for you.",
  reflection: "You are carried. Bring today's worries to Him, one by one.",
};

export default function HeroDailyVerse() {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    base44.functions.invoke("getVerseOfTheDay", {})
      .then((res) => {
        const data = res.data?.dailyVerse || res.data;
        setVerse({ verse_ref: data?.verse_ref || data?.ref, text: data?.text, reflection: data?.reflection });
      })
      .catch(() => setVerse(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const handleShare = () => {
    if (!verse) return;
    const text = `"${verse.text}" — ${verse.verse_ref}`;
    if (navigator.share) navigator.share({ text });
    else navigator.clipboard?.writeText(text);
  };

  const parts = verse?.verse_ref?.split(" ") || [];
  const book = parts.slice(0, -1).join(" ");
  const chapter = parts[parts.length - 1]?.split(":")[0];
  const readHref = book ? `/read?book=${encodeURIComponent(book)}&chapter=${chapter}` : "/read";

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="relative rounded-3xl overflow-hidden px-6 pt-5 pb-6"
      style={{ background: "hsl(var(--card))", border: "1px solid var(--hairline)", boxShadow: "0 6px 24px rgba(90,70,30,0.08)", minHeight: 250 }}
    >
      <Leaf className="absolute -right-3 -bottom-3 w-32 h-32 opacity-[0.12] rotate-[-20deg]" strokeWidth={0.8} style={{ color: "var(--t-gold)" }} />
      <p className="relative flex items-center gap-2 text-xs font-inter uppercase tracking-[0.16em]" style={{ color: "rgb(var(--ink) / 0.7)" }}>
        <Sun className="w-5 h-5" style={{ color: "var(--t-gold)" }} strokeWidth={1.4} /> Bible verse of the day
      </p>

      <div className="relative text-center mt-5">
        {loading ? (
          <div className="space-y-2 animate-pulse py-2">
            <div className="h-6 rounded-full mx-auto" style={{ background: "var(--fill-3)", width: "85%" }} />
            <div className="h-6 rounded-full mx-auto" style={{ background: "var(--fill-2)", width: "65%" }} />
          </div>
        ) : (
          <p className="font-cinzel font-medium leading-snug text-foreground" style={{ fontSize: "clamp(24px, 6vw, 32px)" }}>
            {verse?.text}
          </p>
        )}

        {verse && (
          <div className="flex items-center gap-3 mt-4 justify-center">
            <span className="h-px flex-1 max-w-[110px]" style={{ background: "var(--t-gold)", opacity: 0.5 }} />
            <span className="font-cinzel text-xl font-medium" style={{ color: "var(--t-gold)" }}>{verse.verse_ref}</span>
            <span className="h-px flex-1 max-w-[110px]" style={{ background: "var(--t-gold)", opacity: 0.5 }} />
          </div>
        )}

        {showReflection && verse?.reflection && (
          <p className="text-sm font-inter leading-relaxed mt-4 text-left rounded-2xl p-3" style={{ background: "var(--fill-2)", color: "rgb(var(--ink) / 0.8)" }}>
            {verse.reflection}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 mt-5">
          <Link to={readHref} className="inline-flex items-center gap-1.5 px-6 min-h-11 rounded-full font-inter text-base" style={{ border: "1px solid var(--hairline)", color: "var(--t-gold)", background: "var(--fill-1)" }}>
            Read more <ChevronRight className="w-4 h-4" />
          </Link>
          {verse?.reflection && (
            <button onClick={() => setShowReflection((v) => !v)} className="px-4 min-h-11 rounded-full font-inter text-sm" style={{ color: "rgb(var(--ink) / 0.75)" }}>
              {showReflection ? "Hide" : "Reflect"}
            </button>
          )}
          <button onClick={handleShare} aria-label="Share verse" className="w-11 h-11 rounded-full flex items-center justify-center" style={{ color: "rgb(var(--ink) / 0.7)" }}>
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}