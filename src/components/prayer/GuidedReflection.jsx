import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, X, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";
import { getTranslatedBookName } from "@/lib/bibleData";

export default function GuidedReflection({ book, chapter, verses, onClose }) {
  const { lang } = useLang();
  const isEs = lang === "es";
  const displayBook = getTranslatedBookName(book, lang);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setQuestion(null);
    const sampleText = (verses || []).slice(0, 6).map(v => `${v.verse}. ${v.text}`).join(" ");
    const langInst = isEs ? "Respond entirely in Spanish." : "Respond in English.";
    const prompt = `${langInst} You are a gentle spiritual guide. Based on this passage from ${book} chapter ${chapter}:\n\n"${sampleText}"\n\nGenerate ONE single short, personal, reflective question (max 25 words) that helps the reader apply this scripture to their daily life. Return only the question, nothing else.`;
    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setQuestion(typeof result === "string" ? result.trim() : (isEs ? "¿Cómo te habla este pasaje en donde estás hoy?" : "How does this passage speak to where you are today?"));
    setLoading(false);
  };

  useEffect(() => { generate(); }, [book, chapter, lang]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="rounded-2xl p-4 relative"
      style={{
        background: "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(251,191,36,0.06))",
        border: "1px solid rgba(251,191,36,0.2)",
        boxShadow: "0 0 28px rgba(251,191,36,0.05)",
      }}
    >
      <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 0 }}>
        <X style={{ width: 14, height: 14 }} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Sparkles style={{ width: 14, height: 14, color: "#fbbf24" }} />
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", color: "#fbbf24", margin: 0 }}>
          {isEs ? "REFLEXIÓN GUIADA" : "GUIDED REFLECTION"} · {displayBook} {chapter}
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Loader2 style={{ width: 14, height: 14, color: "#a78bfa", animation: "spin 1s linear infinite" }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>{isEs ? "Reflexionando sobre tu lectura…" : "Reflecting on your reading…"}</p>
        </div>
      ) : question ? (
        <>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontStyle: "italic", lineHeight: 1.7, color: "rgba(255,255,255,0.88)", margin: "0 0 14px" }}>
            "{question}"
          </p>
          <button onClick={generate} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'Cinzel', serif", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
            <RefreshCw style={{ width: 11, height: 11 }} /> {isEs ? "Nueva pregunta" : "New question"}
          </button>
        </>
      ) : null}
    </motion.div>
  );
}