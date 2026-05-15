import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Trash2, Check, Loader2, WifiOff, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  isTranslationDownloadedAsync,
  saveTranslationAsync,
  removeTranslationAsync,
  getTranslationMetaAsync,
} from "@/lib/offlineBible";

// Only translations with confirmed working IDs in Scripture API + bolls.life
const OFFLINE_TRANSLATIONS = [
  // English
  { code: "KJV",    name: "King James Version",           lang: "en", flag: "🇬🇧" },
  { code: "NKJV",   name: "New King James Version",       lang: "en", flag: "🇬🇧" },
  { code: "NIV",    name: "New International Version",    lang: "en", flag: "🇬🇧" },
  { code: "ESV",    name: "English Standard Version",     lang: "en", flag: "🇬🇧" },
  { code: "NLT",    name: "New Living Translation",       lang: "en", flag: "🇬🇧" },
  { code: "NASB",   name: "New American Standard Bible",  lang: "en", flag: "🇬🇧" },
  { code: "AMP",    name: "Amplified Bible",              lang: "en", flag: "🇬🇧" },
  { code: "ASV",    name: "American Standard Version",    lang: "en", flag: "🇬🇧" },
  { code: "WEB",    name: "World English Bible",          lang: "en", flag: "🇬🇧" },
  { code: "BSB",    name: "Berean Standard Bible",        lang: "en", flag: "🇬🇧" },
  { code: "YLT",    name: "Young's Literal Translation",  lang: "en", flag: "🇬🇧" },
  { code: "DARBY",  name: "Darby Translation",            lang: "en", flag: "🇬🇧" },
  { code: "ERV",    name: "English Revised Version",      lang: "en", flag: "🇬🇧" },
  { code: "DRA",    name: "Douay-Rheims American",        lang: "en", flag: "🇬🇧" },
  { code: "MSG",    name: "The Message",                  lang: "en", flag: "🇬🇧" },
  { code: "ISV",    name: "International Standard Version", lang: "en", flag: "🇬🇧" },
  // Spanish
  { code: "RVR1960", name: "Reina-Valera 1960",           lang: "es", flag: "🇪🇸" },
  { code: "NVI",    name: "Nueva Versión Internacional",  lang: "es", flag: "🇪🇸" },
  { code: "LBLA",   name: "Biblia de las Américas",       lang: "es", flag: "🇪🇸" },
  { code: "NTV",    name: "Nueva Traducción Viviente",    lang: "es", flag: "🇪🇸" },
  { code: "TLA",    name: "Traducción en Lenguaje Actual",lang: "es", flag: "🇪🇸" },
  { code: "DHH",    name: "Dios Habla Hoy",               lang: "es", flag: "🇪🇸" },
  { code: "RVA",    name: "Reina Valera Actualizada",     lang: "es", flag: "🇪🇸" },
  // Portuguese
  { code: "ARA",    name: "Almeida Revisada Atualizada",  lang: "pt", flag: "🇧🇷" },
  { code: "ARC",    name: "Almeida Revisada Clássica",    lang: "pt", flag: "🇧🇷" },
  // French
  { code: "LSG",    name: "Louis Segond 1910",            lang: "fr", flag: "🇫🇷" },
  { code: "NEG1979",name: "Nouvelle Edition Genève 1979", lang: "fr", flag: "🇫🇷" },
  { code: "BDS",    name: "Bible du Semeur",              lang: "fr", flag: "🇫🇷" },
  // Italian
  { code: "DIOD",   name: "Bibbia Diodati",               lang: "it", flag: "🇮🇹" },
  { code: "NRV",    name: "Nuova Riveduta 2006",          lang: "it", flag: "🇮🇹" },
  // German
  { code: "LUT",    name: "Lutherbibel 2017",             lang: "de", flag: "🇩🇪" },
  { code: "ELB",    name: "Elberfelder Bibel",            lang: "de", flag: "🇩🇪" },
];

const LANG_GROUPS = [
  { lang: "en", label: "🇬🇧 English" },
  { lang: "es", label: "🇪🇸 Español" },
  { lang: "pt", label: "🇧🇷 Português" },
  { lang: "fr", label: "🇫🇷 Français" },
  { lang: "it", label: "🇮🇹 Italiano" },
  { lang: "de", label: "🇩🇪 Deutsch" },
];

export default function OfflineBibleManager() {
  const [statuses, setStatuses] = useState({});   // code → "idle"|"downloading"|"done"|"error"
  const [messages, setMessages] = useState({});   // code → string
  const [metas, setMetas]       = useState({});   // code → meta
  const [expanded, setExpanded] = useState(false);
  const [inFlight] = useState(new Set());

  // Load statuses from IndexedDB on mount (reliable, not mem-cache dependent)
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
    setMessages(m => ({ ...m, [code]: "Fetching from Scripture API…" }));

    try {
      const res = await base44.functions.invoke("downloadBibleVersionOffline", { translation: code });
      const payload = res?.data;

      if (payload?.data && payload.totalChapters > 0) {
        setMessages(m => ({ ...m, [code]: "Saving to device…" }));
        const saved = await saveTranslationAsync(code, payload);
        if (saved) {
          setStatuses(s => ({ ...s, [code]: "done" }));
          const meta = await getTranslationMetaAsync(code);
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
        ? "Too many requests. Wait a moment and retry."
        : err?.message?.includes("Quota")
          ? "Storage full. Clear cache and retry."
          : "Download failed. Try again.";
      setMessages(m => ({ ...m, [code]: msg }));
    } finally {
      inFlight.delete(code);
    }
  };

  const remove = async (code) => {
    await removeTranslationAsync(code);
    // Also clear mem cache
    setStatuses(s => ({ ...s, [code]: "idle" }));
    setMetas(m => { const n = { ...m }; delete n[code]; return n; });
  };

  const downloadedCount = Object.values(statuses).filter(s => s === "done").length;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.12)" }}>
      {/* Header */}
      <button onClick={() => setExpanded(v => !v)} className="w-full flex items-center gap-3 px-4 py-3.5">
        <WifiOff className="w-4 h-4 flex-shrink-0" style={{ color: "#00f5ff" }} />
        <div className="flex-1 text-left">
          <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.8)" }}>Offline Bible Library</p>
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {downloadedCount > 0 ? `${downloadedCount} translation${downloadedCount > 1 ? "s" : ""} saved · Read anywhere` : "Download translations to read offline"}
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />}
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
            <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] font-inter pt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                Downloads key books (Psalms, Proverbs, John, Matthew, Romans + more) via Scripture API for seamless offline reading.
              </p>

              {LANG_GROUPS.map(group => {
                const list = OFFLINE_TRANSLATIONS.filter(t => t.lang === group.lang);
                if (!list.length) return null;
                return (
                  <div key={group.lang}>
                    <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.2)" }}>{group.label}</p>
                    <div className="space-y-2">
                      {list.map(t => (
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
                );
              })}
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
        background: isDone ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.03)",
        border: isDone ? "1px solid rgba(52,211,153,0.15)" : "1px solid rgba(255,255,255,0.06)"
      }}>
      <span className="text-base flex-shrink-0">{translation.flag}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-cinzel font-semibold truncate" style={{ color: isDone ? "#34d399" : "rgba(255,255,255,0.75)" }}>
          {translation.code} · {translation.name}
        </p>
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