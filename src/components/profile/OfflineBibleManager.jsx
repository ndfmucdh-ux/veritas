import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Trash2, Check, Loader2, WifiOff, ChevronDown, ChevronUp, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  isTranslationDownloadedAsync,
  saveTranslationAsync,
  removeTranslationAsync,
  getTranslationMetaAsync,
} from "@/lib/offlineBible";

// Full list of downloadable translations via YouVersion / Scripture API
// BTX3 is hardcoded as a featured/pinned translation
const OFFLINE_TRANSLATIONS = [
  // ★ Featured / hardcoded
  { code: "BTX3",    name: "Biblia Textual",               lang: "es", flag: "🇪🇸", featured: true },
  // English
  { code: "KJV",     name: "King James Version",           lang: "en", flag: "🇬🇧" },
  { code: "NKJV",    name: "New King James Version",       lang: "en", flag: "🇬🇧" },
  { code: "NIV",     name: "New International Version",    lang: "en", flag: "🇬🇧" },
  { code: "ESV",     name: "English Standard Version",     lang: "en", flag: "🇬🇧" },
  { code: "NLT",     name: "New Living Translation",       lang: "en", flag: "🇬🇧" },
  { code: "NASB",    name: "New American Standard Bible",  lang: "en", flag: "🇬🇧" },
  { code: "AMP",     name: "Amplified Bible",              lang: "en", flag: "🇬🇧" },
  { code: "CSB",     name: "Christian Standard Bible",     lang: "en", flag: "🇬🇧" },
  { code: "MSG",     name: "The Message",                  lang: "en", flag: "🇬🇧" },
  { code: "NRSV",    name: "New Revised Standard Version", lang: "en", flag: "🇬🇧" },
  { code: "ASV",     name: "American Standard Version",    lang: "en", flag: "🇬🇧" },
  { code: "WEB",     name: "World English Bible",          lang: "en", flag: "🇬🇧" },
  { code: "BSB",     name: "Berean Standard Bible",        lang: "en", flag: "🇬🇧" },
  { code: "YLT",     name: "Young's Literal Translation",  lang: "en", flag: "🇬🇧" },
  { code: "ERV",     name: "English Revised Version",      lang: "en", flag: "🇬🇧" },
  { code: "GNV",     name: "Geneva Bible",                 lang: "en", flag: "🇬🇧" },
  { code: "AKJV",    name: "American King James Version",  lang: "en", flag: "🇬🇧" },
  { code: "HCSB",    name: "Holman CSB",                   lang: "en", flag: "🇬🇧" },
  { code: "ICB",     name: "International Children's Bible",lang: "en", flag: "🇬🇧" },
  { code: "DARBY",   name: "Darby Translation",            lang: "en", flag: "🇬🇧" },
  { code: "WNT",     name: "Weymouth New Testament",       lang: "en", flag: "🇬🇧" },
  { code: "RV",      name: "Revised Version",              lang: "en", flag: "🇬🇧" },
  { code: "EBR",     name: "Emphasised Bible",             lang: "en", flag: "🇬🇧" },
  { code: "MOUNCE",  name: "Mounce Reverse Interlinear",   lang: "en", flag: "🇬🇧" },
  { code: "DRA",     name: "Douay-Rheims American",        lang: "en", flag: "🇬🇧" },
  { code: "WYC",     name: "Wycliffe Bible",               lang: "en", flag: "🇬🇧" },
  { code: "WILLIAMS",name: "Williams New Testament",       lang: "en", flag: "🇬🇧" },
  { code: "NAB",     name: "New American Bible",           lang: "en", flag: "🇬🇧" },
  { code: "NCV",     name: "New Century Version",          lang: "en", flag: "🇬🇧" },
  { code: "NIRV",    name: "NIrV Bible",                   lang: "en", flag: "🇬🇧" },
  { code: "ISV",     name: "International Standard Version",lang: "en", flag: "🇬🇧" },
  { code: "TLB",     name: "The Living Bible",             lang: "en", flag: "🇬🇧" },
  { code: "NASB1995",name: "NASB 1995",                    lang: "en", flag: "🇬🇧" },
  { code: "NASB2020",name: "NASB 2020",                    lang: "en", flag: "🇬🇧" },
  { code: "HCSB2",   name: "Holman CSB 2009",              lang: "en", flag: "🇬🇧" },
  { code: "MEV",     name: "Modern English Version",       lang: "en", flag: "🇬🇧" },
  { code: "TPT",     name: "The Passion Translation",      lang: "en", flag: "🇬🇧" },
  { code: "CEV",     name: "Contemporary English Version", lang: "en", flag: "🇬🇧" },
  { code: "GNT",     name: "Good News Translation",        lang: "en", flag: "🇬🇧" },
  { code: "VOICE",   name: "The Voice",                    lang: "en", flag: "🇬🇧" },
  { code: "JUB",     name: "Jubilee Bible",                lang: "en", flag: "🇬🇧" },
  { code: "NETBM",   name: "NET Bible with Notes",         lang: "en", flag: "🇬🇧" },
  { code: "ABP",     name: "Apostolic Bible Polyglot",     lang: "en", flag: "🇬🇧" },
  // Spanish
  { code: "RVR1960", name: "Reina-Valera 1960",            lang: "es", flag: "🇪🇸" },
  { code: "NVI",     name: "Nueva Versión Internacional",  lang: "es", flag: "🇪🇸" },
  { code: "LBLA",    name: "Biblia de las Américas",       lang: "es", flag: "🇪🇸" },
  { code: "TLA",     name: "Traducción en Lenguaje Actual",lang: "es", flag: "🇪🇸" },
  { code: "DHH",     name: "Dios Habla Hoy",               lang: "es", flag: "🇪🇸" },
  { code: "NTV",     name: "Nueva Traducción Viviente",    lang: "es", flag: "🇪🇸" },
  { code: "BLS",     name: "Biblia en Lenguaje Sencillo",  lang: "es", flag: "🇪🇸" },
  { code: "PDT",     name: "Palabra de Dios para Ti",      lang: "es", flag: "🇪🇸" },
  { code: "PDDPT",   name: "Palabra de Dios para Todos",   lang: "es", flag: "🇪🇸" },
  { code: "RVA",     name: "Reina Valera Actualizada",     lang: "es", flag: "🇪🇸" },
  { code: "RV60",    name: "Reina Valera 60 Comentada",    lang: "es", flag: "🇪🇸" },
  { code: "VIN",     name: "Versión en Lenguaje Vivo",     lang: "es", flag: "🇪🇸" },
  { code: "NVIC",    name: "NVI Castellana",               lang: "es", flag: "🇪🇸" },
  { code: "LBLA88",  name: "LBLA 1988",                    lang: "es", flag: "🇪🇸" },
  // Portuguese
  { code: "ARA",     name: "Almeida Revisada Atualizada",  lang: "pt", flag: "🇧🇷" },
  { code: "ARC",     name: "Almeida Revisada Clássica",    lang: "pt", flag: "🇧🇷" },
  { code: "NVT",     name: "Nova Versão Transformadora",   lang: "pt", flag: "🇧🇷" },
  { code: "BPT",     name: "Bíblia Português",             lang: "pt", flag: "🇧🇷" },
  { code: "BRA",     name: "Almeida Corrigida Fiel",       lang: "pt", flag: "🇧🇷" },
  // French
  { code: "LSG",     name: "Louis Segond 1910",            lang: "fr", flag: "🇫🇷" },
  { code: "NEG1979", name: "Nouvelle Edition Genève 1979", lang: "fr", flag: "🇫🇷" },
  { code: "BDS",     name: "Bible du Semeur",              lang: "fr", flag: "🇫🇷" },
  { code: "SG21",    name: "Segond 21",                    lang: "fr", flag: "🇫🇷" },
  { code: "FC97",    name: "Français Courant 1997",        lang: "fr", flag: "🇫🇷" },
  { code: "PdV",     name: "Parole de Vie",                lang: "fr", flag: "🇫🇷" },
  // Italian
  { code: "DIOD",    name: "Bibbia Diodati",               lang: "it", flag: "🇮🇹" },
  { code: "NRV",     name: "Nuova Riveduta 2006",          lang: "it", flag: "🇮🇹" },
  { code: "CEI",     name: "CEI Conferenza Episcopale",    lang: "it", flag: "🇮🇹" },
  { code: "NBDC",    name: "Nuova Bibbia dei Commentari",  lang: "it", flag: "🇮🇹" },
  // German
  { code: "LUT",     name: "Lutherbibel 2017",             lang: "de", flag: "🇩🇪" },
  { code: "ELB",     name: "Elberfelder Bibel",            lang: "de", flag: "🇩🇪" },
];

const LANG_GROUPS = [
  { lang: "featured", label: "⭐ Featured" },
  { lang: "en",       label: "🇬🇧 English" },
  { lang: "es",       label: "🇪🇸 Español" },
  { lang: "pt",       label: "🇧🇷 Português" },
  { lang: "fr",       label: "🇫🇷 Français" },
  { lang: "it",       label: "🇮🇹 Italiano" },
  { lang: "de",       label: "🇩🇪 Deutsch" },
];

export default function OfflineBibleManager() {
  const [statuses, setStatuses] = useState({});
  const [messages, setMessages] = useState({});
  const [metas, setMetas]       = useState({});
  const [expanded, setExpanded] = useState(false);
  const [activeGroup, setActiveGroup] = useState("featured");
  const inFlight = useState(new Set())[0];

  useEffect(() => {
    async function loadStatuses() {
      const newStatuses = {};
      const newMetas = {};
      await Promise.all(
        OFFLINE_TRANSLATIONS.map(async (t) => {
          const downloaded = await isTranslationDownloadedAsync(t.code);
          newStatuses[t.code] = downloaded ? "done" : "idle";
          if (downloaded) {
            newMetas[t.code] = await getTranslationMetaAsync(t.code);
          }
        })
      );
      setStatuses(newStatuses);
      setMetas(newMetas);
    }
    loadStatuses();
  }, []);

  const download = async (code) => {
    if (inFlight.has(code)) return;
    inFlight.add(code);

    setStatuses(s => ({ ...s, [code]: "downloading" }));
    setMessages(m => ({ ...m, [code]: "Connecting to YouVersion…" }));

    try {
      const res = await base44.functions.invoke("downloadBibleVersionOffline", { translation: code });
      const payload = res?.data;

      if (payload?.data && payload.totalChapters > 0) {
        setMessages(m => ({ ...m, [code]: `Saving ${payload.totalChapters} chapters…` }));
        const saved = await saveTranslationAsync(code, payload);
        if (saved) {
          const meta = await getTranslationMetaAsync(code);
          setStatuses(s => ({ ...s, [code]: "done" }));
          setMetas(m2 => ({ ...m2, [code]: meta }));
          setMessages(m => ({ ...m, [code]: "" }));
        } else {
          setStatuses(s => ({ ...s, [code]: "error" }));
          setMessages(m => ({ ...m, [code]: "Storage full. Free space and retry." }));
        }
      } else {
        setStatuses(s => ({ ...s, [code]: "error" }));
        setMessages(m => ({ ...m, [code]: payload?.error || "Download failed. Try again." }));
      }
    } catch (err) {
      setStatuses(s => ({ ...s, [code]: "error" }));
      const msg = err?.response?.status === 429
        ? "Rate limited. Wait a moment and retry."
        : "Download failed. Try again.";
      setMessages(m => ({ ...m, [code]: msg }));
    } finally {
      inFlight.delete(code);
    }
  };

  const remove = async (code) => {
    await removeTranslationAsync(code);
    setStatuses(s => ({ ...s, [code]: "idle" }));
    setMetas(m => { const n = { ...m }; delete n[code]; return n; });
  };

  const downloadedCount = Object.values(statuses).filter(s => s === "done").length;

  const getGroupItems = (groupLang) => {
    if (groupLang === "featured") return OFFLINE_TRANSLATIONS.filter(t => t.featured);
    return OFFLINE_TRANSLATIONS.filter(t => t.lang === groupLang && !t.featured);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.12)" }}>
      {/* Header */}
      <button onClick={() => setExpanded(v => !v)} className="w-full flex items-center gap-3 px-4 py-3.5">
        <WifiOff className="w-4 h-4 flex-shrink-0" style={{ color: "#00f5ff" }} />
        <div className="flex-1 text-left">
          <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.8)" }}>Offline Bible Library</p>
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {downloadedCount > 0 ? `${downloadedCount} translation${downloadedCount > 1 ? "s" : ""} saved · Read anywhere` : "Download YouVersion translations for offline"}
          </p>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {/* Language group tabs */}
              <div className="flex gap-1.5 px-4 pt-3 pb-2 overflow-x-auto scrollbar-hide">
                {LANG_GROUPS.filter(g => g.lang === "featured" || getGroupItems(g.lang).length > 0).map(g => (
                  <button key={g.lang} onClick={() => setActiveGroup(g.lang)}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-cinzel font-semibold whitespace-nowrap transition-all flex-shrink-0"
                    style={{
                      background: activeGroup === g.lang ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)",
                      color: activeGroup === g.lang ? "#fbbf24" : "rgba(255,255,255,0.35)",
                      border: activeGroup === g.lang ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    }}>
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Translation list */}
              <div className="px-4 pb-4 space-y-2">
                {getGroupItems(activeGroup).map(t => (
                  <TranslationRow
                    key={t.code}
                    translation={t}
                    status={statuses[t.code] || "idle"}
                    message={messages[t.code]}
                    meta={metas[t.code]}
                    onDownload={() => download(t.code)}
                    onRemove={() => remove(t.code)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TranslationRow({ translation, status, message, meta, onDownload, onRemove }) {
  const isDone = status === "done";
  const isDownloading = status === "downloading";
  const isError = status === "error";

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5"
      style={{
        background: translation.featured
          ? "rgba(251,191,36,0.06)"
          : isDone ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.03)",
        border: translation.featured
          ? "1px solid rgba(251,191,36,0.2)"
          : isDone ? "1px solid rgba(52,211,153,0.15)" : "1px solid rgba(255,255,255,0.06)"
      }}>
      <span className="text-base flex-shrink-0">{translation.flag}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-cinzel font-semibold truncate"
            style={{ color: translation.featured ? "#fbbf24" : isDone ? "#34d399" : "rgba(255,255,255,0.75)" }}>
            {translation.code} · {translation.name}
          </p>
          {translation.featured && <Star className="w-2.5 h-2.5 flex-shrink-0" style={{ color: "#fbbf24" }} fill="#fbbf24" />}
        </div>
        {isDownloading && message && (
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "#00f5ff" }}>{message}</p>
        )}
        {isDone && meta && (
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            {meta.totalChapters} chapters · {new Date(meta.downloadedAt).toLocaleDateString()}
          </p>
        )}
        {isError && message && (
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "#f87171" }}>{message}</p>
        )}
      </div>

      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: "#00f5ff" }} />
      ) : isDone ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Check className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
          <button onClick={onRemove} className="p-1 rounded-lg hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5" style={{ color: "rgba(248,113,113,0.6)" }} />
          </button>
        </div>
      ) : (
        <button onClick={onDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-cinzel font-semibold transition-colors flex-shrink-0"
          style={{
            background: isError ? "rgba(248,113,113,0.1)" : "rgba(0,245,255,0.1)",
            color: isError ? "#f87171" : "#00f5ff",
            border: isError ? "1px solid rgba(248,113,113,0.2)" : "1px solid rgba(0,245,255,0.2)"
          }}>
          <Download className="w-3 h-3" />
          {isError ? "Retry" : "Save"}
        </button>
      )}
    </div>
  );
}