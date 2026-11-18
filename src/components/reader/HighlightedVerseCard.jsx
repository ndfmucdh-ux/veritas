import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Highlighter } from "lucide-react";

const COLOR_THEMES = {
  yellow: {
    bg: "linear-gradient(135deg, rgba(251,191,36,0.10), rgba(251,191,36,0.04))",
    border: "rgba(251,191,36,0.25)",
    accent: "#fbbf24",
    glow: "rgba(251,191,36,0.08)",
    stripe: "#fbbf24",
  },
  cyan: {
    bg: "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(0,245,255,0.03))",
    border: "rgba(0,245,255,0.2)",
    accent: "#00f5ff",
    glow: "rgba(0,245,255,0.07)",
    stripe: "#00f5ff",
  },
  purple: {
    bg: "linear-gradient(135deg, rgba(167,139,250,0.10), rgba(167,139,250,0.04))",
    border: "rgba(167,139,250,0.25)",
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.08)",
    stripe: "#a78bfa",
  },
  green: {
    bg: "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.03))",
    border: "rgba(52,211,153,0.2)",
    accent: "#34d399",
    glow: "rgba(52,211,153,0.07)",
    stripe: "#34d399",
  },
  red: {
    bg: "linear-gradient(135deg, rgba(248,113,113,0.08), rgba(248,113,113,0.03))",
    border: "rgba(248,113,113,0.2)",
    accent: "#f87171",
    glow: "rgba(248,113,113,0.07)",
    stripe: "#f87171",
  },
};

export default function HighlightedVerseCard({ highlight, index = 0 }) {
  const theme = COLOR_THEMES[highlight.color] || COLOR_THEMES.yellow;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.985 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        boxShadow: `0 4px 24px ${theme.glow}, 0 1px 0 rgb(var(--ink) / 0.04) inset`,
      }}
    >
      {/* Colored left stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: theme.stripe }} />

      {/* Subtle corner glow */}
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${theme.glow} 0%, transparent 70%)` }} />

      <Link to={`/read?book=${encodeURIComponent(highlight.book)}&chapter=${highlight.chapter}`}>
        <div className="pl-5 pr-4 py-4">
          {/* Ref row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Highlighter className="w-3 h-3" style={{ color: theme.accent }} />
              <span className="font-cinzel text-xs font-semibold" style={{ color: theme.accent }}>
                {highlight.verse_ref}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-inter px-2 py-0.5 rounded-full capitalize"
                style={{ background: `${theme.accent}15`, color: theme.accent }}>
                {highlight.color}
              </span>
              <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgb(var(--ink) / 0.2)" }} />
            </div>
          </div>

          {/* Verse text or fallback */}
          {highlight.verse_text ? (
            <p className="font-playfair italic text-sm leading-relaxed"
              style={{ color: "rgb(var(--ink) / 0.78)" }}>
              "{highlight.verse_text.length > 140 ? highlight.verse_text.slice(0, 140) + "…" : highlight.verse_text}"
            </p>
          ) : (
            <p className="text-xs font-inter" style={{ color: "rgb(var(--ink) / 0.35)" }}>
              {highlight.book} · Chapter {highlight.chapter}
            </p>
          )}

          {/* Translation tag */}
          {highlight.translation && (
            <p className="text-[10px] font-inter mt-2" style={{ color: "rgb(var(--ink) / 0.25)" }}>
              {highlight.translation}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}