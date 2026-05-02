import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2, BookOpen, Star, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DailyVerseCard() {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    loadDailyVerse();
  }, []);

  const loadDailyVerse = async () => {
    try {
      const res = await base44.functions.invoke("getVerseOfTheDay", {});
      setVerse(res.data.dailyVerse);
    } catch (e) {
      // Fallback verse
      setVerse({
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        verse_ref: "John 3:16",
        translation: "KJV",
        reflection: "This verse encapsulates the entire gospel. God's love is not passive — it moved Him to action, to sacrifice, to give. Today, rest in the knowledge that you are deeply, unconditionally loved.",
        theme: "love"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && verse) {
      navigator.share({
        title: "Verse of the Day — Veritas",
        text: `"${verse.text}" — ${verse.verse_ref} (${verse.translation})`,
      });
    }
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl glow-gold"
      style={{
        background: "linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(167,139,250,0.08) 50%, rgba(0,229,255,0.08) 100%)",
        border: "1px solid rgba(251,191,36,0.25)"
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
        <div className="w-full h-full rounded-full" style={{ background: "radial-gradient(circle, #fbbf24, transparent)" }} />
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-inter">Verse of the Day</p>
            <p className="text-xs text-gold/70 mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gold" />
            {verse?.theme && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 capitalize">
                {verse.theme}
              </span>
            )}
          </div>
        </div>

        {/* Verse Text */}
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 shimmer rounded w-full" />
            <div className="h-4 shimmer rounded w-5/6" />
            <div className="h-4 shimmer rounded w-4/6" />
          </div>
        ) : (
          <>
            <blockquote className="font-playfair text-lg leading-relaxed text-foreground italic mb-3">
              "{verse?.text}"
            </blockquote>
            <p className="text-sm font-cinzel text-gold tracking-wide">
              — {verse?.verse_ref} ({verse?.translation})
            </p>

            {/* Reflection Toggle */}
            {verse?.reflection && (
              <div className="mt-4">
                <button
                  onClick={() => setShowReflection(!showReflection)}
                  className="text-xs text-cyan hover:text-cyan/80 transition-colors flex items-center gap-1"
                >
                  <BookOpen className="w-3 h-3" />
                  {showReflection ? "Hide reflection" : "Read reflection"}
                </button>
                {showReflection && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 text-sm text-muted-foreground leading-relaxed font-inter border-l-2 border-cyan/30 pl-3"
                  >
                    {verse.reflection}
                  </motion.p>
                )}
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          {verse && (
            <a
              href={`/read?book=${verse.book}&chapter=${verse.chapter}&verse=${verse.verse}`}
              className="flex items-center gap-2 text-xs text-gold hover:text-gold/80 transition-colors px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/15"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Read in context
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}