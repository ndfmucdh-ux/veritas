import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Trash2, Check, Loader2, WifiOff, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  DOWNLOADABLE_TRANSLATIONS,
  isTranslationDownloaded,
  saveTranslation,
  removeTranslation,
  getTranslationMeta,
} from "@/lib/offlineBible";

export default function OfflineBibleManager() {
  const [statuses, setStatuses] = useState({});       // code → "idle"|"downloading"|"done"|"error"
  const [progress, setProgress] = useState({});       // code → message string
  const [metas, setMetas] = useState({});             // code → meta info
  const [expanded, setExpanded] = useState(false);
  const [downloadingSet] = useState(new Set());       // track in-flight requests to prevent duplicates

  useEffect(() => {
    const initial = {};
    const m = {};
    DOWNLOADABLE_TRANSLATIONS.forEach(t => {
      initial[t.code] = isTranslationDownloaded(t.code) ? "done" : "idle";
      if (isTranslationDownloaded(t.code)) {
        m[t.code] = getTranslationMeta(t.code);
      }
    });
    setStatuses(initial);
    setMetas(m);
  }, []);

  const download = async (code) => {
    // Prevent duplicate downloads if one is already in-flight
    if (downloadingSet.has(code)) return;
    downloadingSet.add(code);

    try {
      setStatuses(s => ({ ...s, [code]: "downloading" }));
      setProgress(p => ({ ...p, [code]: "Connecting to server…" }));

      const t = DOWNLOADABLE_TRANSLATIONS.find(t => t.code === code);
      setProgress(p => ({ ...p, [code]: `Downloading ${t.name}…` }));

      const res = await base44.functions.invoke("downloadTranslation", { translation: code, pack: "quick" });

      if (res.data?.data) {
        const saved = saveTranslation(code, res.data);
        if (saved) {
          setStatuses(s => ({ ...s, [code]: "done" }));
          setMetas(m => ({ ...m, [code]: getTranslationMeta(code) }));
          setProgress(p => ({ ...p, [code]: "" }));
        } else {
          setStatuses(s => ({ ...s, [code]: "error" }));
          setProgress(p => ({ ...p, [code]: "Storage full — free up space and retry." }));
        }
      } else {
        setStatuses(s => ({ ...s, [code]: "error" }));
        setProgress(p => ({ ...p, [code]: res.data?.error || "Download failed. Try again." }));
      }
    } catch (err) {
      setStatuses(s => ({ ...s, [code]: "error" }));
      const msg = err?.response?.status === 429 ? "Too many downloads. Please wait and try again." : "Download failed. Try again.";
      setProgress(p => ({ ...p, [code]: msg }));
    } finally {
      downloadingSet.delete(code);
    }
  };

  const remove = (code) => {
    removeTranslation(code);
    setStatuses(s => ({ ...s, [code]: "idle" }));
    setMetas(m => { const n = { ...m }; delete n[code]; return n; });
  };

  const enTranslations = DOWNLOADABLE_TRANSLATIONS.filter(t => t.lang === "en");
  const esTranslations = DOWNLOADABLE_TRANSLATIONS.filter(t => t.lang === "es");
  const downloadedCount = Object.values(statuses).filter(s => s === "done").length;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.12)" }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5"
      >
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
                Downloads the most-read books (Psalms, Proverbs, John, Matthew, Romans + more) for seamless offline reading.
              </p>

              {/* English */}
              <div>
                <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.2)" }}>🇺🇸 English</p>
                <div className="space-y-2">
                  {enTranslations.map(t => (
                    <TranslationRow
                      key={t.code}
                      translation={t}
                      status={statuses[t.code] || "idle"}
                      progressMsg={progress[t.code]}
                      meta={metas[t.code]}
                      onDownload={() => download(t.code)}
                      onRemove={() => remove(t.code)}
                    />
                  ))}
                </div>
              </div>

              {/* Spanish */}
              <div>
                <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.2)" }}>🇲🇽 Español</p>
                <div className="space-y-2">
                  {esTranslations.map(t => (
                    <TranslationRow
                      key={t.code}
                      translation={t}
                      status={statuses[t.code] || "idle"}
                      progressMsg={progress[t.code]}
                      meta={metas[t.code]}
                      onDownload={() => download(t.code)}
                      onRemove={() => remove(t.code)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TranslationRow({ translation, status, progressMsg, meta, onDownload, onRemove }) {
  const isDone = status === "done";
  const isDownloading = status === "downloading";
  const isError = status === "error";

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5"
      style={{ background: isDone ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.03)", border: isDone ? "1px solid rgba(52,211,153,0.15)" : "1px solid rgba(255,255,255,0.06)" }}>
      <span className="text-base">{translation.flag}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-cinzel font-semibold" style={{ color: isDone ? "#34d399" : "rgba(255,255,255,0.75)" }}>
          {translation.code} · {translation.name}
        </p>
        {isDownloading && progressMsg && (
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "#00f5ff" }}>{progressMsg}</p>
        )}
        {isDone && meta && (
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            {meta.totalChapters} chapters · Saved {new Date(meta.downloadedAt).toLocaleDateString()}
          </p>
        )}
        {isError && progressMsg && (
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "#f87171" }}>{progressMsg}</p>
        )}
      </div>

      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: "#00f5ff" }} />
      ) : isDone ? (
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
          <button onClick={onRemove} className="p-1 rounded-lg transition-colors hover:bg-red-500/10">
            <Trash2 className="w-3.5 h-3.5" style={{ color: "rgba(248,113,113,0.6)" }} />
          </button>
        </div>
      ) : (
        <button onClick={onDownload}
          disabled={isError}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-cinzel font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: isError ? "rgba(248,113,113,0.1)" : "rgba(0,245,255,0.1)", color: isError ? "#f87171" : "#00f5ff", border: isError ? "1px solid rgba(248,113,113,0.2)" : "1px solid rgba(0,245,255,0.2)" }}>
          <Download className="w-3 h-3" />
          {isError ? "Retry" : "Save"}
        </button>
      )}
    </div>
  );
}