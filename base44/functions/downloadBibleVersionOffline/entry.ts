import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Uses Scripture.api.bible (api.scripture.api.bible) — requires SCRIPTURE_API_KEY
// Supports thousands of Bible versions with no agreement gates on the API side.
// Returns a "quick pack" of the most-read books for offline storage.

const QUICK_PACK_BOOKS = [
  { name: "John", chapters: 21 },
  { name: "Psalms", chapters: 150 },
  { name: "Proverbs", chapters: 31 },
  { name: "Romans", chapters: 16 },
  { name: "Matthew", chapters: 28 },
  { name: "Genesis", chapters: 50 },
  { name: "Acts", chapters: 28 },
  { name: "Luke", chapters: 24 },
  { name: "Revelation", chapters: 22 },
];

// Scripture API Bible IDs for popular translations
// Full list at: https://api.scripture.api.bible/v1/bibles
const BIBLE_ID_MAP = {
  // English
  KJV:    "de4e12af7f28f599-02",
  NKJV:   "1fd99b0d1fe28a37-01",
  NIV:    "3723b69e72eff1e3-01",
  ESV:    "f72b840c855f362c-04",
  NLT:    "65eec8e0b60e656b-01",
  NASB:   "9879dbb7cfe39e4d-03",
  AMP:    "9879dbb7cfe39e4d-04",
  ASV:    "685d1470fe4d5c3b-01",
  WEB:    "9879dbb7cfe39e4d-01",
  BSB:    "bba9f40183526463-01",
  YLT:    "04b55a8acbaba8e1-01",
  DARBY:  "c315fa9f71d4af3d-02",
  ERV:    "98085a04f6f15dd4-01",
  DRA:    "179568874c45066f-01",
  MSG:    "65eec8e0b60e656b-02",
  ISV:    "d2f5c5f50d9e1780-01",
  // Spanish
  RVR1960: "592420522e16049f-01",
  NVI:     "bdd66a960256a01a-01",
  LBLA:    "b32b9d1b64b4ef29-01",
  NTV:     "49f9b1ea79f2165c-01",
  TLA:     "a7f9f0e2f97b7e4e-01",
  DHH:     "b32b9d1b64b4ef29-04",
  RVA:     "592420522e16049f-02",
  // Portuguese
  ARA:     "0bc07dbe07e04f85-01",
  ARC:     "ef5e7c7a7b9d2d28-01",
  // French
  LSG:     "78a9f6124f344018-01",
  NEG1979: "0bc07dbe07e04f85-02",
  BDS:     "13df70b9e4c51c16-01",
  // Italian
  DIOD:    "41f25b97f468e10b-01",
  NRV:     "41f25b97f468e10b-02",
  // German
  LUT:     "72b5845a6b48bfc6-01",
  ELB:     "72b5845a6b48bfc6-02",
};

const TRANSLATION_INFO = {
  KJV: { name: "King James Version", lang: "en" },
  NKJV: { name: "New King James Version", lang: "en" },
  NIV: { name: "New International Version", lang: "en" },
  ESV: { name: "English Standard Version", lang: "en" },
  NLT: { name: "New Living Translation", lang: "en" },
  NASB: { name: "New American Standard Bible", lang: "en" },
  AMP: { name: "Amplified Bible", lang: "en" },
  ASV: { name: "American Standard Version", lang: "en" },
  WEB: { name: "World English Bible", lang: "en" },
  BSB: { name: "Berean Standard Bible", lang: "en" },
  YLT: { name: "Young's Literal Translation", lang: "en" },
  DARBY: { name: "Darby Translation", lang: "en" },
  ERV: { name: "English Revised Version", lang: "en" },
  DRA: { name: "Douay-Rheims American", lang: "en" },
  MSG: { name: "The Message", lang: "en" },
  ISV: { name: "International Standard Version", lang: "en" },
  RVR1960: { name: "Reina-Valera 1960", lang: "es" },
  NVI: { name: "Nueva Versión Internacional", lang: "es" },
  LBLA: { name: "Biblia de las Américas", lang: "es" },
  NTV: { name: "Nueva Traducción Viviente", lang: "es" },
  TLA: { name: "Traducción en Lenguaje Actual", lang: "es" },
  DHH: { name: "Dios Habla Hoy", lang: "es" },
  RVA: { name: "Reina Valera Actualizada", lang: "es" },
  ARA: { name: "Almeida Revisada Atualizada", lang: "pt" },
  ARC: { name: "Almeida Revisada Clássica", lang: "pt" },
  LSG: { name: "Louis Segond 1910", lang: "fr" },
  NEG1979: { name: "Nouvelle Edition Genève 1979", lang: "fr" },
  BDS: { name: "Bible du Semeur", lang: "fr" },
  DIOD: { name: "Bibbia Diodati", lang: "it" },
  NRV: { name: "Nuova Riveduta 2006", lang: "it" },
  LUT: { name: "Lutherbibel 2017", lang: "de" },
  ELB: { name: "Elberfelder Bibel", lang: "de" },
};

// Book ID map for Scripture API
const BOOK_ID_MAP = {
  "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM", "Deuteronomy": "DEU",
  "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT", "1 Samuel": "1SA", "2 Samuel": "2SA",
  "1 Kings": "1KI", "2 Kings": "2KI", "1 Chronicles": "1CH", "2 Chronicles": "2CH",
  "Ezra": "EZR", "Nehemiah": "NEH", "Esther": "EST", "Job": "JOB", "Psalms": "PSA",
  "Proverbs": "PRO", "Ecclesiastes": "ECC", "Song of Solomon": "SNG", "Isaiah": "ISA",
  "Jeremiah": "JER", "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN",
  "Hosea": "HOS", "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA", "Jonah": "JON",
  "Micah": "MIC", "Nahum": "NAM", "Habakkuk": "HAB", "Zephaniah": "ZEP", "Haggai": "HAG",
  "Zechariah": "ZEC", "Malachi": "MAL", "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK",
  "John": "JHN", "Acts": "ACT", "Romans": "ROM", "1 Corinthians": "1CO", "2 Corinthians": "2CO",
  "Galatians": "GAL", "Ephesians": "EPH", "Philippians": "PHP", "Colossians": "COL",
  "1 Thessalonians": "1TH", "2 Thessalonians": "2TH", "1 Timothy": "1TI", "2 Timothy": "2TI",
  "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB", "James": "JAS", "1 Peter": "1PE",
  "2 Peter": "2PE", "1 John": "1JN", "2 John": "2JN", "3 John": "3JN", "Jude": "JUD",
  "Revelation": "REV",
};

function stripHtml(html) {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function fetchChapter(bibleId, bookId, chapterNum, apiKey) {
  const chapterId = `${bookId}.${chapterNum}`;
  const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}/verses?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "api-key": apiKey },
        signal: AbortSignal.timeout(10000),
      });

      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      if (!res.ok) return [];

      const json = await res.json();
      const verses = (json.data || []).map(v => {
        const text = stripHtml(v.content || v.text || "").replace(/^\d+\s*/, "").trim();
        const verseNum = parseInt((v.id || "").split(".")[2]) || 0;
        return { verse: verseNum, text };
      }).filter(v => v.verse > 0 && v.text.length > 0);

      verses.sort((a, b) => a.verse - b.verse);
      return verses;
    } catch {
      if (attempt === 0) await new Promise(r => setTimeout(r, 800));
    }
  }
  return [];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { translation } = await req.json();
    if (!translation) return Response.json({ error: 'Missing translation' }, { status: 400 });

    const tCode = translation.toUpperCase();
    const bibleId = BIBLE_ID_MAP[tCode];
    const info = TRANSLATION_INFO[tCode];

    if (!bibleId || !info) {
      return Response.json({ error: `Translation '${tCode}' is not supported. Supported: ${Object.keys(BIBLE_ID_MAP).join(", ")}` }, { status: 400 });
    }

    const apiKey = Deno.env.get("SCRIPTURE_API_KEY");
    if (!apiKey) return Response.json({ error: "Scripture API key not configured" }, { status: 500 });

    const result = {};
    let totalChapters = 0;
    let totalFailed = 0;

    // Process in batches of 6 to respect rate limits
    const allTasks = [];
    for (const book of QUICK_PACK_BOOKS) {
      result[book.name] = {};
      for (let ch = 1; ch <= book.chapters; ch++) {
        allTasks.push({ bookName: book.name, bookId: BOOK_ID_MAP[book.name], chapter: ch });
      }
    }

    const BATCH_SIZE = 6;
    for (let i = 0; i < allTasks.length; i += BATCH_SIZE) {
      const batch = allTasks.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(({ bookId, chapter }) => fetchChapter(bibleId, bookId, chapter, apiKey))
      );

      for (let j = 0; j < batch.length; j++) {
        const { bookName, chapter } = batch[j];
        const verses = results[j];
        if (verses.length > 0) {
          result[bookName][chapter] = verses;
          totalChapters++;
        } else {
          totalFailed++;
        }
      }

      if (i + BATCH_SIZE < allTasks.length) {
        await new Promise(r => setTimeout(r, 200));
      }
    }

    if (totalChapters === 0) {
      return Response.json({ error: `No chapters downloaded for ${tCode}. Check the API key or try again.` }, { status: 422 });
    }

    return Response.json({
      translation: tCode,
      name: info.name,
      lang: info.lang,
      pack: "quick",
      totalChapters,
      totalFailed,
      data: result,
    });

  } catch (error) {
    console.error("downloadBibleVersionOffline error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});