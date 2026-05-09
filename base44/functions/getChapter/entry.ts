import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ── bolls.life API ─────────────────────────────────────────────────────────
const BOLLS_BASE = "https://bolls.life/get-chapter";

// Map from app translation codes → bolls.life short_name codes
// (some differ: RVR1960→RV1960, PDDPT→PDT, etc.)
const BOLLS_CODE_MAP = {
  // English
  KJV:"KJV", NKJV:"NKJV", NIV:"NIV", ESV:"ESV", NLT:"NLT",
  NASB:"NASB", AMP:"AMP", CSB:"CSB17", MSG:"MSG", ASV:"ASV",
  BBE:"BBE", WEB:"WEB", BSB:"BSB", YLT:"YLT", DARBY:"DARBY",
  WNT:"WNT", ERV:"ERV", NRSV:"NRSVCE", ISV:"ISV",
  // Spanish — verified codes on bolls.life
  NVI:"NVI", RVR1960:"RV1960", PDDPT:"PDT", BTX3:"LBLA", LBLA:"LBLA", NTV:"NTV",
  // Portuguese
  ARA:"ARA",
  // French
  BDS:"BDS",
};

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

// Clean bolls.life verse text
function cleanBollsText(raw) {
  let text = raw
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\b\d{1,5}\b/g, "")
    .replace(/([a-zA-Z])\d+/g, "$1")
    .replace(/\d+([a-zA-Z])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  // If a <br> separated a section heading from the verse, take only what follows
  const nlIdx = text.indexOf("\n");
  if (nlIdx > 0 && nlIdx < 120) {
    const after = text.substring(nlIdx + 1).trim();
    if (after.length > 10) text = after;
  }

  // Strip any leading quote/apostrophe that may wrap section headings in some translations (e.g. PDDPT)
  text = text.replace(/^['\u2018\u2019\u201c\u201d]+/, "").trim();

  // Detect and strip run-on section headings glued to verse text (no space between heading end and verse start).
  // The glueing point is always an ASCII lowercase letter immediately followed by an ASCII uppercase letter.
  // e.g. "Cristo viene al mundoAntes del comienzo" → glue at 'o'+'A' → "Antes del comienzo"
  // e.g. "Jesus and NicodemusNow there was" → glue at 's'+'N' → "Now there was"
  // We only look at the first 120 chars, and only strip if enough text remains after.
  // Using strict ASCII [a-z]/[A-Z] to avoid false matches on accented mid-word characters.
  const glueMatch = text.slice(0, 120).match(/^.{5,120}?[a-z]([A-Z][a-záéíóúüñàèìòùâêîôûäëïöüç])/);
  if (glueMatch) {
    const glueIdx = text.indexOf(glueMatch[1]);
    if (glueIdx > 4) {
      const after = text.slice(glueIdx).trim();
      if (after.length > 15) text = after;
    }
  }

  // Final cleanup of any leftover leading/trailing punctuation
  text = text.replace(/^[\s,.:;\u2018\u2019\u201c\u201d-]+/, "").trim();
  text = text.replace(/[\s'\u2018\u2019\u201d]+$/, "").trim();

  return text;
}

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function fetchFromBolls(bollsCode, bookNum, chapter) {
  const url = `${BOLLS_BASE}/${bollsCode}/${bookNum}/${chapter}/`;
  let res;
  try {
    res = await fetchWithTimeout(url, 8000);
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const verses = [];
  for (const v of data) {
    const num = parseInt(v.verse);
    if (isNaN(num) || !v.text) continue;
    const text = cleanBollsText(v.text.trim());
    if (text) verses.push({ verse: num, text, red_letter: false });
  }
  verses.sort((a, b) => a.verse - b.verse);
  return verses.length > 0 ? verses : null;
}

// ── helloao.org API ────────────────────────────────────────────────────────
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
  let res;
  try {
    res = await fetchWithTimeout(url, 8000);
  } catch {
    return null;
  }
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

// ── LLM fallback via base44 integrations (no user auth needed — uses service role) ──
async function fetchFromLLM(base44, tCode, book, chapter) {
  const fullName = TRANSLATION_NAMES[tCode] || tCode;
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Provide the complete and accurate text of ${book} chapter ${chapter} in the ${tCode} (${fullName}) translation of the Bible. Use ONLY the authentic ${tCode} wording. Include ALL verses. No commentary, headings, or footnotes.`,
    response_json_schema: {
      type: "object",
      properties: {
        verses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              verse: { type: "number" },
              text: { type: "string" }
            }
          }
        }
      }
    }
  });

  if (result && Array.isArray(result.verses) && result.verses.length > 0) {
    return result.verses
      .filter(v => v.verse > 0 && v.text)
      .map(v => ({ verse: v.verse, text: v.text.trim(), red_letter: false }));
  }
  return null;
}

const TRANSLATION_NAMES = {
  KJV:"King James Version", NKJV:"New King James Version",
  NIV:"New International Version", ESV:"English Standard Version",
  NLT:"New Living Translation", NASB:"New American Standard Bible",
  AMP:"Amplified Bible", CSB:"Christian Standard Bible",
  MSG:"The Message", ASV:"American Standard Version",
  BBE:"Bible in Basic English", WEB:"World English Bible",
  BSB:"Berean Standard Bible", YLT:"Young's Literal Translation",
  DARBY:"Darby Translation", WNT:"Weymouth New Testament",
  ERV:"Easy-to-Read Version", NRSV:"New Revised Standard Version",
  ISV:"International Standard Version",
  RVR1960:"Reina-Valera 1960", NVI:"Nueva Versión Internacional",
  PDDPT:"Palabra de Dios para Ti", BTX3:"Biblia Textual",
  RVA2015:"Reina Valera Actualizada 2015", LBLA:"La Biblia de las Américas",
  NTV:"Nueva Traducción Viviente",
  ARA:"Almeida Revisada Atualizada", ARC:"Almeida Revisada Clássica",
  NVT:"Nova Versão Transformadora",
  LSG:"Louis Segond 1910", NEG1979:"Nouvelle Edition Genève 1979",
  BDS:"Bible du Semeur",
  DIOD:"Bibbia Diodati", NRV:"Nuova Riveduta 2006",
};

// ── Main handler ───────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { translation, book, chapter } = await req.json();
    if (!translation || !book || !chapter) {
      return Response.json({ error: 'Missing required params' }, { status: 400 });
    }

    const tCode = translation.toUpperCase();

    // 1. Check database cache first (no auth needed — service role)
    const dbVerses = await base44.asServiceRole.entities.Verse.filter({
      translation: tCode, book, chapter: Number(chapter),
    });
    if (dbVerses && dbVerses.length > 0) {
      dbVerses.sort((a, b) => a.verse - b.verse);
      return Response.json({ verses: dbVerses, source: 'database' });
    }

    // 2. bolls.life — primary source, no auth needed, covers most translations
    const bollsCode = BOLLS_CODE_MAP[tCode];
    const bookNum = BOOK_NUM[book];
    if (bollsCode && bookNum) {
      const verses = await fetchFromBolls(bollsCode, bookNum, chapter);
      if (verses && verses.length > 0) {
        const result = verses.map(v => ({ translation: tCode, book, chapter: Number(chapter), ...v }));
        return Response.json({ verses: result, source: 'bolls' });
      }
    }

    // 3. helloao.org — great for BSB/WEB with clean poetry formatting
    const helloaoId = HELLOAO_MAP[tCode];
    const bookId = BOOK_ID_MAP[book];
    if (helloaoId && bookId) {
      const verses = await fetchFromHelloAO(helloaoId, bookId, chapter);
      if (verses && verses.length > 0) {
        const result = verses.map(v => ({ translation: tCode, book, chapter: Number(chapter), ...v }));
        return Response.json({ verses: result, source: 'helloao' });
      }
    }

    // 4. LLM fallback — for translations not available on CDNs (ARC, NVT, LSG, NEG1979, DIOD, NRV, RVA2015...)
    // base44.asServiceRole.integrations works WITHOUT user auth
    const llmVerses = await fetchFromLLM(base44, tCode, book, chapter);
    if (llmVerses && llmVerses.length > 0) {
      const result = llmVerses.map(v => ({ translation: tCode, book, chapter: Number(chapter), ...v }));
      return Response.json({ verses: result, source: 'llm' });
    }

    return Response.json({ verses: [], source: 'empty' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});