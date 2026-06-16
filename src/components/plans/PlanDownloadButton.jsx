import { useState, useEffect } from "react";
import { Download, Check, Loader2, WifiOff } from "lucide-react";
import { useOfflineChapters } from "@/hooks/useOfflineChapters";
import { isChapterDownloadedAsync } from "@/lib/offlineBible";

/**
 * Parse a plan's verse references into unique { book, chapter } pairs.
 * Handles refs like "John 3:16", "Romans 5:8", "1 Corinthians 13:1-13".
 */
function extractChapters(plan) {
  const set = new Map();
  (plan.days || []).forEach(day => {
    (day.verses || []).forEach(ref => {
      // Match: <book name (may have leading number)> <chapter>:<verse>
      const m = ref.match(/^([1-3]?\s?[A-Za-zÀ-ÿ.]+(?:\s[A-Za-zÀ-ÿ.]+)*)\s+(\d+):/);
      if (m) {
        const book = m[1].trim();
        const chapter = Number(m[2]);
        set.set(`${book}|${chapter}`, { book, chapter });
      }
    });
  });
  return [...set.values()];
}

export default function PlanDownloadButton({ plan, accentColor = "#00f5ff" }) {
  const { batchProgress, downloadChapters } = useOfflineChapters();
  const [allSaved, setAllSaved] = useState(false);
  const [checking, setChecking] = useState(true);

  const chapters = extractChapters(plan);
  const batchId = `plan-${plan.title}`;
  const progress = batchProgress[batchId];
  const isDownloading = progress?.status === "downloading";

  useEffect(() => {
    let active = true;
    (async () => {
      if (chapters.length === 0) { setChecking(false); return; }
      const checks = await Promise.all(
        chapters.map(c => isChapterDownloadedAsync("KJV", c.book, c.chapter))
      );
      if (active) { setAllSaved(checks.every(Boolean)); setChecking(false); }
    })();
    return () => { active = false; };
  }, [plan.title]);

  if (chapters.length === 0) return null;

  const isDone = allSaved || progress?.status === "done";

  const handleDownload = async () => {
    if (isDownloading || isDone) return;
    await downloadChapters(batchId, chapters, "KJV");
    setAllSaved(true);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading || checking}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-cinzel text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
      style={{
        background: isDone ? "rgba(52,211,153,0.12)" : `${accentColor}12`,
        color: isDone ? "#34d399" : accentColor,
        border: `1px solid ${isDone ? "rgba(52,211,153,0.3)" : `${accentColor}30`}`,
      }}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Downloading… {progress.done}/{progress.total}
        </>
      ) : isDone ? (
        <>
          <Check className="w-4 h-4" />
          Available Offline · {chapters.length} chapters
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          Download Plan for Offline
        </>
      )}
    </button>
  );
}