import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, BookOpen, ChevronDown, ChevronUp, MessageCircle, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";
import { LoadingState } from "@/components/ui/states";

export default function AIStudyPartner() {
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedWord, setExpandedWord] = useState(null);
  const [followUp, setFollowUp] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpResult, setFollowUpResult] = useState(null);

  const langInst = lang === "es"
    ? "Respond entirely in Spanish. Use 'Padre' instead of 'Dios' in narrative text."
    : "Respond in English.";

  const analyze = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setFollowUpResult(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `${langInst} You are a world-class biblical scholar with deep expertise in Koine Greek, Biblical Hebrew, Ancient Near East history, and systematic theology. A student is asking about: "${query}".

Provide a comprehensive, deeply researched response including:
1. The verse in its full historical and cultural context
2. Key original language words: for EACH key word provide the original Hebrew/Greek word (in native script), its transliteration, part of speech, and a full semantic range explanation — how this word expands the meaning beyond what English translations capture
3. How the verse connects to the broader biblical narrative (redemptive history, covenant themes)
4. Major theological traditions' interpretation (Reformed, Catholic, Eastern Orthodox if relevant)
5. Related passages that illuminate this text
6. A personal devotional application

Return JSON with structure as specified.`,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          verse_text: { type: "string" },
          reference: { type: "string" },
          historical_context: { type: "string" },
          original_language: {
            type: "array",
            items: {
              type: "object",
              properties: {
                english_word: { type: "string" },
                original_script: { type: "string" },
                transliteration: { type: "string" },
                language: { type: "string" },
                part_of_speech: { type: "string" },
                literal_meaning: { type: "string" },
                semantic_range: { type: "string" },
                how_it_expands: { type: "string" },
              }
            }
          },
          redemptive_context: { type: "string" },
          theological_insights: { type: "string" },
          related_passages: { type: "array", items: { type: "string" } },
          application: { type: "string" },
        }
      }
    });

    setResult(res);
    setLoading(false);
  };

  const askFollowUp = async () => {
    if (!followUp.trim() || !result) return;
    setFollowUpLoading(true);
    setFollowUpResult(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `${langInst} You are a biblical scholar. The user is studying "${query}". We already analyzed it. Now they ask a follow-up question: "${followUp}". 
      Previous context: ${result.historical_context?.slice(0, 300)}.
      Answer their specific follow-up clearly and concisely. Return JSON: { answer }`,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: { answer: { type: "string" } }
      }
    });

    setFollowUpResult(res.answer);
    setFollowUpLoading(false);
    setFollowUp("");
  };

  const ph = lang === "es"
    ? "ej. Juan 3:16, o '¿Qué significa gracia en griego?'"
    : "e.g. John 3:16, or 'What does the Greek word for grace mean?'";

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="rounded-2xl p-4"
        style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(167,139,250,0.08))", border: "1px solid rgba(0,245,255,0.2)" }}>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,245,255,0.12)", border: "1px solid rgba(0,245,255,0.25)" }}>
            <Sparkles className="w-4 h-4" style={{ color: "#00f5ff" }} />
          </div>
          <div>
            <p className="font-cinzel text-sm font-bold text-white">
              {lang === "es" ? "Compañero de Estudio IA" : "AI Study Partner"}
            </p>
            <p className="text-[10px] font-inter" style={{ color: "rgb(var(--ink) / 0.35)" }}>
              {lang === "es" ? "Griego · Hebreo · Teología · Contexto" : "Greek · Hebrew · Theology · Context"}
            </p>
          </div>
        </div>
        <p className="text-xs font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.5)" }}>
          {lang === "es"
            ? "Pregunta sobre cualquier versículo o término bíblico. Exploro el griego y hebreo original, historia, teología y aplicación personal."
            : "Ask about any verse or biblical term. I'll explore the original Greek and Hebrew, history, theology, and personal application."}
        </p>
      </div>

      {/* Input */}
      <div className="relative">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && analyze()}
          placeholder={ph}
          className="w-full pl-4 pr-14 py-3.5 rounded-xl text-sm font-inter focus:outline-none"
          style={{ background: "var(--fill-2)", border: "1px solid rgba(0,245,255,0.2)", color: "rgb(var(--ink) / 0.85)", fontSize: "16px" }}
        />
        <motion.button whileTap={{ scale: 0.9 }} onClick={analyze} disabled={loading || !query.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(0,245,255,0.15)", color: "#00f5ff", opacity: !query.trim() ? 0.4 : 1 }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </motion.button>
      </div>

      {/* Loading */}
      {loading && (
        <LoadingState label={lang === "es" ? "Consultando las Escrituras originales…" : "Consulting original scriptures…"} size="md" minHeight={120} />
      )}

      {/* Result */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

            {/* Verse text */}
            {result.verse_text && (
              <div className="rounded-2xl p-4"
                style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "#fbbf24" }}>
                  {result.reference}
                </p>
                <p className="font-playfair italic text-sm leading-relaxed" style={{ color: "rgb(var(--ink) / 0.88)" }}>
                  "{result.verse_text}"
                </p>
              </div>
            )}

            {/* Historical Context */}
            <StudySection label={lang === "es" ? "Contexto Histórico" : "Historical Context"} color="#00f5ff">
              <p className="text-sm font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.75)" }}>
                {result.historical_context}
              </p>
            </StudySection>

            {/* Original Language Words */}
            {result.original_language?.length > 0 && (
              <StudySection label={lang === "es" ? "Palabras en Griego / Hebreo Original" : "Original Greek / Hebrew Words"} color="#a78bfa">
                <div className="space-y-2">
                  {result.original_language.map((w, i) => {
                    const isOpen = expandedWord === i;
                    return (
                      <motion.div key={i} className="rounded-xl overflow-hidden"
                        style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
                          onClick={() => setExpandedWord(isOpen ? null : i)}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-cinzel text-sm font-bold text-white">{w.english_word}</span>
                              <span className="font-bold text-base" style={{ color: "#a78bfa", fontFamily: "serif" }}>{w.original_script}</span>
                              <span className="text-xs italic" style={{ color: "rgba(167,139,250,0.7)" }}>{w.transliteration}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>
                                {w.language}
                              </span>
                            </div>
                            <p className="text-xs font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.45)" }}>{w.literal_meaning}</p>
                          </div>
                          {isOpen ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#a78bfa" }} />
                            : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgb(var(--ink) / 0.25)" }} />}
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="px-3 pb-3 space-y-2" style={{ borderTop: "1px solid rgba(167,139,250,0.1)" }}>
                                <div className="pt-2">
                                  <p className="text-[9px] font-cinzel uppercase tracking-widest mb-1" style={{ color: "rgba(167,139,250,0.6)" }}>
                                    {lang === "es" ? "Rango Semántico" : "Semantic Range"}
                                  </p>
                                  <p className="text-xs font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.65)" }}>{w.semantic_range}</p>
                                </div>
                                <div className="rounded-lg p-2.5"
                                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                                  <p className="text-[9px] font-cinzel uppercase tracking-widest mb-1" style={{ color: "#a78bfa" }}>
                                    ✦ {lang === "es" ? "Cómo Expande el Versículo" : "How It Expands the Verse"}
                                  </p>
                                  <p className="text-xs font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.78)" }}>{w.how_it_expands}</p>
                                </div>
                                {w.part_of_speech && (
                                  <span className="text-[9px] font-cinzel italic" style={{ color: "rgb(var(--ink) / 0.3)" }}>
                                    {w.part_of_speech}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </StudySection>
            )}

            {/* Redemptive Context */}
            {result.redemptive_context && (
              <StudySection label={lang === "es" ? "Contexto Redentor" : "Redemptive Context"} color="#34d399">
                <p className="text-sm font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.75)" }}>
                  {result.redemptive_context}
                </p>
              </StudySection>
            )}

            {/* Theological Insights */}
            {result.theological_insights && (
              <StudySection label={lang === "es" ? "Perspectivas Teológicas" : "Theological Insights"} color="#fbbf24">
                <p className="text-sm font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.75)" }}>
                  {result.theological_insights}
                </p>
              </StudySection>
            )}

            {/* Related passages */}
            {result.related_passages?.length > 0 && (
              <StudySection label={lang === "es" ? "Pasajes Relacionados" : "Related Passages"} color="#60a5fa">
                <div className="flex flex-wrap gap-2">
                  {result.related_passages.map((ref, i) => (
                    <a key={i}
                      href={`/read?book=${encodeURIComponent(ref.split(" ").slice(0,-1).join(" "))}&chapter=${ref.split(" ").pop()?.split(":")[0]}`}
                      className="text-xs font-cinzel px-2.5 py-1 rounded-lg"
                      style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>
                      {ref}
                    </a>
                  ))}
                </div>
              </StudySection>
            )}

            {/* Application */}
            {result.application && (
              <StudySection label={lang === "es" ? "Aplicación Personal" : "Personal Application"} color="#f472b6">
                <p className="text-sm font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.75)" }}>
                  {result.application}
                </p>
              </StudySection>
            )}

            {/* Follow-up Q&A */}
            <div className="rounded-2xl p-4"
              style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
              <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3" style={{ color: "rgb(var(--ink) / 0.3)" }}>
                <MessageCircle className="w-3 h-3 inline mr-1" />
                {lang === "es" ? "Pregunta de Seguimiento" : "Ask a Follow-up"}
              </p>
              <div className="relative">
                <input value={followUp} onChange={e => setFollowUp(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && askFollowUp()}
                  placeholder={lang === "es" ? "Pregunta algo más sobre este pasaje…" : "Ask something more about this passage…"}
                  className="w-full pl-3 pr-12 py-2.5 rounded-xl text-sm font-inter focus:outline-none"
                  style={{ background: "var(--fill-2)", border: "1px solid rgb(var(--ink) / 0.09)", color: "rgb(var(--ink) / 0.8)", fontSize: "16px" }} />
                <button onClick={askFollowUp} disabled={followUpLoading || !followUp.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff", opacity: !followUp.trim() ? 0.4 : 1 }}>
                  {followUpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                </button>
              </div>
              <AnimatePresence>
                {followUpResult && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 rounded-xl"
                    style={{ background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.15)" }}>
                    <p className="text-sm font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.8)" }}>
                      {followUpResult}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="space-y-2">
          <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgb(var(--ink) / 0.25)" }}>
            {lang === "es" ? "Sugerencias" : "Try asking"}
          </p>
          {(lang === "es"
            ? ["Juan 3:16", "El significado de 'logos' en Juan 1:1", "¿Qué es la gracia en griego?", "Romanos 8:28 en contexto"]
            : ["John 3:16", "What does 'logos' mean in John 1:1", "The Hebrew word for 'love' in Psalm 136", "Romans 8:28 in context"]
          ).map(s => (
            <button key={s} onClick={() => { setQuery(s); }}
              className="block w-full text-left px-3 py-2.5 rounded-xl text-xs font-inter transition-all"
              style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.06)", color: "rgb(var(--ink) / 0.5)" }}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StudySection({ label, color = "#00f5ff", children }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
      <p className="text-[9px] font-cinzel uppercase tracking-widest mb-3" style={{ color }}>{label}</p>
      {children}
    </div>
  );
}