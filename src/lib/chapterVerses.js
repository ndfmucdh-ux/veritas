import { base44 } from "@/api/base44Client";
import { getOfflineVerseAsync } from "@/lib/offlineBible";
import { SAMPLE_VERSES } from "@/lib/sampleVerses";

const cache = new Map();

// Real number of verses in a chapter, read from the chapter text itself
// (downloaded copy first, then bundled samples, then the Bible service).
export async function getVerseCount(book, chapter, translation = "KJV") {
  const key = `${translation}|${book}|${chapter}`;
  if (cache.has(key)) return cache.get(key);

  let verses = await getOfflineVerseAsync(translation, book, chapter);
  if (!verses?.length && translation === "KJV") verses = SAMPLE_VERSES[`${book}:${chapter}`];
  if (!verses?.length) {
    const res = await base44.functions.invoke("getChapter", { translation, book, chapter });
    verses = res.data?.verses;
  }
  const count = verses?.length ? Math.max(...verses.map((v) => Number(v.verse) || 0)) : 0;
  if (count) cache.set(key, count);
  return count;
}