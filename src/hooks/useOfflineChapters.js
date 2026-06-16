import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { saveOfflineChapter, isChapterDownloadedAsync } from "@/lib/offlineBible";

/**
 * Download individual chapters (or a batch of chapters, e.g. a reading plan)
 * for offline reading. Fetches verses via the getChapter backend function and
 * stores them in the same IndexedDB chapter store the Reader already reads from.
 */
export function useOfflineChapters() {
  // status per key "TRANSLATION|Book|Chapter": "idle" | "downloading" | "done" | "error"
  const [chapterStatus, setChapterStatus] = useState({});
  // batch progress per batchId: { total, done, status }
  const [batchProgress, setBatchProgress] = useState({});

  const keyOf = (translation, book, chapter) =>
    `${translation?.toUpperCase()}|${book}|${Number(chapter)}`;

  const fetchAndStore = useCallback(async (translation, book, chapter) => {
    // Skip if already saved
    if (await isChapterDownloadedAsync(translation, book, chapter)) return true;
    const res = await base44.functions.invoke("getChapter", { translation, book, chapter });
    const verses = res?.data?.verses;
    if (Array.isArray(verses) && verses.length > 0) {
      return saveOfflineChapter(translation, book, chapter, verses);
    }
    return false;
  }, []);

  const downloadChapter = useCallback(async (translation, book, chapter) => {
    const key = keyOf(translation, book, chapter);
    setChapterStatus(s => ({ ...s, [key]: "downloading" }));
    try {
      const ok = await fetchAndStore(translation, book, chapter);
      setChapterStatus(s => ({ ...s, [key]: ok ? "done" : "error" }));
      return ok;
    } catch {
      setChapterStatus(s => ({ ...s, [key]: "error" }));
      return false;
    }
  }, [fetchAndStore]);

  /**
   * Download a list of chapters sequentially (gentle on rate limits).
   * chapters: [{ book, chapter }], translation defaults to "KJV"
   */
  const downloadChapters = useCallback(async (batchId, chapters, translation = "KJV") => {
    const total = chapters.length;
    setBatchProgress(p => ({ ...p, [batchId]: { total, done: 0, status: "downloading" } }));
    let done = 0;
    for (const { book, chapter } of chapters) {
      try { await fetchAndStore(translation, book, chapter); } catch {}
      done += 1;
      setBatchProgress(p => ({ ...p, [batchId]: { total, done, status: "downloading" } }));
    }
    setBatchProgress(p => ({ ...p, [batchId]: { total, done, status: "done" } }));
    return true;
  }, [fetchAndStore]);

  return { chapterStatus, batchProgress, downloadChapter, downloadChapters, keyOf };
}