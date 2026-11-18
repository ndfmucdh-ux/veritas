/**
 * ReadingPlanCacheSettings
 * Allows users to download their active reading plan chapters for offline use.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Trash2, Check, Loader2, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getOfflineVerse, saveTranslation, removeTranslation, isTranslationDownloaded, getTranslationMeta } from "@/lib/offlineBible";

// Key chapters from common devotional plans
const QUICK_CHAPTERS = [
  { book: "John", chapters: [1,3,14,15,17] },
  { book: "Psalms", chapters: [1,23,46,91,119] },
  { book: "Romans", chapters: [3,5,8,12] },
  { book: "Matthew", chapters: [5,6,7] },
  { book: "Proverbs", chapters: [1,3,8,31] },
];

const CACHE_KEY = "veritas_plan_cache_meta";

export default function ReadingPlanCacheSettings() {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | downloading | done | error
  const [progress, setProgress] = useState("");
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) {
      try { setMeta(JSON.parse(saved)); setStatus("done"); } catch {}
    }
  }, []);

  const download = async () => {
    setStatus("downloading");
    setProgress("Fetching chapters…");
    try {
      const data = {};
      let done = 0;
      const total = QUICK_CHAPTERS.reduce((s, b) => s + b.chapters.length, 0);

      for (const book of QUICK_CHAPTERS) {
        data[book.book] = {};
        for (const ch of book.chapters) {
          // Check if already cached offline
          const cached = getOfflineVerse("KJV", book.book, ch);
          if (cached) {
            data[book.book][ch] = cached;
            done++;
            setProgress(`${done}/${total} chapters cached…`);
            continue;
          }
          try {
            const res = await base44.functions.invoke("getChapter", { translation: "KJV", book: book.book, chapter: ch });
            if (res.data?.verses?.length) {
              data[book.book][ch] = res.data.verses;
            }
          } catch {}
          done++;
          setProgress(`${done}/${total} chapters cached…`);
        }
      }

      // Save as a special "PLAN_CACHE" entry
      const metaObj = { cachedAt: new Date().toISOString(), totalChapters: done };
      localStorage.setItem("offline_bible_PLAN_CACHE", JSON.stringify({ data, name: "Plan Cache", lang: "en", totalChapters: done, downloadedAt: metaObj.cachedAt }));
      localStorage.setItem(CACHE_KEY, JSON.stringify(metaObj));
      setMeta(metaObj);
      setStatus("done");
      setProgress("");
    } catch {
      setStatus("error");
      setProgress("Download failed. Try again.");
    }
  };

  const clear = () => {
    localStorage.removeItem("offline_bible_PLAN_CACHE");
    localStorage.removeItem(CACHE_KEY);
    setMeta(null);
    setStatus("idle");
    setProgress("");
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(167,139,250,0.03)", border: "1px solid rgba(167,139,250,0.15)" }}>
      <button onClick={() => setExpanded(v => !v)} className="w-full flex items-center gap-3 px-4 py-3.5">
        <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: "#a78bfa" }} />
        <div className="flex-1 text-left">
          <p className="text-sm font-inter" style={{ color: "rgb(var(--ink) / 0.8)" }}>Reading Plan Cache</p>
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.35)" }}>
            {meta ? `Cached ${meta.totalChapters} chapters · ${new Date(meta.cachedAt).toLocaleDateString()}` : "Cache key chapters for offline reading"}
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" style={{ color: "rgb(var(--ink) / 0.3)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "rgb(var(--ink) / 0.3)" }} />}
      </button>

      {expanded && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 border-t space-y-3" style={{ borderColor: "rgb(var(--ink) / 0.06)" }}>
          <p className="text-[10px] font-inter pt-3" style={{ color: "rgb(var(--ink) / 0.35)" }}>
            Caches John, Psalms, Romans, Matthew & Proverbs key chapters (KJV) so they load instantly offline.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_CHAPTERS.map(b => (
              <span key={b.book} className="text-[10px] font-cinzel px-2.5 py-1 rounded-full"
                style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                {b.book} ({b.chapters.length} ch)
              </span>
            ))}
          </div>

          {status === "downloading" && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#a78bfa" }} />
              <p className="text-xs font-inter" style={{ color: "rgb(var(--ink) / 0.5)" }}>{progress}</p>
            </div>
          )}
          {status === "error" && <p className="text-xs font-inter" style={{ color: "#f87171" }}>{progress}</p>}

          <div className="flex gap-2">
            {status !== "done" ? (
              <button onClick={download} disabled={status === "downloading"}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-cinzel text-xs transition-all disabled:opacity-50"
                style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}>
                <Download className="w-3.5 h-3.5" />
                {status === "error" ? "Retry" : "Cache Now"}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-cinzel" style={{ color: "#34d399" }}>
                  <Check className="w-3.5 h-3.5" /> Cached
                </span>
                <button onClick={clear} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-cinzel"
                  style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}