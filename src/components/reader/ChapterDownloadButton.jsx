import { useState, useEffect } from "react";
import { Download, Check, Loader2, AlertCircle } from "lucide-react";
import { isChapterDownloadedAsync } from "@/lib/offlineBible";
import { useOfflineChapters } from "@/hooks/useOfflineChapters";

/**
 * Saves the current chapter for offline reading. Reuses the IconBtn styling
 * pattern from the Reader toolbar.
 */
export default function ChapterDownloadButton({ book, chapter, translation }) {
  const { chapterStatus, downloadChapter, keyOf } = useOfflineChapters();
  const [saved, setSaved] = useState(false);
  const key = keyOf(translation, book, chapter);
  const status = chapterStatus[key];

  useEffect(() => {
    let active = true;
    isChapterDownloadedAsync(translation, book, chapter).then(d => { if (active) setSaved(d); });
    return () => { active = false; };
  }, [translation, book, chapter]);

  const isDownloading = status === "downloading";
  const isDone = saved || status === "done";
  const isError = status === "error";

  const handleClick = async () => {
    if (isDownloading || isDone) return;
    const ok = await downloadChapter(translation, book, chapter);
    if (ok) setSaved(true);
  };

  const title = isDone
    ? "Saved for offline reading"
    : isError
    ? "Download failed — tap to retry"
    : "Save this chapter for offline";

  return (
    <button
      onClick={handleClick}
      title={title}
      aria-label={title}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
      style={{
        background: isDone ? "rgba(52,211,153,0.12)" : "rgb(var(--ink) / 0.05)",
        border: `1px solid ${isDone ? "rgba(52,211,153,0.3)" : "rgb(var(--ink) / 0.08)"}`,
        color: isDone ? "#34d399" : isError ? "#f87171" : "rgb(var(--ink) / 0.55)",
      }}
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isDone ? (
        <Check className="w-4 h-4" />
      ) : isError ? (
        <AlertCircle className="w-4 h-4" />
      ) : (
        <Download className="w-4 h-4" />
      )}
    </button>
  );
}