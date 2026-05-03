import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Supported translations via bible-api.com
// Spanish: rv1960 (Reina Valera 1960), rv1909 (Reina Valera 1909)
// English: kjv, web, bbe, darby, weymouth, asvs
const TRANSLATION_MAP = {
  KJV:    { apiCode: "kjv",    name: "King James Version",      lang: "en" },
  WEB:    { apiCode: "web",    name: "World English Bible",     lang: "en" },
  BBE:    { apiCode: "bbe",    name: "Bible in Basic English",  lang: "en" },
  RV1960: { apiCode: "rv1960", name: "Reina Valera 1960",       lang: "es" },
  RV1909: { apiCode: "rv1909", name: "Reina Valera 1909",       lang: "es" },
};

// We pre-fetch a "Quick Pack" — the most-read books — so the download is fast
// Full Bible would be 1189 chapters; Quick Pack is 15 essential books (231 chapters)
const QUICK_PACK_BOOKS = [
  { name: "John",         chapters: 21 },
  { name: "Psalms",       chapters: 150 },
  { name: "Proverbs",     chapters: 31 },
  { name: "Romans",       chapters: 16 },
  { name: "Matthew",      chapters: 28 },
  { name: "Genesis",      chapters: 50 },
  { name: "Isaiah",       chapters: 66 },
  { name: "Acts",         chapters: 28 },
  { name: "Luke",         chapters: 24 },
  { name: "Revelation",   chapters: 22 },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { translation, pack = "quick" } = await req.json();
    if (!translation) return Response.json({ error: 'Missing translation' }, { status: 400 });

    const trans = TRANSLATION_MAP[translation.toUpperCase()];
    if (!trans) return Response.json({ error: `Unsupported translation: ${translation}` }, { status: 400 });

    const books = QUICK_PACK_BOOKS;
    const result = {};
    let totalChapters = 0;

    for (const book of books) {
      result[book.name] = {};
      const bookSlug = book.name.toLowerCase().replace(/\s+/g, "+");

      for (let ch = 1; ch <= book.chapters; ch++) {
        const url = `https://bible-api.com/${bookSlug}+${ch}?translation=${trans.apiCode}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const verses = (data.verses || []).map(v => ({
          verse: v.verse,
          text: v.text.trim(),
        }));
        if (verses.length > 0) {
          result[book.name][ch] = verses;
          totalChapters++;
        }
        // Small delay to be respectful to the free API
        await new Promise(r => setTimeout(r, 80));
      }
    }

    return Response.json({
      translation: translation.toUpperCase(),
      name: trans.name,
      lang: trans.lang,
      pack,
      totalChapters,
      data: result,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});