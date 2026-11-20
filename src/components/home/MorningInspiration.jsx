import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ChevronRight, RefreshCw, Sun, Mountain, Feather, Droplets, Heart, Flame } from "lucide-react";
import { PhotoBackdrop, PHOTO_VARS } from "@/components/ui/PhotoCard";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { useLang } from "@/lib/LanguageContext";
import useDefaultTranslation from "@/hooks/useDefaultTranslation";
import { getTranslationLang, translateVerseRef } from "@/lib/bibleData";

// Each theme gets its own black-and-white photo and golden watermark icon.
const THEMES = {
  hope: { photo: "sunrise", mark: Sun },
  strength: { photo: "mountains", mark: Mountain },
  grace: { photo: "dove", mark: Feather },
  peace: { photo: "waterfall", mark: Droplets },
  love: { photo: "lily", mark: Heart },
  faith: { photo: "chapel", mark: Flame },
};

const getThemeStyle = (theme) => ({ color: "#d9b77e", ...(THEMES[theme?.toLowerCase()] || THEMES.faith) });

export default function MorningInspiration() {
  const { lang, t } = useLang();
  const translation = useDefaultTranslation(lang);
  const [inspiration, setInspiration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      // Cache for 2 hours per language
      const cacheKey = `morning_inspiration_${lang}_${translation}_${new Date().toISOString().slice(0, 13)}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached && !isRefresh) {
        setInspiration(JSON.parse(cached));
        setLoading(false);
        return;
      }
      const res = await base44.functions.invoke("getMorningInspiration", { language: lang, translation });
      const raw = res.data?.inspiration;
      const data = raw?.verse_ref ? { ...raw, verse_ref: translateVerseRef(raw.verse_ref, getTranslationLang(translation)) } : null;
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

  useEffect(() => { load(); }, [lang, translation]);

  if (loading) {
    return (
      <div className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: "#00f5ff" }} />
        <p className="text-xs font-inter" style={{ color: "rgb(var(--ink) / 0.35)" }}>{t.s4Preparing}</p>
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
      className="relative rounded-2xl overflow-hidden"
      style={{ background: "#141414", border: "1px solid var(--hairline)", ...PHOTO_VARS }}
    >
      <PhotoBackdrop photo={theme.photo} mark={theme.mark} markClass="w-28 h-28" />
      <div className="p-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: theme.color }} />
            <span className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: theme.color }}>
              {t.s4Inspiration}
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
                ? `${t.s4Less} ↑`
                : `${t.s4Reflect} ↓`
              }
              </button>
              <div className="flex-1" />
              {inspiration.book && inspiration.chapter && (
                <Link to={`/read?book=${encodeURIComponent(inspiration.book)}&chapter=${inspiration.chapter}&translation=${translation}`}>
                  <motion.div whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 text-[11px] font-cinzel px-3 py-1.5 rounded-lg"
                    style={{ background: `${theme.color}15`, color: theme.color, border: `1px solid ${theme.color}30` }}>
                     {t.s4ReadChapter} <ChevronRight className="w-3 h-3" />
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