import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ChevronRight, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { useLang } from "@/lib/LanguageContext";

const THEMES = {
  hope: { color: "#fbbf24", bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.2)" },
  strength: { color: "#f97316", bg: "rgba(249,115,22,0.06)", border: "rgba(249,115,22,0.2)" },
  grace: { color: "#a78bfa", bg: "rgba(167,139,250,0.06)", border: "rgba(167,139,250,0.2)" },
  peace: { color: "#34d399", bg: "rgba(52,211,153,0.06)", border: "rgba(52,211,153,0.2)" },
  love: { color: "#f472b6", bg: "rgba(244,114,182,0.06)", border: "rgba(244,114,182,0.2)" },
  faith: { color: "#00f5ff", bg: "rgba(0,245,255,0.06)", border: "rgba(0,245,255,0.2)" },
};

const getThemeStyle = (theme) => THEMES[theme?.toLowerCase()] || THEMES.faith;

export default function MorningInspiration() {
  const { lang } = useLang();
  const [inspiration, setInspiration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      // Cache for 2 hours per language
      const cacheKey = `morning_inspiration_${lang}_${new Date().toISOString().slice(0, 13)}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached && !isRefresh) {
        setInspiration(JSON.parse(cached));
        setLoading(false);
        return;
      }
      const res = await base44.functions.invoke("getMorningInspiration", { language: lang });
      const data = res.data?.inspiration;
      if (data?.verse_ref) {
        setInspiration(data);
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      }
    } catch {
      // Silently fail — this is decorative
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [lang]);

  if (loading) {
    return (
      <div className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: "#00f5ff" }} />
        <p className="text-xs font-inter" style={{ color: "rgb(var(--ink) / 0.35)" }}>Preparing your morning verse…</p>
      </div>
    );
  }

  if (!inspiration) return null;

  const theme = getThemeStyle(inspiration.theme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: theme.color }} />
            <span className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: theme.color }}>
              {lang === "es" ? "Inspiración del día" : lang === "pt" ? "Inspiração do dia" : "Morning Inspiration"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-inter px-2 py-0.5 rounded-full capitalize"
              style={{ background: `${theme.color}18`, color: theme.color }}>
              {inspiration.theme}
            </span>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => load(true)}
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "var(--fill-3)" }}
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`}
                style={{ color: "rgb(var(--ink) / 0.3)" }} />
            </motion.button>
          </div>
        </div>

        {/* Verse text */}
        <AnimatePresence mode="wait">
          <motion.div key={inspiration.verse_ref}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <p className="font-playfair italic leading-relaxed mb-2"
              style={{ fontSize: "15px", color: "rgb(var(--ink) / 0.88)" }}>
              "{inspiration.verse_text}"
            </p>
            <p className="font-cinzel text-xs font-semibold mb-3" style={{ color: theme.color }}>
              — {inspiration.verse_ref}
            </p>

            {/* Reflection */}
            <AnimatePresence>
              {expanded && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm font-inter leading-relaxed mb-3 overflow-hidden"
                  style={{ color: "rgb(var(--ink) / 0.6)" }}
                >
                  {inspiration.reflection}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpanded(v => !v)}
                className="text-[11px] font-inter"
                style={{ color: "rgb(var(--ink) / 0.35)" }}
              >
                {expanded
                ? (lang === "es" ? "Menos ↑" : lang === "pt" ? "Menos ↑" : "Less ↑")
                : (lang === "es" ? "Reflexionar ↓" : lang === "pt" ? "Refletir ↓" : "Reflect ↓")
              }
              </button>
              <div className="flex-1" />
              {inspiration.book && inspiration.chapter && (
                <Link to={`/read?book=${encodeURIComponent(inspiration.book)}&chapter=${inspiration.chapter}`}>
                  <motion.div whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 text-[11px] font-cinzel px-3 py-1.5 rounded-lg"
                    style={{ background: `${theme.color}15`, color: theme.color, border: `1px solid ${theme.color}30` }}>
                     {lang === "es" ? "Leer capítulo" : lang === "pt" ? "Ler capítulo" : "Read Chapter"} <ChevronRight className="w-3 h-3" />
                  </motion.div>
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}