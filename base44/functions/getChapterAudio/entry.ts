import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { book, chapter, translation, verse } = body;

    if (!book || !chapter || !translation) {
      return Response.json({ error: 'Missing book, chapter, or translation' }, { status: 400 });
    }

    const apiKey = Deno.env.get('YOUVERSION_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'YouVersion API key not configured' }, { status: 500 });
    }

    // Map translation code to YouVersion Bible ID
    const bibleIdMap = {
      'KJV': 1, 'NKJV': 114, 'NIV': 111, 'ESV': 59, 'NLT': 89, 'NASB': 12, 'AMP': 23,
      'CSB': 206, 'MSG': 67, 'NRSV': 76, 'ASV': 10, 'WEB': 206, 'BSB': 3034, 'YLT': 157,
      'ERV': 20, 'GNV': 22, 'AKJV': 8, 'HCSB': 39, 'ICB': 24, 'OEB': 300, 'DARBY': 16,
      'WNT': 46, 'RVR1960': 149, 'NVI': 199, 'LBLA': 143, 'BTX3': 168, 'TLA': 193, 'DHH': 173,
      'NTV': 167, 'BLS': 156, 'RVR2020': 3624, 'ARA': 15, 'ARC': 5, 'NVT': 230, 'LSG': 14,
      'NEG1979': 63, 'BDS': 179, 'DIOD': 65, 'NRV': 73, 'CEI': 7, 'LUT': 131, 'ELB': 18,
    };

    const bibleId = bibleIdMap[translation];
    if (!bibleId) {
      return Response.json({ error: `Translation '${translation}' not mapped` }, { status: 400 });
    }

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

    // Build passage reference
    const passageId = verse ? `${bookUsfm}.${chapter}.${verse}` : `${bookUsfm}.${chapter}`;

    // Fetch audio from YouVersion API
    const res = await fetch(
      `https://api.youversion.com/v1/bibles/${bibleId}/passages/${passageId}?format=audio`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!res.ok) {
      return Response.json({ error: `YouVersion audio API failed: ${res.status}` }, { status: 500 });
    }

    const data = await res.json();
    
    // YouVersion audio response includes audio_url and metadata
    return Response.json({
      audio_url: data.audio_url || data.url,
      duration: data.duration,
      narrator: data.narrator,
      format: data.format || 'mp3',
      passage: data.passage || passageId,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});