import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Maps our translation codes to API.Bible IDs
const BIBLE_IDS = {
  KJV:  "de4e12af7f28f599-01",
  NIV:  "06125adad2d5898a-01",
  ESV:  "f72b840c855f362c-04",
  NLT:  "65eec8e0b60e656b-01",
  NASB: "9879dbb7cfe39e4d-04",
  AMP:  "392a8286c3d96fc2-01",
  MSG:  "65eec8e0b60e656b-01", // fallback to NLT if MSG not available
  NKJV: "40072c4a5aba4022-01",
  CSB:  "a556c5305ee15c3e-01",
  NLV:  "65eec8e0b60e656b-01",
};

// Book name to OSIS ID for API.Bible
const BOOK_IDS = {
  "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM",
  "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
  "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Kings": "1KI", "2 Kings": "2KI",
  "1 Chronicles": "1CH", "2 Chronicles": "2CH", "Ezra": "EZR", "Nehemiah": "NEH",
  "Esther": "EST", "Job": "JOB", "Psalms": "PSA", "Proverbs": "PRO",
  "Ecclesiastes": "ECC", "Song of Solomon": "SNG", "Isaiah": "ISA", "Jeremiah": "JER",
  "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN", "Hosea": "HOS",
  "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA", "Jonah": "JON", "Micah": "MIC",
  "Nahum": "NAM", "Habakkuk": "HAB", "Zephaniah": "ZEP", "Haggai": "HAG",
  "Zechariah": "ZEC", "Malachi": "MAL",
  "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN", "Acts": "ACT",
  "Romans": "ROM", "1 Corinthians": "1CO", "2 Corinthians": "2CO", "Galatians": "GAL",
  "Ephesians": "EPH", "Philippians": "PHP", "Colossians": "COL",
  "1 Thessalonians": "1TH", "2 Thessalonians": "2TH", "1 Timothy": "1TI",
  "2 Timothy": "2TI", "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB",
  "James": "JAS", "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JN",
  "2 John": "2JN", "3 John": "3JN", "Jude": "JUD", "Revelation": "REV",
  "Psalm": "PSA",
};

// Translations supported by bible-api.com as fallback
const BIBLE_API_SUPPORTED = ["kjv", "bbe", "webbe", "oeb-cw", "oeb-us", "clementine", "almeida", "rccv"];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { translation, book, chapter } = await req.json();
    if (!translation || !book || !chapter) {
      return Response.json({ error: 'Missing required params: translation, book, chapter' }, { status: 400 });
    }

    // Try database first
    const verses = await base44.asServiceRole.entities.Verse.filter({
      translation,
      book,
      chapter: Number(chapter),
    });

    if (verses && verses.length > 0) {
      verses.sort((a, b) => a.verse - b.verse);
      return Response.json({ verses, source: 'database' });
    }

    const apiKey = Deno.env.get("SCRIPTURE_API_KEY");
    const bibleId = BIBLE_IDS[translation];
    const bookId = BOOK_IDS[book];

    // Try API.Bible if we have a key and know the IDs
    if (apiKey && bibleId && bookId) {
      const chapterId = `${bookId}.${chapter}`;
      const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`;
      const res = await fetch(url, { headers: { "api-key": apiKey } });

      if (res.ok) {
        const data = await res.json();
        const content = data?.data?.content || [];
        const formattedVerses = extractVerses(content, translation, book, Number(chapter));
        if (formattedVerses.length > 0) {
          return Response.json({ verses: formattedVerses, source: 'apibible' });
        }
      }
    }

    // Fallback: use bible-api.com (supports KJV and a few others)
    const translationCode = translation.toLowerCase();
    const apiTranslation = BIBLE_API_SUPPORTED.includes(translationCode) ? translationCode : "kjv";
    const bookSlug = book.toLowerCase().replace(/\s+/g, '+');
    const fallbackUrl = `https://bible-api.com/${bookSlug}+${chapter}?translation=${apiTranslation}`;
    const fallbackRes = await fetch(fallbackUrl);

    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      const formattedVerses = (fallbackData.verses || []).map(v => ({
        translation,
        book,
        chapter: Number(chapter),
        verse: v.verse,
        text: v.text.trim(),
        red_letter: false,
      }));
      return Response.json({ verses: formattedVerses, source: 'bible-api' });
    }

    return Response.json({ verses: [], source: 'empty' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Extract verse objects from API.Bible JSON content tree
function extractVerses(content, translation, book, chapter) {
  const verses = [];
  let currentVerseNum = null;
  let currentText = "";

  function traverse(node) {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(traverse); return; }
    if (typeof node === "object") {
      if (node.type === "verse" && node.number) {
        if (currentVerseNum !== null && currentText.trim()) {
          verses.push({ translation, book, chapter, verse: parseInt(currentVerseNum), text: currentText.trim(), red_letter: false });
        }
        currentVerseNum = node.number;
        currentText = "";
      }
      if (node.type === "text" && node.text) {
        currentText += node.text;
      }
      if (node.items) traverse(node.items);
      if (node.content) traverse(node.content);
    }
  }

  traverse(content);

  if (currentVerseNum !== null && currentText.trim()) {
    verses.push({ translation, book, chapter, verse: parseInt(currentVerseNum), text: currentText.trim(), red_letter: false });
  }

  return verses;
}