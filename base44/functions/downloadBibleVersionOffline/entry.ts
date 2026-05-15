import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Downloads via bolls.life API which has the widest translation coverage including BTX3.
// Falls back to Scripture.api.bible for translations not on bolls.life.

// Quick pack: high-value books for fast offline access
const QUICK_PACK_BOOKS = [
  { name: "Genesis",    num: 1,  chapters: 50  },
  { name: "Psalms",     num: 19, chapters: 150 },
  { name: "Proverbs",   num: 20, chapters: 31  },
  { name: "Isaiah",     num: 23, chapters: 66  },
  { name: "Matthew",    num: 40, chapters: 28  },
  { name: "Mark",       num: 41, chapters: 16  },
  { name: "Luke",       num: 42, chapters: 24  },
  { name: "John",       num: 43, chapters: 21  },
  { name: "Acts",       num: 44, chapters: 28  },
  { name: "Romans",     num: 45, chapters: 16  },
  { name: "Revelation", num: 66, chapters: 22  },
];

// Bolls.life translation codes — confirmed working
const BOLLS_CODE_MAP = {
  // English
  KJV: "KJV", NKJV: "NKJV", NIV: "NIV", ESV: "ESV", NLT: "NLT",
  NASB: "NASB", AMP: "AMP", CSB: "CSB17", MSG: "MSG", ASV: "ASV",
  WEB: "WEB", BSB: "BSB", YLT: "YLT", DARBY: "DARBY", WNT: "WNT",
  ERV: "ERV", NRSV: "NRSVCE", ISV: "ISV", DRA: "DRA", WYC: "WYC",
  GNV: "GNV", BBE: "BBE", HCSB: "HCSB", TPT: "TPT", MEV: "MEV",
  GNT: "GNT", CEV: "CEV", NIRV: "NIRV", NCV: "NCV",
  // Spanish — BTX3 hardcoded as a primary
  BTX3: "BTX3", RVR1960: "RV1960", NVI: "NVI", LBLA: "LBLA",
  NTV: "NTV", RVA: "RVA2015", TLA: "TLA", DHH: "DHH", BLS: "BLS",
  RVR2020: "RVR2020", PDT: "PDT",
  // Portuguese
  ARA: "ARA", ARC: "ARC", NVT: "NVT",
  // French
  LSG: "LSG1910", BDS: "BDS", NEG1979: "NEG1979", SG21: "SG21",
  // Italian
  DIOD: "Diodati", NRV: "NR2006", CEI: "CEI",
  // German
  LUT: "Luther2017", ELB: "ELB",
};

// Scripture.api.bible fallback IDs (for translations not on bolls.life)
const SCRIPTURE_ID_MAP = {
  NASB1995: "9879dbb7cfe39e4d-03",
  NASB2020: "9879dbb7cfe39e4d-04",
  ESVA: "f72b840c855f362c-04",
  HCSB2: "9879dbb7cfe39e4d-01",
  ABP:  "3050",
  VOICE: "65eec8e0b60e656b-02",
  JUB: "c315fa9f71d4af3d-02",
  MOUNCE: "685d1470fe4d5c3b-01",
  DRA: "179568874c45066f-01",
  AKJV: "de4e12af7f28f599-02",
};

const BOOK_ID_MAP = {
  "Genesis": "GEN","Exodus": "EXO","Leviticus": "LEV","Numbers": "NUM","Deuteronomy": "DEU",
  "Joshua": "JOS","Judges": "JDG","Ruth": "RUT","1 Samuel": "1SA","2 Samuel": "2SA",
  "1 Kings": "1KI","2 Kings": "2KI","1 Chronicles": "1CH","2 Chronicles": "2CH",
  "Ezra": "EZR","Nehemiah": "NEH","Esther": "EST","Job": "JOB","Psalms": "PSA",
  "Proverbs": "PRO","Ecclesiastes": "ECC","Song of Solomon": "SNG","Isaiah": "ISA",
  "Jeremiah": "JER","Lamentations": "LAM","Ezekiel": "EZK","Daniel": "DAN",
  "Hosea": "HOS","Joel": "JOL","Amos": "AMO","Obadiah": "OBA","Jonah": "JON",
  "Micah": "MIC","Nahum": "NAM","Habakkuk": "HAB","Zephaniah": "ZEP","Haggai": "HAG",
  "Zechariah": "ZEC","Malachi": "MAL","Matthew": "MAT","Mark": "MRK","Luke": "LUK",
  "John": "JHN","Acts": "ACT","Romans": "ROM","1 Corinthians": "1CO","2 Corinthians": "2CO",
  "Galatians": "GAL","Ephesians": "EPH","Philippians": "PHP","Colossians": "COL",
  "1 Thessalonians": "1TH","2 Thessalonians": "2TH","1 Timothy": "1TI","2 Timothy": "2TI",
  "Titus": "TIT","Philemon": "PHM","Hebrews": "HEB","James": "JAS","1 Peter": "1PE",
  "2 Peter": "2PE","1 John": "1JN","2 John": "2JN","3 John": "3JN","Jude": "JUD",
  "Revelation": "REV",
};

const TRANSLATION_META = {
  KJV: { name: "King James Version", lang: "en" },
  NKJV: { name: "New King James Version", lang: "en" },
  NIV: { name: "New International Version", lang: "en" },
  ESV: { name: "English Standard Version", lang: "en" },
  NLT: { name: "New Living Translation", lang: "en" },
  NASB: { name: "New American Standard Bible", lang: "en" },
  AMP: { name: "Amplified Bible", lang: "en" },
  CSB: { name: "Christian Standard Bible", lang: "en" },
  MSG: { name: "The Message", lang: "en" },
  NRSV: { name: "New Revised Standard Version", lang: "en" },
  ASV: { name: "American Standard Version", lang: "en" },
  WEB: { name: "World English Bible", lang: "en" },
  BSB: { name: "Berean Standard Bible", lang: "en" },
  YLT: { name: "Young's Literal Translation", lang: "en" },
  ERV: { name: "English Revised Version", lang: "en" },
  GNV: { name: "Geneva Bible", lang: "en" },
  AKJV: { name: "American King James Version", lang: "en" },
  HCSB: { name: "Holman CSB", lang: "en" },
  ICB: { name: "International Children's Bible", lang: "en" },
  DARBY: { name: "Darby Translation", lang: "en" },
  WNT: { name: "Weymouth New Testament", lang: "en" },
  RV: { name: "Revised Version", lang: "en" },
  EBR: { name: "Emphasised Bible", lang: "en" },
  MOUNCE: { name: "Mounce Reverse Interlinear", lang: "en" },
  DRA: { name: "Douay-Rheims American", lang: "en" },
  WYC: { name: "Wycliffe Bible", lang: "en" },
  WILLIAMS: { name: "Williams New Testament", lang: "en" },
  NAB: { name: "New American Bible", lang: "en" },
  NCV: { name: "New Century Version", lang: "en" },
  NIRV: { name: "NIrV Bible", lang: "en" },
  ISV: { name: "International Standard Version", lang: "en" },
  TLB: { name: "The Living Bible", lang: "en" },
  NASB1995: { name: "NASB 1995", lang: "en" },
  NASB2020: { name: "NASB 2020", lang: "en" },
  HCSB2: { name: "Holman CSB 2009", lang: "en" },
  MEV: { name: "Modern English Version", lang: "en" },
  TPT: { name: "The Passion Translation", lang: "en" },
  CEV: { name: "Contemporary English Version", lang: "en" },
  GNT: { name: "Good News Translation", lang: "en" },
  VOICE: { name: "The Voice", lang: "en" },
  JUB: { name: "Jubilee Bible", lang: "en" },
  NETBM: { name: "NET Bible with Notes", lang: "en" },
  ABP: { name: "Apostolic Bible Polyglot", lang: "en" },
  BBE: { name: "Bible in Basic English", lang: "en" },
  // Spanish — BTX3 hardcoded primary
  BTX3: { name: "Biblia Textual", lang: "es" },
  RVR1960: { name: "Reina-Valera 1960", lang: "es" },
  NVI: { name: "Nueva Versión Internacional", lang: "es" },
  LBLA: { name: "Biblia de las Américas", lang: "es" },
  TLA: { name: "Traducción en Lenguaje Actual", lang: "es" },
  DHH: { name: "Dios Habla Hoy", lang: "es" },
  NTV: { name: "Nueva Traducción Viviente", lang: "es" },
  BLS: { name: "Biblia en Lenguaje Sencillo", lang: "es" },
  PDT: { name: "Palabra de Dios para Ti", lang: "es" },
  RVA: { name: "Reina Valera Actualizada 2015", lang: "es" },
  RVR2020: { name: "Reina-Valera 2020", lang: "es" },
  // Portuguese
  ARA: { name: "Almeida Revisada Atualizada", lang: "pt" },
  ARC: { name: "Almeida Revisada Clássica", lang: "pt" },
  NVT: { name: "Nova Versão Transformadora", lang: "pt" },
  BPT: { name: "Bíblia Português", lang: "pt" },
  // French
  LSG: { name: "Louis Segond 1910", lang: "fr" },
  NEG1979: { name: "Nouvelle Edition Genève 1979", lang: "fr" },
  BDS: { name: "Bible du Semeur", lang: "fr" },
  SG21: { name: "Segond 21", lang: "fr" },
  // Italian
  DIOD: { name: "Bibbia Diodati", lang: "it" },
  NRV: { name: "Nuova Riveduta 2006", lang: "it" },
  CEI: { name: "CEI Conferenza Episcopale", lang: "it" },
  // German
  LUT: { name: "Lutherbibel 2017", lang: "de" },
  ELB: { name: "Elberfelder Bibel", lang: "de" },
};

function cleanBollsText(raw) {
  return (raw || "")
    .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function fetchBolls(bollsCode, bookNum, chapter) {
  const url = `https://bolls.life/get-chapter/${bollsCode}/${bookNum}/${chapter}/`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) { if (attempt === 0) { await new Promise(r => setTimeout(r, 600)); continue; } return null; }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return null;
      const verses = data.map(v => ({
        verse: parseInt(v.verse),
        text: cleanBollsText(v.text || ""),
      })).filter(v => v.verse > 0 && v.text.length > 0);
      verses.sort((a, b) => a.verse - b.verse);
      return verses.length > 0 ? verses : null;
    } catch { if (attempt === 0) await new Promise(r => setTimeout(r, 600)); }
  }
  return null;
}

async function fetchScripture(usfmId, chapter, scriptureKey, bibleId) {
  const chapterId = `${usfmId}.${chapter}`;
  const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}/verses?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true`;
  try {
    const res = await fetch(url, { headers: { "api-key": scriptureKey }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const json = await res.json();
    const verses = (json.data || []).map(v => ({
      verse: parseInt((v.id || "").split(".")[2]) || 0,
      text: (v.content || "").replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim(),
    })).filter(v => v.verse > 0 && v.text.length > 0);
    verses.sort((a, b) => a.verse - b.verse);
    return verses.length > 0 ? verses : null;
  } catch { return null; }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { translation } = await req.json();
    if (!translation) return Response.json({ error: "Missing translation" }, { status: 400 });

    const tCode = translation.toUpperCase();
    const meta = TRANSLATION_META[tCode];
    if (!meta) {
      return Response.json({
        error: `Translation '${tCode}' not supported. Supported: ${Object.keys(TRANSLATION_META).join(", ")}`,
      }, { status: 400 });
    }

    const bollsCode = BOLLS_CODE_MAP[tCode];
    const scriptureId = SCRIPTURE_ID_MAP[tCode];
    const scriptureKey = Deno.env.get("SCRIPTURE_API_KEY");

    if (!bollsCode && !scriptureId) {
      return Response.json({ error: `No download source available for ${tCode}` }, { status: 400 });
    }

    const result = {};
    let totalChapters = 0;
    let totalFailed = 0;

    const allTasks = [];
    for (const book of QUICK_PACK_BOOKS) {
      result[book.name] = {};
      allTasks.push(...Array.from({ length: book.chapters }, (_, i) => ({ bookName: book.name, bookNum: book.num, chapter: i + 1 })));
    }

    const BATCH_SIZE = 8;
    for (let i = 0; i < allTasks.length; i += BATCH_SIZE) {
      const batch = allTasks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(async ({ bookName, bookNum, chapter }) => {
        // Try bolls.life first
        if (bollsCode) {
          const v = await fetchBolls(bollsCode, bookNum, chapter);
          if (v) return v;
        }
        // Fallback Scripture API
        if (scriptureId && scriptureKey) {
          return await fetchScripture(BOOK_ID_MAP[bookName], chapter, scriptureKey, scriptureId);
        }
        return null;
      }));

      for (let j = 0; j < batch.length; j++) {
        const { bookName, chapter } = batch[j];
        const verses = batchResults[j];
        if (verses && verses.length > 0) {
          result[bookName][chapter] = verses;
          totalChapters++;
        } else {
          totalFailed++;
        }
      }

      if (i + BATCH_SIZE < allTasks.length) {
        await new Promise(r => setTimeout(r, 150));
      }
    }

    if (totalChapters === 0) {
      return Response.json({ error: `No chapters downloaded for ${tCode}. Check connectivity and retry.` }, { status: 422 });
    }

    return Response.json({
      translation: tCode,
      name: meta.name,
      lang: meta.lang,
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