import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Bible books with chapter counts
const BIBLE_BOOKS = [
  { name: "Genesis", chapters: 50 }, { name: "Exodus", chapters: 40 }, { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 }, { name: "Deuteronomy", chapters: 34 }, { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 }, { name: "Ruth", chapters: 4 }, { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 }, { name: "1 Kings", chapters: 22 }, { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 }, { name: "2 Chronicles", chapters: 36 }, { name: "Ezra", chapters: 10 },
  { name: "Nehemiah", chapters: 13 }, { name: "Esther", chapters: 10 }, { name: "Job", chapters: 42 },
  { name: "Psalms", chapters: 150 }, { name: "Proverbs", chapters: 31 }, { name: "Ecclesiastes", chapters: 12 },
  { name: "Song of Solomon", chapters: 8 }, { name: "Isaiah", chapters: 66 }, { name: "Jeremiah", chapters: 52 },
  { name: "Lamentations", chapters: 5 }, { name: "Ezekiel", chapters: 48 }, { name: "Daniel", chapters: 12 },
  { name: "Hosea", chapters: 14 }, { name: "Joel", chapters: 3 }, { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 }, { name: "Jonah", chapters: 4 }, { name: "Micah", chapters: 7 },
  { name: "Nahum", chapters: 3 }, { name: "Habakkuk", chapters: 3 }, { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 }, { name: "Zechariah", chapters: 14 }, { name: "Malachi", chapters: 4 },
  { name: "Matthew", chapters: 28 }, { name: "Mark", chapters: 16 }, { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 }, { name: "Acts", chapters: 28 }, { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 }, { name: "2 Corinthians", chapters: 13 }, { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 }, { name: "Philippians", chapters: 4 }, { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 }, { name: "2 Thessalonians", chapters: 3 }, { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 }, { name: "Titus", chapters: 3 }, { name: "Philemon", chapters: 1 },
  { name: "Hebrews", chapters: 13 }, { name: "James", chapters: 5 }, { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 }, { name: "1 John", chapters: 5 }, { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 }, { name: "Jude", chapters: 1 }, { name: "Revelation", chapters: 22 },
];

const bibleIdMap = {
  'KJV': 1, 'NKJV': 114, 'NIV': 111, 'ESV': 59, 'NLT': 89, 'NASB': 12, 'AMP': 23,
  'CSB': 206, 'MSG': 67, 'NRSV': 76, 'ASV': 10, 'WEB': 206, 'BSB': 3034, 'YLT': 157,
  'ERV': 20, 'GNV': 22, 'AKJV': 8, 'HCSB': 39, 'ICB': 24, 'OEB': 300, 'DARBY': 16,
  'RVR1960': 149, 'NVI': 199, 'LBLA': 143, 'BTX3': 168, 'TLA': 193, 'DHH': 173,
  'NTV': 167, 'BLS': 156, 'RVR2020': 3624, 'ARA': 15, 'ARC': 5, 'NVT': 230,
  'LSG': 14, 'NEG1979': 63, 'BDS': 179, 'DIOD': 65, 'NRV': 73, 'CEI': 7,
  'LUT': 131, 'ELB': 18,
};

const bookUsfmMap = {
  'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
  'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
  '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH', 'Ezra': 'EZR',
  'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA', 'Proverbs': 'PRO',
  'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA', 'Jeremiah': 'JER',
  'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN', 'Hosea': 'HOS', 'Joel': 'JOL',
  'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON', 'Micah': 'MIC', 'Nahum': 'NAM',
  'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG', 'Zechariah': 'ZEC', 'Malachi': 'MAL',
  'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT', 'Romans': 'ROM',
  '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'Galatians': 'GAL', 'Ephesians': 'EPH',
  'Philippians': 'PHP', 'Colossians': 'COL', '1 Thessalonians': '1TH', '2 Thessalonians': '2TH',
  '1 Timothy': '1TI', '2 Timothy': '2TI', 'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB',
  'James': 'JAS', '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN',
  '3 John': '3JN', 'Jude': 'JUD', 'Revelation': 'REV',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { translation } = body;

    if (!translation) {
      return Response.json({ error: 'Missing translation code' }, { status: 400 });
    }

    const apiKey = Deno.env.get('YOUVERSION_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'YouVersion API key not configured' }, { status: 500 });
    }

    const bibleId = bibleIdMap[translation];
    if (!bibleId) {
      return Response.json({ error: `Translation '${translation}' not supported` }, { status: 400 });
    }

    // Fetch all chapters for the translation
    const allData = {};
    let processedChapters = 0;

    for (const book of BIBLE_BOOKS) {
      const bookUsfm = bookUsfmMap[book.name];
      if (!bookUsfm) continue;

      allData[book.name] = {};

      for (let ch = 1; ch <= book.chapters; ch++) {
        const passageId = `${bookUsfm}.${ch}`;
        
        try {
          const res = await fetch(
            `https://api.youversion.com/v1/bibles/${bibleId}/passages/${passageId}?format=text`,
            {
              headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
            }
          );

          if (res.ok) {
            const data = await res.json();
            const content = data.content || '';
            
            // Parse verses from content
            const verses = parseVerses(content);
            allData[book.name][ch] = verses;
          }

          processedChapters++;
        } catch (e) {
          console.error(`Failed to fetch ${passageId}:`, e.message);
          processedChapters++;
        }

        // Rate limiting: small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Return payload to send to client for IndexedDB storage
    return Response.json({
      success: true,
      code: translation,
      chapters_downloaded: processedChapters,
      data: allData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function parseVerses(content) {
  if (!content) return [];
  
  const lines = content.split('\n').filter(l => l.trim());
  const verses = [];

  lines.forEach(line => {
    const match = line.match(/^(\d+)\s+(.*)/);
    if (match) {
      const verseNum = parseInt(match[1]);
      const text = match[2].trim();
      verses.push({
        verse: verseNum,
        text: text,
      });
    } else if (verses.length > 0) {
      verses[verses.length - 1].text += ' ' + line.trim();
    }
  });

  return verses;
}