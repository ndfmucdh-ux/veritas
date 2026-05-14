import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
      return Response.json({ error: 'YouVersion API key not configured' }, { status: 500 });
    }

    // Map translation code to YouVersion Bible ID
    // This is a starter mapping — expand as needed
    const bibleIdMap = {
      'KJV': 1, // King James Version
      'ESV': 59, // English Standard Version
      'NIV': 111, // New International Version
      'NASB': 12, // New American Standard Bible
      'NKJV': 114, // New King James Version
      'RVR1960': 149, // Spanish: Reina-Valera 1960
      'NVI': 199, // Spanish: Nueva Versión Internacional
      'ACF': 217, // Spanish: Almeida Corregida y Fervorosa
    };

    const bibleId = bibleIdMap[translation];
    if (!bibleId) {
      return Response.json({ error: `Translation '${translation}' not mapped to YouVersion Bible ID` }, { status: 400 });
    }

    // Convert book name to USFM format
    const bookUsfmMap = {
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

    const bookUsfm = bookUsfmMap[book];
    if (!bookUsfm) {
      return Response.json({ error: `Book '${book}' not recognized` }, { status: 400 });
    }

    const passageId = `${bookUsfm}.${chapter}`;

    // Fetch from YouVersion API
    const res = await fetch(
      `https://api.youversion.com/v1/bibles/${bibleId}/passages/${passageId}?format=text`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!res.ok) {
      // Fall back to current system on failure
      return Response.json({
        error: `YouVersion API failed: ${res.status}`,
        fallback: true,
      }, { status: 500 });
    }

    const data = await res.json();
    const content = data.content || '';

    // Parse verses from response content
    // YouVersion returns plain text or HTML; parse into verse objects
    const verses = parseVerses(content, book, chapter);

    return Response.json({ verses });
  } catch (error) {
    return Response.json({ error: error.message, fallback: true }, { status: 500 });
  }
});

// Simple verse parser — splits content by verse markers
function parseVerses(content, book, chapter) {
  if (!content) return [];

  // Split by verse numbers (e.g., "1 ", "2 ", etc.)
  const lines = content.split('\n').filter(l => l.trim());
  const verses = [];
  let currentVerse = 1;

  lines.forEach(line => {
    const match = line.match(/^(\d+)\s+(.*)/);
    if (match) {
      const verseNum = parseInt(match[1]);
      const text = match[2].trim();
      verses.push({
        verse: verseNum,
        text: text,
        red_letter: false,
      });
      currentVerse = verseNum + 1;
    } else if (verses.length > 0) {
      // Append to previous verse if no number marker
      verses[verses.length - 1].text += ' ' + line.trim();
    }
  });

  return verses;
}