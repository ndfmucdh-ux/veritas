import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Map of downloadable translations to their names and language
const TRANSLATION_MAP = {
  // English
  KJV:    { name: "King James Version",           lang: "en" },
  NKJV:   { name: "New King James Version",       lang: "en" },
  NIV:    { name: "New International Version",    lang: "en" },
  ESV:    { name: "English Standard Version",     lang: "en" },
  NLT:    { name: "New Living Translation",       lang: "en" },
  NASB:   { name: "New American Standard Bible",  lang: "en" },
  AMP:    { name: "Amplified Bible",              lang: "en" },
  CSB:    { name: "Christian Standard Bible",     lang: "en" },
  MSG:    { name: "The Message",                  lang: "en" },
  ASV:    { name: "American Standard Version",    lang: "en" },
  BBE:    { name: "Bible in Basic English",       lang: "en" },
  WEB:    { name: "World English Bible",          lang: "en" },
  BSB:    { name: "Berean Standard Bible",        lang: "en" },
  YLT:    { name: "Young's Literal Translation",  lang: "en" },
  DARBY:  { name: "Darby Translation",            lang: "en" },
  WNT:    { name: "Weymouth New Testament",       lang: "en" },
  ERV:    { name: "English Revised Version",      lang: "en" },
  RV:     { name: "Revised Version",              lang: "en" },
  NRSV:   { name: "New Revised Standard Version", lang: "en" },
  ISV:    { name: "International Standard Version",lang: "en" },
  // Spanish
  RVR1960:{ name: "Reina-Valera 1960",            lang: "es" },
  NVI:    { name: "Nueva Versión Internacional",  lang: "es" },
  PDDPT:  { name: "Palabra de Dios para Ti",      lang: "es" },
  BTX3:   { name: "Biblia Textual",               lang: "es" },
  RVA2015:{ name: "Reina Valera Actualizada 2015",lang: "es" },
  LBLA:   { name: "Biblia de las Américas",       lang: "es" },
  NTV:    { name: "Nueva Traducción Viviente",    lang: "es" },
  // Portuguese
  ARA:    { name: "Almeida Revisada Atualizada",  lang: "pt" },
  ARC:    { name: "Almeida Revisada Clássica",    lang: "pt" },
  NVT:    { name: "Nova Versão Transformadora",   lang: "pt" },
  // French
  LSG:    { name: "Louis Segond 1910",            lang: "fr" },
  NEG1979:{ name: "Nouvelle Edition Genève 1979", lang: "fr" },
  BDS:    { name: "Bible du Semeur",              lang: "fr" },
  // Italian
  DIOD:   { name: "Bibbia Diodati",               lang: "it" },
  NRV:    { name: "Nuova Riveduta 2006",          lang: "it" },
};

// Book name → canonical book number (1-66) for getChapter API
const BOOK_NUM = {
  "Genesis":1,"Exodus":2,"Leviticus":3,"Numbers":4,"Deuteronomy":5,
  "Joshua":6,"Judges":7,"Ruth":8,"1 Samuel":9,"2 Samuel":10,
  "1 Kings":11,"2 Kings":12,"1 Chronicles":13,"2 Chronicles":14,
  "Ezra":15,"Nehemiah":16,"Esther":17,"Job":18,"Psalms":19,"Proverbs":20,
  "Ecclesiastes":21,"Song of Solomon":22,"Isaiah":23,"Jeremiah":24,
  "Lamentations":25,"Ezekiel":26,"Daniel":27,"Hosea":28,"Joel":29,
  "Amos":30,"Obadiah":31,"Jonah":32,"Micah":33,"Nahum":34,
  "Habakkuk":35,"Zephaniah":36,"Haggai":37,"Zechariah":38,"Malachi":39,
  "Matthew":40,"Mark":41,"Luke":42,"John":43,"Acts":44,"Romans":45,
  "1 Corinthians":46,"2 Corinthians":47,"Galatians":48,"Ephesians":49,
  "Philippians":50,"Colossians":51,"1 Thessalonians":52,"2 Thessalonians":53,
  "1 Timothy":54,"2 Timothy":55,"Titus":56,"Philemon":57,"Hebrews":58,
  "James":59,"1 Peter":60,"2 Peter":61,"1 John":62,"2 John":63,
  "3 John":64,"Jude":65,"Revelation":66,
};

// Quick Pack — most-read books for fast downloads (231 chapters)
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

async function fetchChapterWithRetry(base44, translation, book, chapter, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const verseRes = await base44.functions.invoke("getChapter", {
        translation,
        book,
        chapter,
      });
      return verseRes?.data?.verses || [];
    } catch (error) {
      const is429 = error?.response?.status === 429 || error?.message?.includes("429");
      const is500 = error?.response?.status === 500 || error?.message?.includes("Rate limit");
      
      if ((is429 || is500) && attempt < maxRetries - 1) {
        // Aggressive backoff for rate limits: 1s, 3s, 7s
        const delay = 1000 * (Math.pow(2, attempt) + attempt);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      return [];
    }
  }
  return [];
}

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

      for (let ch = 1; ch <= book.chapters; ch++) {
        const verses = await fetchChapterWithRetry(base44, translation.toUpperCase(), book.name, ch);
        if (verses.length > 0) {
          result[book.name][ch] = verses.map(v => ({
            verse: v.verse,
            text: v.text,
          }));
          totalChapters++;
        }
        // Stagger requests: 500ms between chapters to avoid rate limits
        await new Promise(r => setTimeout(r, 500));
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