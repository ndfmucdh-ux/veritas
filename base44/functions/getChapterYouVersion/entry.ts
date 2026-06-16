import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Full YouVersion Bible ID map — all translations available in the app
const BIBLE_ID_MAP = {
  // English
  KJV: 1, NKJV: 114, NIV: 111, ESV: 59, NLT: 89, NASB: 12, AMP: 23,
  CSB: 206, MSG: 67, NRSV: 76, ASV: 10, WEB: 206, BSB: 3034, YLT: 157,
  ERV: 20, GNV: 22, AKJV: 8, HCSB: 39, ICB: 24, OEB: 300, DARBY: 16,
  WNT: 46, AENT: 3109, RV: 31, EBR: 19, ABP: 3050, MOUNCE: 65, DBY: 2882,
  DRA: 48, WYC: 47, WILLIAMS: 49, NAB: 32, NCV: 81, NIRV: 113, ISV: 121,
  TLB: 51, NASB1995: 100, NASB2020: 3624, HCSB2: 40, MEV: 3028, TPT: 3053,
  CEV: 3078, GNT: 3079, VOICE: 3085, JUB: 3077, ESVA: 60, NETBM: 107,
  BBE2: 3032, NTXR: 3056, TCL: 69, TCINT: 42, VW: 44, NKC: 115,
  JKNT: 3020, TPNT: 3013, KJV2000: 3026, NLV: 3024, ACV: 3023,
  // Spanish
  RVR1960: 149, NVI: 199, LBLA: 143, BTX3: 168, TLA: 193, DHH: 173,
  NTV: 167, BLS: 156, RVR2020: 3624, PDT: 182, PDDPT: 187, RVA: 146,
  RV60: 150, VIN: 188, SBD: 3600, NVIC: 200, NVIA: 3601, NVI2: 3602,
  NVISTD: 3603, VPAD: 3604, LBLA88: 144, VPCI: 3610, VPSD: 3611,
  // Portuguese
  ARA: 15, ARC: 5, NVT: 230, BPT: 54, BRA: 52,
  // French
  LSG: 14, NEG1979: 63, BDS: 179, SG21: 212, FC97: 27,
  // Italian
  DIOD: 65, NRV: 73, CEI: 7, NBDC: 68,
  // German
  LUT: 131, ELB: 18,
};

const BOOK_USFM_MAP = {
  'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM',
  'Deuteronomy': 'DEU', 'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT',
  '1 Samuel': '1SA', '2 Samuel': '2SA', '1 Kings': '1KI', '2 Kings': '2KI',
  '1 Chronicles': '1CH', '2 Chronicles': '2CH', 'Ezra': 'EZR', 'Nehemiah': 'NEH',
  'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA', 'Proverbs': 'PRO',
  'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA', 'Jeremiah': 'JER',
  'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN', 'Hosea': 'HOS',
  'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON',
  'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP',
  'Haggai': 'HAG', 'Zechariah': 'ZEC', 'Malachi': 'MAL', 'Matthew': 'MAT',
  'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT',
  'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'Galatians': 'GAL',
  'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL', '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI', 'Titus': 'TIT',
  'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS', '1 Peter': '1PE',
  '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN', '3 John': '3JN',
  'Jude': 'JUD', 'Revelation': 'REV',
};

function parseVerses(data) {
  if (!data) return [];
  const verses = [];

  if (Array.isArray(data.verses)) {
    // YouVersion nodejs API response format
    for (const v of data.verses) {
      const text = (v.content || v.text || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\[.*?\]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
      const verseNum = v.verse_start || v.verse || 0;
      if (verseNum > 0 && text) {
        verses.push({ verse: verseNum, text, red_letter: false });
      }
    }
  } else if (typeof data.content === 'string') {
    // Plain text fallback — parse "1 text..." lines
    const lines = data.content.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const match = line.match(/^(\d+)\s+(.*)/);
      if (match) {
        verses.push({ verse: parseInt(match[1]), text: match[2].trim(), red_letter: false });
      } else if (verses.length > 0) {
        verses[verses.length - 1].text += ' ' + line.trim();
      }
    }
  }

  verses.sort((a, b) => a.verse - b.verse);
  return verses;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { book, chapter, translation } = body;

    if (!book || !chapter || !translation) {
      return Response.json({ error: 'Missing book, chapter, or translation' }, { status: 400 });
    }

    const apiKey = Deno.env.get('YOUVERSION_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'YouVersion API key not configured', fallback: true }, { status: 500 });
    }

    const tCode = translation.toUpperCase();
    const bibleId = BIBLE_ID_MAP[tCode];
    if (!bibleId) {
      return Response.json({ error: `Translation '${tCode}' not mapped`, fallback: true }, { status: 400 });
    }

    const bookUsfm = BOOK_USFM_MAP[book];
    if (!bookUsfm) {
      return Response.json({ error: `Book '${book}' not recognized`, fallback: true }, { status: 400 });
    }

    const usfm = `${bookUsfm}.${chapter}`;
    const url = `https://nodejs.bible.com/api/bible/chapter.json?id=${bibleId}&osis=${usfm}`;

    const res = await fetch(url, {
      headers: {
        'X-YouVersion-Developer-Token': apiKey,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return Response.json({
        error: `YouVersion API failed: ${res.status}`,
        fallback: true,
      }, { status: res.status >= 500 ? 500 : 400 });
    }

    const data = await res.json();
    const verses = parseVerses(data);

    if (verses.length === 0) {
      return Response.json({ error: 'No verses returned', fallback: true }, { status: 422 });
    }

    return Response.json({ verses });
  } catch (error) {
    return Response.json({ error: error.message, fallback: true }, { status: 500 });
  }
});