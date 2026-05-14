import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, RefreshCw, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";

const CACHE_KEY = "veritas_daily_reflection";
const CACHE_DATE_KEY = "veritas_daily_reflection_date";

export default function DailyReflectionCard() {
  const { lang } = useLang();
  const [reflection, setReflection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check cache — only generate once per day
    const today = new Date().toISOString().slice(0, 10);
    const cached = sessionStorage.getItem(CACHE_KEY);
    const cachedDate = sessionStorage.getItem(CACHE_DATE_KEY);
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
      const langInst = lang === "es" ? "Respond entirely in Spanish." : "Respond in English.";

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
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(res));
      sessionStorage.setItem(CACHE_DATE_KEY, today);
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
          background: "linear-gradient(135deg, rgba(167,139,250,0.1) 0%, rgba(0,245,255,0.07) 100%)",
          border: "1px solid rgba(167,139,250,0.25)",
          boxShadow: "0 0 40px rgba(167,139,250,0.08)"
        }}
      >
        {/* Dismiss */}
        <button onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center z-10"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.35)" }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
            </div>
            <div>
              <p className="font-cinzel text-xs font-semibold" style={{ color: "#a78bfa" }}>
                {lang === "es" ? "Reflexión Diaria" : "Daily Reflection"}
              </p>
              <p className="text-[9px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>
                {lang === "es" ? "Personalizada según tus versículos" : "Personalized from your highlights"}
              </p>
            </div>
            <button onClick={generateReflection} disabled={loading}
              className="ml-auto w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-2 py-3">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#a78bfa" }} />
              <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>
                {lang === "es" ? "Generando tu reflexión…" : "Crafting your reflection…"}
              </p>
            </div>
          )}

          {error && !loading && (
            <p className="text-xs font-inter py-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              {lang === "es" ? "Añade más notas y versículos para obtener tu reflexión personal." : "Add more highlights and notes to get your personal reflection."}
            </p>
          )}

          {reflection && !loading && (
            <div className="space-y-3">
              {/* Today's prompt */}
              <div className="rounded-xl px-3 py-2.5"
                style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
                <p className="text-[9px] font-cinzel uppercase tracking-widest mb-1" style={{ color: "rgba(167,139,250,0.7)" }}>
                  {lang === "es" ? "✦ Reflexiona Hoy" : "✦ Today's Prompt"}
                </p>
                <p className="text-sm font-playfair italic leading-relaxed" style={{ color: "rgba(255,255,255,0.88)" }}>
                  {reflection.prompt}
                </p>
              </div>

              {/* Reflection */}
              <p className="text-xs font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                {reflection.reflection}
              </p>

              {/* Key verse + theme */}
              <div className="flex items-center justify-between">
                <a href={`/read?book=${encodeURIComponent(reflection.key_verse?.split(" ").slice(0,-1).join(" "))}&chapter=${reflection.key_verse?.split(" ").pop()?.split(":")[0]}`}
                  className="font-cinzel text-xs font-semibold"
                  style={{ color: "#fbbf24" }}>
                  {reflection.key_verse}
                </a>
                {reflection.theme && (
                  <span className="text-[9px] font-cinzel px-2 py-0.5 rounded-full capitalize"
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