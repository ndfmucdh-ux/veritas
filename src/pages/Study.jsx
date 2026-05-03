import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Tag, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";

const TABS = ["commentary", "crossRefs", "topical", "dictionary"];

const TAB_LABELS_EN = { commentary: "Commentary", crossRefs: "Cross-Refs", topical: "Topical", dictionary: "Dictionary" };
const TAB_LABELS_ES = { commentary: "Comentario", crossRefs: "Referencias", topical: "Temático", dictionary: "Diccionario" };

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
  const [tab, setTab] = useState("commentary");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);

  const runCommentary = async () => {
    if (!query.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${langInstruction} You are a Bible scholar. Provide a rich verse-by-verse commentary for: "${query}". Include:
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
        prompt: `${langInstruction} List 10 cross-references for the Bible verse or passage: "${query}". For each, give the reference and a one-sentence connection explanation.
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
        prompt: `${langInstruction} List 8 of the best Bible verses about "${tag}". Return JSON: { verses: [{ref, text, insight}] }`,
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
        prompt: `${langInstruction} Define the biblical/theological term: "${query}". Include etymology, Greek/Hebrew roots, biblical usage, and key verses.
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

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
        {TABS.map(tb => (
          <button key={tb} onClick={() => { setTab(tb); setResult(null); }}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-cinzel uppercase tracking-wide transition-all"
            style={{
              background: tab === tb ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.04)",
              color: tab === tb ? "#00f5ff" : "rgba(255,255,255,0.4)",
              border: tab === tb ? "1px solid rgba(0,245,255,0.28)" : "1px solid rgba(255,255,255,0.06)",
            }}>
            {TAB_LABELS[tb]}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-4">
        {/* Search bar (not for topical) */}
        {tab !== "topical" && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder={
                tab === "commentary"
                  ? (lang === "es" ? "ej. Juan 3:16 o Romanos 8:28" : "e.g. John 3:16 or Romans 8:28")
                  : tab === "crossRefs"
                  ? (lang === "es" ? "ej. Salmos 23:1" : "e.g. Psalm 23:1")
                  : (lang === "es" ? "ej. gracia, expiación, santificación" : "e.g. grace, atonement, sanctification")
              }
              className="w-full pl-10 pr-12 py-3.5 rounded-xl text-sm font-inter focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)" }}
            />
            <button onClick={handleSearch} disabled={loading || !query.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-cinzel transition-colors disabled:opacity-40"
              style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff" }}>
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Go"}
            </button>
          </div>
        )}

        {/* Topical tag grid */}
        {tab === "topical" && (
          <div>
            <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>{lang === "es" ? "Elige un Tema" : "Choose a Topic"}</p>
            <div className="flex flex-wrap gap-2">
              {TOPICAL_TAGS.map(tag => (
                <button key={tag} onClick={() => runTopical(tag)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-inter capitalize transition-all"
                  style={{
                    background: selectedTag === tag ? "rgba(167,139,250,0.18)" : "rgba(255,255,255,0.05)",
                    color: selectedTag === tag ? "#a78bfa" : "rgba(255,255,255,0.55)",
                    border: selectedTag === tag ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.07)",
                  }}>
                  <Tag className="w-2.5 h-2.5" /> {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 py-8 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00f5ff" }} />
            <p className="text-sm font-cinzel" style={{ color: "rgba(255,255,255,0.4)" }}>{lang === "es" ? "Buscando en las Escrituras…" : "Searching scripture…"}</p>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
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

function Section({ label, color = "#00f5ff", children }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3" style={{ color }}>{label}</p>
      {children}
    </div>
  );
}

function CommentaryResult({ data }) {
  return (
    <>
      <Section label="Historical Context" color="#fbbf24">
        <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{data.context}</p>
      </Section>
      {data.key_words?.length > 0 && (
        <Section label="Greek / Hebrew Words" color="#a78bfa">
          <div className="space-y-2">
            {data.key_words.map((w, i) => (
              <div key={i} className="flex gap-3">
                <span className="font-cinzel text-sm font-bold text-white/80">{w.word}</span>
                <span className="text-xs font-inter italic" style={{ color: "#a78bfa" }}>{w.original}</span>
                <span className="text-xs font-inter flex-1" style={{ color: "rgba(255,255,255,0.55)" }}>{w.meaning}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
      <Section label="Theological Significance" color="#34d399">
        <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{data.theology}</p>
      </Section>
      <Section label="Application" color="#00f5ff">
        <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{data.application}</p>
      </Section>
      {data.cross_refs?.length > 0 && (
        <Section label="See Also">
          <div className="flex flex-wrap gap-2">
            {data.cross_refs.map((ref, i) => (
              <a key={i} href={`/study`} className="text-xs px-2.5 py-1 rounded-lg font-cinzel"
                style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff" }}>{ref}</a>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

function CrossRefsResult({ data }) {
  return (
    <Section label="Cross References" color="#fbbf24">
      <div className="space-y-3">
        {data.map((r, i) => (
          <div key={i} className="flex gap-3">
            <a href={`/read?book=${r.reference?.split(" ").slice(0,-1).join(" ")}&chapter=${r.reference?.split(" ").pop()?.split(":")[0]}`}
              className="font-cinzel text-xs font-semibold flex-shrink-0 pt-0.5" style={{ color: "#fbbf24" }}>
              {r.reference}
            </a>
            <div>
              <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.7)" }}>{r.connection}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>{r.theme}</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TopicalResult({ tag, data }) {
  return (
    <Section label={`Verses on "${tag}"`} color="#a78bfa">
      <div className="space-y-4">
        {data.map((v, i) => (
          <div key={i}>
            <p className="font-playfair italic text-sm leading-relaxed mb-1.5" style={{ color: "rgba(255,255,255,0.82)" }}>"{v.text}"</p>
            <p className="font-cinzel text-xs font-bold mb-1" style={{ color: "#fbbf24" }}>{v.ref}</p>
            <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.45)" }}>{v.insight}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function DictionaryResult({ data }) {
  return (
    <>
      <Section label={`Definition: ${data.term}`} color="#fbbf24">
        <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>{data.definition}</p>
      </Section>
      {data.greek_hebrew && (
        <Section label="Greek / Hebrew" color="#a78bfa">
          <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.7)" }}>{data.greek_hebrew}</p>
          {data.etymology && <p className="text-xs mt-2 font-inter italic" style={{ color: "rgba(255,255,255,0.45)" }}>{data.etymology}</p>}
        </Section>
      )}
      <Section label="Biblical Usage" color="#34d399">
        <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{data.usage}</p>
      </Section>
      {data.key_verses?.length > 0 && (
        <Section label="Key Verses">
          <div className="flex flex-wrap gap-2">
            {data.key_verses.map((v, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-cinzel" style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff" }}>{v}</span>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}