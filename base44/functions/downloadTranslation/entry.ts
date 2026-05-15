import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Map from app translation codes → bolls.life short_name codes
const BOLLS_CODE_MAP = {
  // English
  KJV: "KJV", NKJV: "NKJV", NIV: "NIV", ESV: "ESV", NLT: "NLT",
  NASB: "NASB", AMP: "AMP", CSB: "CSB17", MSG: "MSG", ASV: "ASV",
  BBE: "BBE", WEB: "WEB", BSB: "BSB", YLT: "YLT", DARBY: "DARBY",
  WNT: "WNT", ERV: "ERV", NRSV: "NRSVCE", ISV: "ISV", DRA: "DRA",
  WYC: "WYC", GNV: "GNV",
  // Spanish
  NVI: "NVI", RVR1960: "RV1960", LBLA: "LBLA", NTV: "NTV",
  RVA: "RVA2015", TLA: "TLA", DHH: "DHH",
  // Portuguese
  ARA: "ARA", ARC: "ARC",
  // French
  LSG: "LSG1910", BDS: "BDS", NEG1979: "NEG1979",
  // Italian
  DIOD: "Diodati", NRV: "NR2006",
  // German
  LUT: "Luther2017", ELB: "ELB",
};

const TRANSLATION_MAP = {
  KJV: { name: "King James Version", lang: "en" },
  NKJV: { name: "New King James Version", lang: "en" },
  NIV: { name: "New International Version", lang: "en" },
  ESV: { name: "English Standard Version", lang: "en" },
  NLT: { name: "New Living Translation", lang: "en" },
  NASB: { name: "New American Standard Bible", lang: "en" },
  AMP: { name: "Amplified Bible", lang: "en" },
  CSB: { name: "Christian Standard Bible", lang: "en" },
  MSG: { name: "The Message", lang: "en" },
  ASV: { name: "American Standard Version", lang: "en" },
  BBE: { name: "Bible in Basic English", lang: "en" },
  WEB: { name: "World English Bible", lang: "en" },
  BSB: { name: "Berean Standard Bible", lang: "en" },
  YLT: { name: "Young's Literal Translation", lang: "en" },
  DARBY: { name: "Darby Translation", lang: "en" },
  WNT: { name: "Weymouth New Testament", lang: "en" },
  ERV: { name: "English Revised Version", lang: "en" },
  NRSV: { name: "New Revised Standard Version", lang: "en" },
  ISV: { name: "International Standard Version", lang: "en" },
  DRA: { name: "Douay-Rheims American", lang: "en" },
  WYC: { name: "Wycliffe Bible", lang: "en" },
  GNV: { name: "Geneva Bible", lang: "en" },
  RVR1960: { name: "Reina-Valera 1960", lang: "es" },
  NVI: { name: "Nueva Versión Internacional", lang: "es" },
  LBLA: { name: "Biblia de las Américas", lang: "es" },
  NTV: { name: "Nueva Traducción Viviente", lang: "es" },
  RVA: { name: "Reina Valera Actualizada 2015", lang: "es" },
  TLA: { name: "Traducción en Lenguaje Actual", lang: "es" },
  DHH: { name: "Dios Habla Hoy", lang: "es" },
  ARA: { name: "Almeida Revisada Atualizada", lang: "pt" },
  ARC: { name: "Almeida Revisada Clássica", lang: "pt" },
  LSG: { name: "Louis Segond 1910", lang: "fr" },
  BDS: { name: "Bible du Semeur", lang: "fr" },
  NEG1979: { name: "Nouvelle Edition Genève 1979", lang: "fr" },
  DIOD: { name: "Bibbia Diodati", lang: "it" },
  NRV: { name: "Nuova Riveduta 2006", lang: "it" },
  LUT: { name: "Lutherbibel 2017", lang: "de" },
  ELB: { name: "Elberfelder Bibel", lang: "de" },
};

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

function cleanBollsText(raw) {
  let text = raw
    .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\d{3,5}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const nlIdx = text.indexOf("\n");
  if (nlIdx > 0 && nlIdx < 80) {
    const after = text.substring(nlIdx + 1).trim();
    if (after.length > 10) text = after;
  }
  text = text.replace(/^((?:[A-Z][a-zA-Z']*\s+){1,8}[A-Z][a-zA-Z']*)([A-Z][a-z])/, "$2");
  return text.trim();
}

// Fetch a chapter from bolls.life with one retry on failure
async function fetchChapterDirect(bollsCode, bookName, chapter) {
  const bookNum = BOOK_NUM[bookName];
  if (!bookNum) return [];
  const url = `https://bolls.life/get-chapter/${bollsCode}/${bookNum}/${chapter}/`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) {
        if (attempt === 0) {
          await new Promise(r => setTimeout(r, 500));
          continue;
        }
        return [];
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return [];
      const verses = [];
      for (const v of data) {
        const num = parseInt(v.verse);
        if (isNaN(num) || !v.text) continue;
        const text = cleanBollsText(v.text.trim());
        if (text) verses.push({ verse: num, text });
      }
      verses.sort((a, b) => a.verse - b.verse);
      return verses;
    } catch {
      if (attempt === 0) {
        await new Promise(r => setTimeout(r, 600));
      }
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
    const trans = TRANSLATION_MAP[tCode];
    if (!trans) return Response.json({ error: `Unsupported translation: ${translation}` }, { status: 400 });

    const bollsCode = BOLLS_CODE_MAP[tCode];
    if (!bollsCode) {
      return Response.json({ error: `Translation ${tCode} is not available for offline download` }, { status: 400 });
    }

    const books = QUICK_PACK_BOOKS;
    const result = {};
    let totalChapters = 0;

    // Build all fetch tasks
    const allTasks = [];
    for (const book of books) {
      result[book.name] = {};
      for (let ch = 1; ch <= book.chapters; ch++) {
        allTasks.push({ bookName: book.name, chapter: ch });
      }
    }

    // Process in batches of 8 — gentle on the API
    const BATCH_SIZE = 8;
    for (let i = 0; i < allTasks.length; i += BATCH_SIZE) {
      const batch = allTasks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(({ bookName, chapter }) => fetchChapterDirect(bollsCode, bookName, chapter))
      );

      for (let j = 0; j < batch.length; j++) {
        const { bookName, chapter } = batch[j];
        const verses = batchResults[j];
        if (verses.length > 0) {
          result[bookName][chapter] = verses;
          totalChapters++;
        }
      }

      // Polite delay between batches
      if (i + BATCH_SIZE < allTasks.length) {
        await new Promise(r => setTimeout(r, 150));
      }
    }

    if (totalChapters === 0) {
      return Response.json({ error: `No chapters could be fetched for ${tCode}. The translation may not be available on bolls.life.` }, { status: 422 });
    }

    return Response.json({
      translation: tCode,
      name: trans.name,
      lang: trans.lang,
      pack: "quick",
      totalChapters,
      data: result,
    });

  } catch (error) {
    console.error("downloadTranslation error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});