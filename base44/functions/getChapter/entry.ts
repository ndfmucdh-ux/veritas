import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ── bolls.life API ─────────────────────────────────────────────────────────
// Format: https://bolls.life/get-chapter/{TRANSLATION}/{BOOK_NUM}/{CHAPTER}/
// Returns: [{verse, text, ...}]  — text is clean for most translations
const BOLLS_BASE = "https://bolls.life/get-chapter";

// Translations supported by bolls.life with clean (no Strong's) text
// KJV on bolls has Strong's numbers embedded — we strip them
// NOTE: Only add codes here if bolls.life actually returns data for them
const BOLLS_TRANSLATIONS = new Set([
  "KJV","NKJV","NIV","ESV","NLT","NASB","AMP","CSB","MSG",
  "ASV","BBE","WEB","YLT","DARBY","WNT","ERV","NRSV","ISV",
]);

// Book name → canonical book number (1-66)
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

// Clean bolls.life verse text:
// 1. Remove <sup> footnote blocks entirely
// 2. Strip all remaining HTML tags
// 3. Strip Strong's numbers (digits attached to words, e.g. "shepherd7462" or "3068 is")
// 4. Remove section headings prepended before verse text (heuristic: text before first uppercase-start sentence)
// 5. Collapse whitespace
function cleanBollsText(raw) {
  let text = raw
    .replace(/<sup[^>]*>.*?<\/sup>/gi, "")  // remove footnote <sup>...</sup> blocks entirely
    .replace(/<br\s*\/?>/gi, "\n")           // convert <br> to newline (heading separator)
    .replace(/<[^>]+>/g, "")                // strip all remaining HTML tags
    .replace(/\d{3,5}/g, "")                // strip Strong's concordance numbers (3-5 digits)
    .replace(/\s{2,}/g, " ")
    .trim();

  // If a <br> separated a heading from the verse text, take only what's after the newline
  const nlIdx = text.indexOf("\n");
  if (nlIdx > 0 && nlIdx < 80) {
    const after = text.substring(nlIdx + 1).trim();
    if (after.length > 10) text = after;
  }

  // Heuristic: if text starts with a run-on section heading (Title Case words immediately followed
  // by a capital letter with no space), split on the camelCase boundary
  // e.g. "Jesus Teaches NicodemusNow there was" → "Now there was"
  text = text.replace(/^((?:[A-Z][a-zA-Z']*\s+){1,8}[A-Z][a-zA-Z']*)([A-Z][a-z])/, "$2");

  return text.trim();
}

async function fetchFromBolls(translation, bookNum, chapter) {
  const url = `${BOLLS_BASE}/${translation}/${bookNum}/${chapter}/`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const verses = [];
  for (const v of data) {
    const num = parseInt(v.verse);
    if (isNaN(num) || !v.text) continue;
    let text = cleanBollsText(v.text.trim());
    if (text) verses.push({ verse: num, text, red_letter: false });
  }
  verses.sort((a, b) => a.verse - b.verse);
  return verses.length > 0 ? verses : null;
}

// ── helloao.org API ────────────────────────────────────────────────────────
// Excellent for BSB and WEB (ENGWEBP) with poetry/footnote-free clean JSON
const HELLOAO_BASE = "https://bible.helloao.org/api";
const HELLOAO_MAP = { BSB: "BSB", WEB: "ENGWEBP" };

const BOOK_ID_MAP = {
  "Genesis":"GEN","Exodus":"EXO","Leviticus":"LEV","Numbers":"NUM",
  "Deuteronomy":"DEU","Joshua":"JOS","Judges":"JDG","Ruth":"RUT",
  "1 Samuel":"1SA","2 Samuel":"2SA","1 Kings":"1KI","2 Kings":"2KI",
  "1 Chronicles":"1CH","2 Chronicles":"2CH","Ezra":"EZR","Nehemiah":"NEH",
  "Esther":"EST","Job":"JOB","Psalms":"PSA","Proverbs":"PRO",
  "Ecclesiastes":"ECC","Song of Solomon":"SNG","Isaiah":"ISA",
  "Jeremiah":"JER","Lamentations":"LAM","Ezekiel":"EZK","Daniel":"DAN",
  "Hosea":"HOS","Joel":"JOL","Amos":"AMO","Obadiah":"OBA",
  "Jonah":"JON","Micah":"MIC","Nahum":"NAM","Habakkuk":"HAB",
  "Zephaniah":"ZEP","Haggai":"HAG","Zechariah":"ZEC","Malachi":"MAL",
  "Matthew":"MAT","Mark":"MRK","Luke":"LUK","John":"JHN",
  "Acts":"ACT","Romans":"ROM","1 Corinthians":"1CO","2 Corinthians":"2CO",
  "Galatians":"GAL","Ephesians":"EPH","Philippians":"PHP","Colossians":"COL",
  "1 Thessalonians":"1TH","2 Thessalonians":"2TH","1 Timothy":"1TI",
  "2 Timothy":"2TI","Titus":"TIT","Philemon":"PHM","Hebrews":"HEB",
  "James":"JAS","1 Peter":"1PE","2 Peter":"2PE","1 John":"1JN",
  "2 John":"2JN","3 John":"3JN","Jude":"JUD","Revelation":"REV",
};

function extractHelloaoText(contentArray) {
  return contentArray
    .map(item => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && typeof item.text === "string") return item.text;
      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchFromHelloAO(translationId, bookId, chapter) {
  const url = `${HELLOAO_BASE}/${translationId}/${bookId}/${chapter}.json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const content = json?.chapter?.content;
  if (!content) return null;

  const verses = [];
  for (const item of content) {
    if (item.type === "verse" && item.number && item.content) {
      const text = extractHelloaoText(item.content);
      if (text) verses.push({ verse: item.number, text, red_letter: false });
    }
  }
  return verses.length > 0 ? verses : null;
}

// ── Main handler ───────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { translation, book, chapter } = await req.json();
    if (!translation || !book || !chapter) {
      return Response.json({ error: 'Missing required params' }, { status: 400 });
    }

    const tCode = translation.toUpperCase();

    // 1. Check database first
    const dbVerses = await base44.asServiceRole.entities.Verse.filter({
      translation: tCode, book, chapter: Number(chapter),
    });
    if (dbVerses && dbVerses.length > 0) {
      dbVerses.sort((a, b) => a.verse - b.verse);
      return Response.json({ verses: dbVerses, source: 'database' });
    }

    // 2. bolls.life — primary CDN (supports 100+ translations including NIV, ESV, NLT, KJV, NKJV...)
    if (BOLLS_TRANSLATIONS.has(tCode)) {
      const bookNum = BOOK_NUM[book];
      if (bookNum) {
        const verses = await fetchFromBolls(tCode, bookNum, chapter);
        if (verses && verses.length > 0) {
          const result = verses.map(v => ({ translation: tCode, book, chapter: Number(chapter), ...v }));
          return Response.json({ verses: result, source: 'bolls' });
        }
      }
    }

    // 3. helloao.org — great for BSB and WEB (poetry-aware, footnote-free)
    const helloaoId = HELLOAO_MAP[tCode];
    const bookId = BOOK_ID_MAP[book];
    if (helloaoId && bookId) {
      const verses = await fetchFromHelloAO(helloaoId, bookId, chapter);
      if (verses && verses.length > 0) {
        const result = verses.map(v => ({ translation: tCode, book, chapter: Number(chapter), ...v }));
        return Response.json({ verses: result, source: 'helloao' });
      }
    }

    // 4. LLM fallback for anything else
    const rawText = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: "claude_sonnet_4_6",
      prompt: `Provide the complete and accurate text of ${book} chapter ${chapter} in the ${tCode} (${getFullName(tCode)}) translation of the Bible.

Format each verse on its own line as:
VERSE_NUM|verse text

Rules:
- Use ONLY the authentic ${tCode} wording
- Include ALL verses in the chapter
- One verse per line, number followed by pipe followed by text
- No extra commentary, headings, or formatting`,
    });

    if (rawText && typeof rawText === 'string') {
      const verses = [];
      for (const line of rawText.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.includes('|')) continue;
        const pipeIdx = trimmed.indexOf('|');
        const num = parseInt(trimmed.substring(0, pipeIdx).trim().replace(/\D/g, ''));
        const text = trimmed.substring(pipeIdx + 1).trim();
        if (!isNaN(num) && num > 0 && text.length > 0) {
          verses.push({ translation: tCode, book, chapter: Number(chapter), verse: num, text, red_letter: false });
        }
      }
      if (verses.length > 0) {
        return Response.json({ verses, source: 'llm' });
      }
    }

    return Response.json({ verses: [], source: 'empty' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getFullName(code) {
  const names = {
    NIV:"New International Version", ESV:"English Standard Version",
    NLT:"New Living Translation", AMP:"Amplified Bible",
    NASB:"New American Standard Bible", NKJV:"New King James Version",
    CSB:"Christian Standard Bible", MSG:"The Message",
    KJV:"King James Version", WEB:"World English Bible",
    ASV:"American Standard Version", BBE:"Bible in Basic English",
    BSB:"Berean Standard Bible", YLT:"Young's Literal Translation",
    DARBY:"Darby Translation", WNT:"Weymouth New Testament",
    ERV:"English Revised Version", NRSV:"New Revised Standard Version",
    ISV:"International Standard Version",
    // Spanish
    RVR1960:"Reina-Valera 1960", NVI:"Nueva Versión Internacional",
    PDDPT:"Palabra de Dios para Ti", BTX3:"Biblia Textual",
    RVA2015:"Reina Valera Actualizada 2015", LBLA:"La Biblia de las Américas",
    NTV:"Nueva Traducción Viviente",
    // Portuguese
    ARA:"Almeida Revisada Atualizada", ARC:"Almeida Revisada Clássica",
    NVT:"Nova Versão Transformadora",
    // French
    LSG:"Louis Segond 1910", NEG1979:"Nouvelle Edition Genève 1979",
    BDS:"Bible du Semeur",
    // Italian
    DIOD:"Bibbia Diodati", NRV:"Nuova Riveduta 2006",
  };
  return names[code] || code;
}