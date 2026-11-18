import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, RefreshCw, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";

const CACHE_KEY = "veritas_daily_reflection";
const CACHE_DATE_KEY = "veritas_daily_reflection_date";
const LANG_NAMES = { en: "English", es: "Spanish", fr: "French", pt: "Portuguese", de: "German" };
const TEXT = {
  en: { title: "Daily Reflection", loading: "Crafting your reflection…", empty: "Add highlights and notes to get your personal reflection." },
  es: { title: "Reflexión Diaria", loading: "Generando…", empty: "Añade notas y versículos para tu reflexión personal." },
  fr: { title: "Réflexion du jour", loading: "Préparation de votre réflexion…", empty: "Ajoutez des surlignages et des notes pour votre réflexion personnelle." },
  pt: { title: "Reflexão Diária", loading: "Gerando sua reflexão…", empty: "Adicione destaques e notas para sua reflexão pessoal." },
  de: { title: "Tägliche Besinnung", loading: "Deine Besinnung wird erstellt…", empty: "Füge Markierungen und Notizen hinzu, um deine persönliche Besinnung zu erhalten." },
};

export default function DailyReflectionCard() {
  const { lang } = useLang();
  const [reflection, setReflection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check cache — only generate once per day
    const today = new Date().toISOString().slice(0, 10);
    // Cache is per language so switching language regenerates the reflection and verse.
    const cached = sessionStorage.getItem(`${CACHE_KEY}_${lang}`);
    const cachedDate = sessionStorage.getItem(`${CACHE_DATE_KEY}_${lang}`);
    if (cached && cachedDate === today) {
      try { setReflection(JSON.parse(cached)); return; } catch {}
    }
    generateReflection();
  }, [lang]);

  const generateReflection = async () => {
    setLoading(true);
    setError(false);
    try {
      const [highlights, notes] = await Promise.all([
        base44.entities.UserHighlight.list("-created_date", 20).catch(() => []),
        base44.entities.UserNote.list("-created_date", 10).catch(() => []),
      ]);

      const hlRefs = (highlights || []).slice(0, 10).map(h => h.verse_ref).filter(Boolean).join(", ");
      const noteSnippets = (notes || []).slice(0, 5).map(n => n.note_text?.slice(0, 80)).filter(Boolean).join("; ");
      const langName = LANG_NAMES[lang] || "English";
      const langInst = `Respond entirely in ${langName}, including the book name in key_verse and the theme.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${langInst} You are a personal spiritual guide. Based on this user's most highlighted verses (${hlRefs || "John 3:16, Psalm 23:1"}) and recent notes (${noteSnippets || "general reflections"}), generate a unique, personalized daily reflection prompt.
        
        Keep it warm, intimate, and spiritually deep — like a wise mentor speaking directly to them. Include:
        - A one-sentence "Today's Prompt" (a question or contemplation tailored to their highlighted themes)
        - A short reflection (2-3 sentences) that feels personal to their journey
        - One key verse that connects their highlights
        
        Return JSON: { prompt, reflection, key_verse, theme }`,
        response_json_schema: {
          type: "object",
          properties: {
            prompt: { type: "string" },
            reflection: { type: "string" },
            key_verse: { type: "string" },
            theme: { type: "string" },
          }
        }
      });

      const today = new Date().toISOString().slice(0, 10);
      sessionStorage.setItem(`${CACHE_KEY}_${lang}`, JSON.stringify(res));
      sessionStorage.setItem(`${CACHE_DATE_KEY}_${lang}`, today);
      setReflection(res);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(167,139,250,0.09) 0%, rgba(0,245,255,0.05) 100%)",
          border: "1px solid rgba(167,139,250,0.2)",
        }}
      >
        <div className="p-3">
          {/* Header row — compact */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.3)" }}>
              <Sparkles className="w-3 h-3" style={{ color: "#a78bfa" }} />
            </div>
            <p className="font-cinzel text-xs font-semibold flex-1" style={{ color: "#a78bfa" }}>
              {(TEXT[lang] || TEXT.en).title}
            </p>
            {/* Refresh + Dismiss side by side */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={generateReflection} disabled={loading}
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "var(--fill-2)", color: "rgb(var(--ink) / 0.35)" }}>
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button onClick={() => setDismissed(true)}
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "var(--fill-2)", color: "rgb(var(--ink) / 0.35)" }}>
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 pt-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: "#a78bfa" }} />
              <p className="text-xs font-inter" style={{ color: "rgb(var(--ink) / 0.4)" }}>
                {(TEXT[lang] || TEXT.en).loading}
              </p>
            </div>
          )}

          {error && !loading && (
            <p className="text-xs font-inter pt-2" style={{ color: "rgb(var(--ink) / 0.4)" }}>
              {(TEXT[lang] || TEXT.en).empty}
            </p>
          )}

          {reflection && !loading && (
            <div className="mt-2.5 space-y-2">
              <p className="text-xs font-playfair italic leading-relaxed line-clamp-2" style={{ color: "rgb(var(--ink) / 0.82)" }}>
                "{reflection.prompt}"
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                <a href={`/read?book=${encodeURIComponent(reflection.key_verse?.split(" ").slice(0,-1).join(" "))}&chapter=${reflection.key_verse?.split(" ").pop()?.split(":")[0]}`}
                  className="font-cinzel text-[10px] font-semibold"
                  style={{ color: "#fbbf24" }}>
                  {reflection.key_verse}
                </a>
                {reflection.theme && (
                  <span className="text-[10px] font-cinzel px-2.5 py-1 rounded-xl capitalize max-w-full min-w-0 break-words text-center leading-snug"
                    style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>
                    {reflection.theme}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}