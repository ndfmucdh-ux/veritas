import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Map our translation codes to wldeh/bible-api version IDs
// Book names in these translations use English (john, genesis, etc.)
const TRANSLATION_MAP = {
  KJV:     { id: "en-kjv",    bookLang: "en" },
  ASV:     { id: "en-asv",    bookLang: "en" },
  WEB:     { id: "en-web",    bookLang: "en" },
  BBE:     { id: "en-bbe",    bookLang: "en" },
  T4T:     { id: "en-t4t",    bookLang: "en" },
  // Spanish translations
  PDDPT:   { id: "es-pddpt",  bookLang: "es" },
  RVR1909: { id: "es-rvr1909",bookLang: "es" },
};

// Spanish book name map (book display name -> spanish URL slug)
const ES_BOOK_MAP = {
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

const CDN_BASE = "https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles";

async function fetchFromCDN(versionId, bookSlug, chapter) {
  const url = `${CDN_BASE}/${versionId}/books/${bookSlug}/chapters/${chapter}.json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const data = json.data;
  if (!data || data.length === 0) return null;
  // Deduplicate — CDN sometimes returns verses twice
  const seen = new Set();
  const verses = [];
  for (const v of data) {
    const num = parseInt(v.verse);
    if (!isNaN(num) && !seen.has(num)) {
      seen.add(num);
      // Strip inline footnotes:
      //  KJV: "...waters.23.2 green…: Heb. pastures"  (no space before chapter.verse)
      //  WEB: "...anew, 3:3 The word translated..."     (space before chapter:verse)
      const chNum = String(chapter);
      const text = v.text
        .replace(new RegExp(`\\s*${chNum}[.:]\\d+[\\s\\S]*$`), "")
        .replace(/¶\s*/g, "")
        .trim();
      verses.push({ verse: num, text, red_letter: false });
    }
  }
  verses.sort((a, b) => a.verse - b.verse);
  return verses;
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

    // 1. Check database first
    const dbVerses = await base44.asServiceRole.entities.Verse.filter({
      translation, book, chapter: Number(chapter),
    });
    if (dbVerses && dbVerses.length > 0) {
      dbVerses.sort((a, b) => a.verse - b.verse);
      return Response.json({ verses: dbVerses, source: 'database' });
    }

    // 2. Try wldeh/bible-api CDN
    const mapping = TRANSLATION_MAP[translation.toUpperCase()];
    if (mapping) {
      const bookSlug = mapping.bookLang === "es"
        ? (ES_BOOK_MAP[book] || book.toLowerCase())
        : book.toLowerCase().replace(/\s+/g, "");
      const verses = await fetchFromCDN(mapping.id, bookSlug, chapter);
      if (verses && verses.length > 0) {
        const result = verses.map(v => ({ translation, book, chapter: Number(chapter), ...v }));
        return Response.json({ verses: result, source: 'cdn' });
      }
    }

    // 3. For copyrighted translations (NIV, ESV, NLT, AMP, NASB, NKJV, CSB, MSG)
    //    Use LLM to generate accurate translation text
    const rawText = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: "claude_sonnet_4_6",
      prompt: `Provide the complete and accurate text of ${book} chapter ${chapter} in the ${translation} (${getFullName(translation)}) translation of the Bible.

Format each verse on its own line as:
VERSE_NUM|verse text

Example:
1|In the beginning God created the heavens and the earth.
2|Now the earth was formless and empty...

Rules:
- Use ONLY the authentic ${translation} wording
- Include ALL verses in the chapter
- One verse per line, number followed by pipe followed by text
- No extra commentary, headings, or formatting`,
    });

    if (rawText && typeof rawText === 'string') {
      const lines = rawText.split('\n');
      const verses = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.includes('|')) continue;
        const pipeIdx = trimmed.indexOf('|');
        const num = parseInt(trimmed.substring(0, pipeIdx).trim().replace(/\D/g, ''));
        const text = trimmed.substring(pipeIdx + 1).trim();
        if (!isNaN(num) && num > 0 && text.length > 0) {
          verses.push({ translation, book, chapter: Number(chapter), verse: num, text, red_letter: false });
        }
      }
      if (verses.length > 0) {
        return Response.json({ verses, source: 'llm' });
      }
    }

    // 4. Last resort KJV fallback
    const kjvVerses = await fetchFromCDN("en-kjv", book.toLowerCase().replace(/\s+/g, ""), chapter);
    if (kjvVerses && kjvVerses.length > 0) {
      const result = kjvVerses.map(v => ({ translation: "KJV", book, chapter: Number(chapter), ...v }));
      return Response.json({ verses: result, source: 'fallback-kjv' });
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
    RVR1960: "Reina-Valera 1960", NVI: "Nueva Versión Internacional",
    PDDPT: "Palabra de Dios para Ti",
  };
  return names[code.toUpperCase()] || code;
}