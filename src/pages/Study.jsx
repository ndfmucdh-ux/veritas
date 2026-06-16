import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";
import AIStudyPartner from "@/components/study/AIStudyPartner";
import { CommentaryResult, CrossRefsResult, DictionaryResult, TopicalResult } from "@/components/study/StudyResults.jsx";
import StudyTabs from "@/components/study/StudyTabs.jsx";
import StudySearchBar from "@/components/study/StudySearchBar.jsx";
import TopicalTagGrid from "@/components/study/TopicalTagGrid.jsx";

const TABS = ["commentary", "crossRefs", "topical", "dictionary", "aiPartner"];

const TAB_LABELS_EN = { commentary: "Commentary", crossRefs: "Cross-Refs", topical: "Topical", dictionary: "Dictionary", aiPartner: "AI Partner" };
const TAB_LABELS_ES = { commentary: "Comentario", crossRefs: "Referencias", topical: "Temático", dictionary: "Diccionario", aiPartner: "Compañero IA" };

const TOPICAL_TAGS_EN = [
  "faith", "love", "prayer", "hope", "salvation", "grace", "forgiveness",
  "wisdom", "strength", "fear not", "family", "marriage", "money", "healing",
  "Holy Spirit", "Jesus", "eternal life", "worship", "service", "suffering",
];

const TOPICAL_TAGS_ES = [
  "fe", "amor", "oración", "esperanza", "salvación", "gracia", "perdón",
  "sabiduría", "fortaleza", "no temas", "familia", "matrimonio", "dinero", "sanidad",
  "Espíritu Santo", "Jesús", "vida eterna", "adoración", "servicio", "sufrimiento",
];

export default function Study() {
  const { t, lang } = useLang();
  const langInstruction = lang === "es" ? "Respond entirely in Spanish." : "Respond in English.";
  const TOPICAL_TAGS = lang === "es" ? TOPICAL_TAGS_ES : TOPICAL_TAGS_EN;
  const TAB_LABELS = lang === "es" ? TAB_LABELS_ES : TAB_LABELS_EN;
  const STYLE_RULE = lang === "es"
    ? "Regla de estilo importante: en todo tu texto narrativo (reflexiones, comentarios, aplicaciones, oraciones), usa siempre 'Padre' en lugar de 'Dios', y siempre llama a la Biblia 'Sagradas Escrituras' en lugar de 'Biblia'. Excepción: cuando cites o referencíes directamente el texto de un versículo bíblico, conserva la redacción original del versículo sin cambios."
    : "Important style rule: in all your narrative text (reflections, commentary, applications, prayers), always use 'Father' instead of 'God', and always refer to the Bible as 'Sacred Scriptures' instead of 'Bible'. Exception: when quoting or referencing a direct Bible verse text, keep its original wording unchanged.";
  const [tab, setTab] = useState("commentary");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const runInsights = async () => {
    setInsightsLoading(true);
    setInsights(null);
    try {
      const [highlights, notes] = await Promise.all([
        base44.entities.UserHighlight.list("-created_date", 30),
        base44.entities.UserNote.list("-created_date", 20),
      ]);
      const hlRefs = (highlights || []).map(h => h.verse_ref).join(", ");
      const noteTexts = (notes || []).slice(0, 8).map(n => `${n.verse_ref}: "${n.note_text}"`).join("\n");
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${langInstruction} You are a Bible study assistant. A user has highlighted these verses: ${hlRefs || "none"}.
Their personal notes include: ${noteTexts || "none"}.
Based on these, identify 3 recurring spiritual themes and suggest a short devotional topic for each.
Return JSON: { themes: [{ theme, description, suggested_verses: [string], devotional_prompt }] }`,
        response_json_schema: {
          type: "object",
          properties: {
            themes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  theme: { type: "string" },
                  description: { type: "string" },
                  suggested_verses: { type: "array", items: { type: "string" } },
                  devotional_prompt: { type: "string" },
                }
              }
            }
          }
        }
      });
      setInsights(res.themes || []);
    } catch { setInsights([]); }
    finally { setInsightsLoading(false); }
  };

  const runCommentary = async () => {
    if (!query.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${langInstruction} ${STYLE_RULE} You are a Bible scholar. Provide a rich verse-by-verse commentary for: "${query}". Include:
          1. Historical & cultural context
          2. Greek/Hebrew word insights (key words)
          3. Theological significance
          4. Practical application
          Return JSON: { title, context, key_words: [{word, original, meaning}], theology, application, cross_refs: [string] }`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            context: { type: "string" },
            key_words: { type: "array", items: { type: "object", properties: { word: { type: "string" }, original: { type: "string" }, meaning: { type: "string" } } } },
            theology: { type: "string" },
            application: { type: "string" },
            cross_refs: { type: "array", items: { type: "string" } },
          }
        }
      });
      setResult({ type: "commentary", data: res });
    } catch (e) { setResult({ type: "error", msg: e.message }); }
    finally { setLoading(false); }
  };

  const runCrossRefs = async () => {
    if (!query.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${langInstruction} ${STYLE_RULE} List 10 cross-references for the Bible verse or passage: "${query}". For each, give the reference and a one-sentence connection explanation.
          Return JSON: { refs: [{reference, connection, theme}] }`,
        response_json_schema: {
          type: "object",
          properties: { refs: { type: "array", items: { type: "object", properties: { reference: { type: "string" }, connection: { type: "string" }, theme: { type: "string" } } } } }
        }
      });
      setResult({ type: "crossRefs", data: res.refs || [] });
    } catch { setResult({ type: "error" }); }
    finally { setLoading(false); }
  };

  const runTopical = async (tag) => {
    setSelectedTag(tag); setLoading(true); setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${langInstruction} ${STYLE_RULE} List 8 of the best Bible verses about "${tag}". Return JSON: { verses: [{ref, text, insight}] }`,
        response_json_schema: {
          type: "object",
          properties: { verses: { type: "array", items: { type: "object", properties: { ref: { type: "string" }, text: { type: "string" }, insight: { type: "string" } } } } }
        }
      });
      setResult({ type: "topical", tag, data: res.verses || [] });
    } catch { setResult({ type: "error" }); }
    finally { setLoading(false); }
  };

  const runDictionary = async () => {
    if (!query.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${langInstruction} ${STYLE_RULE} Define the biblical/theological term: "${query}". Include etymology, Greek/Hebrew roots, biblical usage, and key verses.
          Return JSON: { term, definition, etymology, greek_hebrew, usage, key_verses: [string] }`,
        response_json_schema: {
          type: "object",
          properties: {
            term: { type: "string" }, definition: { type: "string" },
            etymology: { type: "string" }, greek_hebrew: { type: "string" },
            usage: { type: "string" }, key_verses: { type: "array", items: { type: "string" } },
          }
        }
      });
      setResult({ type: "dictionary", data: res });
    } catch { setResult({ type: "error" }); }
    finally { setLoading(false); }
  };

  const handleSearch = () => {
    if (tab === "commentary") runCommentary();
    else if (tab === "crossRefs") runCrossRefs();
    else if (tab === "dictionary") runDictionary();
  };

  return (
    <div className="md:ml-16 min-h-screen pb-28">
      {/* Hero */}
      <div className="relative h-40 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80" alt="Study" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(8,12,24,0.95))" }} />
        <div className="absolute bottom-0 px-5 pb-4">
          <h1 className="font-cinzel text-2xl font-bold text-white">{t.studyCenter}</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Commentary · Cross-refs · Dictionary · Topical</p>
        </div>
      </div>

      {/* AI Insights Button */}
      <div className="px-4 pt-4">
        <button onClick={runInsights} disabled={insightsLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-cinzel text-sm transition-all"
          style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(0,245,255,0.1))", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
          {insightsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {insightsLoading ? (lang === "es" ? "Analizando tus notas…" : "Analyzing your highlights…") : (lang === "es" ? "✦ Perspectivas IA de mis notas" : "✦ AI Insights from My Highlights")}
        </button>

        <AnimatePresence>
          {insights !== null && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-3 rounded-2xl overflow-hidden"
              style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)" }}>
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "#a78bfa" }}>✦ Personal Devotional Themes</p>
                <button onClick={() => setInsights(null)}><X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} /></button>
              </div>
              {insights.length === 0 ? (
                <p className="px-4 pb-4 text-sm font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {lang === "es" ? "Añade más notas y subrayados para obtener perspectivas." : "Add more highlights and notes to get insights."}
                </p>
              ) : insights.map((item, i) => (
                <div key={i} className="px-4 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <p className="font-cinzel text-sm font-semibold mb-1" style={{ color: "#a78bfa" }}>✦ {item.theme}</p>
                  <p className="text-xs font-inter leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>{item.description}</p>
                  <p className="text-xs font-inter italic mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>💡 {item.devotional_prompt}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(item.suggested_verses || []).map((v, j) => (
                      <a key={j} href={`/study`}
                        className="text-[10px] font-cinzel px-2.5 py-1 rounded-lg"
                        style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>
                        {v}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <StudyTabs
        tabs={TABS}
        labels={TAB_LABELS}
        activeTab={tab}
        onChange={(nextTab) => { setTab(nextTab); setResult(null); }}
      />

      <div className="px-4 space-y-4">
        {/* AI Study Partner tab */}
        {tab === "aiPartner" && <AIStudyPartner />}

        {/* Search bar (not for topical or aiPartner) */}
        {tab !== "topical" && tab !== "aiPartner" && (
          <StudySearchBar
            query={query}
            onQueryChange={setQuery}
            onSearch={handleSearch}
            loading={loading}
            placeholder={
              tab === "commentary"
                ? (lang === "es" ? "ej. Juan 3:16 o Romanos 8:28" : "e.g. John 3:16 or Romans 8:28")
                : tab === "crossRefs"
                ? (lang === "es" ? "ej. Salmos 23:1" : "e.g. Psalm 23:1")
                : (lang === "es" ? "ej. gracia, expiación, santificación" : "e.g. grace, atonement, sanctification")
            }
          />
        )}

        {/* Topical tag grid */}
        {tab !== "aiPartner" && tab === "topical" && (
          <TopicalTagGrid
            tags={TOPICAL_TAGS}
            selectedTag={selectedTag}
            loading={loading}
            onSelect={runTopical}
            title={lang === "es" ? "Elige un Tema" : "Choose a Topic"}
          />
        )}

        {/* Loading (not aiPartner — it handles its own) */}
        {tab !== "aiPartner" && loading && (
          <div className="flex items-center gap-3 py-8 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00f5ff" }} />
            <p className="text-sm font-cinzel" style={{ color: "rgba(255,255,255,0.4)" }}>{lang === "es" ? "Buscando en las Escrituras…" : "Searching scripture…"}</p>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {tab !== "aiPartner" && result && !loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pb-4">
              {result.type === "commentary" && <CommentaryResult data={result.data} />}
              {result.type === "crossRefs" && <CrossRefsResult data={result.data} />}
              {result.type === "topical" && <TopicalResult tag={result.tag} data={result.data} />}
              {result.type === "dictionary" && <DictionaryResult data={result.data} />}
              {result.type === "error" && <p className="text-sm text-red-400 text-center py-4">{lang === "es" ? "Algo salió mal. Inténtalo de nuevo." : "Something went wrong. Try again."}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}