import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Share2, ChevronRight, Sun, Leaf } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import useLocalizedVotd from "@/hooks/useLocalizedVotd";
import { pickVersePhoto } from "@/lib/verseImagery";

const GOLD = "#d9b77e";

export default function HeroDailyVerse() {
  const { t, lang } = useLang();
  const { verse, loading, base } = useLocalizedVotd(lang);
  const [showReflection, setShowReflection] = useState(false);

  const photo = useMemo(() => pickVersePhoto(`${verse?.text || ""} ${verse?.reflection || ""}`), [verse]);

  const handleShare = () => {
    if (!verse) return;
    const text = `"${verse.text}" — ${verse.verse_ref}`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else navigator.clipboard?.writeText(text);
  };

  const readHref = base?.book ? `/read?book=${encodeURIComponent(base.book)}&chapter=${base.chapter}` : "/read";

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="relative rounded-3xl overflow-hidden px-5 pt-5 pb-6"
      style={{ background: "#141414", border: "1px solid var(--hairline)", boxShadow: "0 6px 24px rgba(0,0,0,0.25)", minHeight: 250 }}
    >
      <img src={photo} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "grayscale(1) contrast(1.05)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.82) 100%)" }} />
      <Leaf className="absolute -right-3 -bottom-3 w-32 h-32 opacity-[0.22] rotate-[-20deg]" strokeWidth={0.8} style={{ color: GOLD }} />
      <p className="relative flex items-center gap-2 text-xs font-inter uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.8)" }}>
        <Sun className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} strokeWidth={1.4} /> {t.s3Votd}
      </p>

      <div className="relative text-center mt-5">
        {loading ? (
          <div className="space-y-2 animate-pulse py-2">
            <div className="h-6 rounded-full mx-auto" style={{ background: "rgba(255,255,255,0.18)", width: "85%" }} />
            <div className="h-6 rounded-full mx-auto" style={{ background: "rgba(255,255,255,0.12)", width: "65%" }} />
          </div>
        ) : (
          <p className="font-cinzel font-medium leading-snug text-onimage" style={{ fontSize: "clamp(24px, 6vw, 32px)" }}>
            {verse?.text}
          </p>
        )}

        {verse && (
          <div className="flex items-center gap-3 mt-4 justify-center">
            <span className="h-px flex-1 max-w-[110px]" style={{ background: GOLD, opacity: 0.6 }} />
            <span className="font-cinzel text-xl font-medium" style={{ color: GOLD }}>{verse.verse_ref}</span>
            <span className="h-px flex-1 max-w-[110px]" style={{ background: GOLD, opacity: 0.6 }} />
          </div>
        )}

        {showReflection && verse?.reflection && (
          <p className="text-sm font-inter leading-relaxed mt-4 text-left rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.92)" }}>
            {verse.reflection}
          </p>
        )}

        <div className="flex items-center justify-center gap-1.5 mt-5">
          <Link to={readHref} className="inline-flex items-center justify-center gap-1.5 px-5 min-h-11 rounded-full font-inter text-base whitespace-nowrap flex-shrink-0"
            style={{ border: "1px solid rgba(217,183,126,0.6)", color: GOLD, background: "rgba(0,0,0,0.25)" }}>
            {t.s3ReadMore} <ChevronRight className="w-4 h-4" />
          </Link>
          {verse?.reflection && (
            <button onClick={() => setShowReflection((v) => !v)} className="px-3 min-h-11 rounded-full font-inter text-sm whitespace-nowrap flex-shrink-0" style={{ color: "rgba(255,255,255,0.9)" }}>
              {showReflection ? t.s3Hide : t.s3Reflect}
            </button>
          )}
          <button onClick={handleShare} aria-label={t.s3ShareVerse} className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ color: "rgba(255,255,255,0.85)" }}>
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}