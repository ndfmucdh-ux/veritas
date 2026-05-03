import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const HELLOAO_BASE = "https://bible.helloao.org/api";

// Map our translation codes → helloao.org translation IDs
// Only translations confirmed to exist on helloao (others fall through to wldeh or LLM)
const HELLOAO_MAP = {
  BSB:  "BSB",
  WEB:  "ENGWEBP",
};

// Book name → helloao 3-letter book ID
const BOOK_ID_MAP = {
  "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM",
  "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
  "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Kings": "1KI", "2 Kings": "2KI",
  "1 Chronicles": "1CH", "2 Chronicles": "2CH", "Ezra": "EZR", "Nehemiah": "NEH",
  "Esther": "EST", "Job": "JOB", "Psalms": "PSA", "Proverbs": "PRO",
  "Ecclesiastes": "ECC", "Song of Solomon": "SNG", "Isaiah": "ISA",
  "Jeremiah": "JER", "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN",
  "Hosea": "HOS", "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA",
  "Jonah": "JON", "Micah": "MIC", "Nahum": "NAM", "Habakkuk": "HAB",
  "Zephaniah": "ZEP", "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL",
  "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN",
  "Acts": "ACT", "Romans": "ROM", "1 Corinthians": "1CO", "2 Corinthians": "2CO",
  "Galatians": "GAL", "Ephesians": "EPH", "Philippians": "PHP", "Colossians": "COL",
  "1 Thessalonians": "1TH", "2 Thessalonians": "2TH", "1 Timothy": "1TI",
  "2 Timothy": "2TI", "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB",
  "James": "JAS", "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JN",
  "2 John": "2JN", "3 John": "3JN", "Jude": "JUD", "Revelation": "REV",
};

// Fallback: wldeh/bible-api CDN (for KJV, ASV, WEB, BBE, Spanish PDDPT)
const WLDEH_BASE = "https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles";
const WLDEH_MAP = {
  KJV: { id: "en-kjv", bookLang: "en" },
  ASV: { id: "en-asv", bookLang: "en" },
  WEB: { id: "en-web", bookLang: "en" },
  BBE: { id: "en-bbe", bookLang: "en" },
  PDDPT: { id: "es-pddpt", bookLang: "es" },
  RVR1909: { id: "es-rvr1909", bookLang: "es" },
};

const ES_BOOK_SLUG = {
  "Genesis": "genesis", "Exodus": "exodo", "Leviticus": "levitico",
  "Numbers": "numeros", "Deuteronomy": "deuteronomio", "Joshua": "josue",
  "Judges": "jueces", "Ruth": "rut", "1 Samuel": "1samuel", "2 Samuel": "2samuel",
  "1 Kings": "1reyes", "2 Kings": "2reyes", "1 Chronicles": "1cronicas",
  "2 Chronicles": "2cronicas", "Ezra": "esdras", "Nehemiah": "nehemias",
  "Esther": "ester", "Job": "job", "Psalms": "salmos", "Proverbs": "proverbios",
  "Ecclesiastes": "eclesiastes", "Song of Solomon": "cantares", "Isaiah": "isaias",
  "Jeremiah": "jeremias", "Lamentations": "lamentaciones", "Ezekiel": "ezequiel",
  "Daniel": "daniel", "Hosea": "oseas", "Joel": "joel", "Amos": "amos",
  "Obadiah": "abdias", "Jonah": "jonas", "Micah": "miqueas", "Nahum": "nahum",
  "Habakkuk": "habacuc", "Zephaniah": "sofonias", "Haggai": "hageo",
  "Zechariah": "zacarias", "Malachi": "malaquias",
  "Matthew": "mateo", "Mark": "marcos", "Luke": "lucas", "John": "juan",
  "Acts": "hechos", "Romans": "romanos", "1 Corinthians": "1corintios",
  "2 Corinthians": "2corintios", "Galatians": "galatas", "Ephesians": "efesios",
  "Philippians": "filipenses", "Colossians": "colosenses",
  "1 Thessalonians": "1tesalonicenses", "2 Thessalonians": "2tesalonicenses",
  "1 Timothy": "1timoteo", "2 Timothy": "2timoteo", "Titus": "tito",
  "Philemon": "filemon", "Hebrews": "hebreos", "James": "santiago",
  "1 Peter": "1pedro", "2 Peter": "2pedro", "1 John": "1juan",
  "2 John": "2juan", "3 John": "3juan", "Jude": "judas", "Revelation": "apocalipsis",
};

// Extract plain text from helloao content array
// Handles: plain strings, {text} objects (poetry), {noteId} footnote refs, {lineBreak} markers
function extractText(contentArray) {
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
      const text = extractText(item.content);
      if (text) {
        verses.push({ verse: item.number, text, red_letter: false });
      }
    }
  }
  return verses.length > 0 ? verses : null;
}

async function fetchFromWldeh(versionId, bookSlug, chapter) {
  const url = `${WLDEH_BASE}/${versionId}/books/${bookSlug}/chapters/${chapter}.json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const data = json.data;
  if (!data || data.length === 0) return null;

  const chNum = String(chapter);
  const seen = new Set();
  const verses = [];
  for (const v of data) {
    const num = parseInt(v.verse);
    if (!isNaN(num) && !seen.has(num)) {
      seen.add(num);
      const text = v.text
        .replace(new RegExp(`\\s*${chNum}[.:]\\d+[\\s\\S]*$`), "")
        .replace(/¶\s*/g, "")
        .trim();
      verses.push({ verse: num, text, red_letter: false });
    }
  }
  verses.sort((a, b) => a.verse - b.verse);
  return verses.length > 0 ? verses : null;
}

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

    // 2. Try helloao.org (primary CDN — 1000+ translations, clean JSON)
    const helloaoId = HELLOAO_MAP[tCode];
    const bookId = BOOK_ID_MAP[book];
    if (helloaoId && bookId) {
      const verses = await fetchFromHelloAO(helloaoId, bookId, chapter);
      if (verses && verses.length > 0) {
        const result = verses.map(v => ({ translation: tCode, book, chapter: Number(chapter), ...v }));
        return Response.json({ verses: result, source: 'helloao' });
      }
    }

    // 3. Try wldeh/bible-api CDN (fallback for KJV, ASV, WEB, BBE, Spanish PDDPT)
    const wldehMapping = WLDEH_MAP[tCode];
    if (wldehMapping) {
      const bookSlug = wldehMapping.bookLang === "es"
        ? (ES_BOOK_SLUG[book] || book.toLowerCase())
        : book.toLowerCase().replace(/\s+/g, "");
      const verses = await fetchFromWldeh(wldehMapping.id, bookSlug, chapter);
      if (verses && verses.length > 0) {
        const result = verses.map(v => ({ translation: tCode, book, chapter: Number(chapter), ...v }));
        return Response.json({ verses: result, source: 'wldeh' });
      }
    }

    // 4. LLM fallback for copyrighted translations (NIV, ESV, NLT, etc.)
    const rawText = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: "claude_sonnet_4_6",
      prompt: `Provide the complete and accurate text of ${book} chapter ${chapter} in the ${tCode} (${getFullName(tCode)}) translation of the Bible.

Format each verse on its own line as:
VERSE_NUM|verse text

Example:
1|In the beginning God created the heavens and the earth.
2|Now the earth was formless and empty...

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
    NIV: "New International Version", ESV: "English Standard Version",
    NLT: "New Living Translation", AMP: "Amplified Bible",
    NASB: "New American Standard Bible", NKJV: "New King James Version",
    CSB: "Christian Standard Bible", MSG: "The Message",
    KJV: "King James Version", WEB: "World English Bible",
    ASV: "American Standard Version", BBE: "Bible in Basic English",
    BSB: "Berean Standard Bible", RVR1960: "Reina-Valera 1960",
    PDDPT: "Palabra de Dios para Ti",
  };
  return names[code] || code;
}