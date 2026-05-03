import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Translations natively supported by bible-api.com
const BIBLE_API_SUPPORTED = ["kjv", "bbe", "webbe"];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { translation, book, chapter } = await req.json();
    if (!translation || !book || !chapter) {
      return Response.json({ error: 'Missing required params' }, { status: 400 });
    }

    // 1. Try database first
    const dbVerses = await base44.asServiceRole.entities.Verse.filter({
      translation, book, chapter: Number(chapter),
    });
    if (dbVerses && dbVerses.length > 0) {
      dbVerses.sort((a, b) => a.verse - b.verse);
      return Response.json({ verses: dbVerses, source: 'database' });
    }

    const translationCode = translation.toLowerCase();
    // v3 - LLM translation support

    // 2. For KJV/BBE/WEBBE — use bible-api.com directly
    if (BIBLE_API_SUPPORTED.includes(translationCode)) {
      const bookSlug = book.toLowerCase().replace(/\s+/g, '+');
      const res = await fetch(`https://bible-api.com/${bookSlug}+${chapter}?translation=${translationCode}`);
      if (res.ok) {
        const data = await res.json();
        if (data.verses && data.verses.length > 0) {
          const verses = data.verses.map(v => ({
            translation, book, chapter: Number(chapter),
            verse: v.verse, text: v.text.trim(), red_letter: false,
          }));
          return Response.json({ verses, source: 'bible-api' });
        }
      }
    }

    // 3. For all other translations (NIV, ESV, NLT, AMP, NASB, NKJV, CSB, MSG, etc.)
    //    Use the LLM to get the accurate translation text
    const rawText = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: "claude_sonnet_4_6",
      prompt: `Provide the complete and accurate text of ${book} chapter ${chapter} in the ${translation} (${getFullName(translation)}) translation of the Bible.

Format each verse on its own line as:
VERSE_NUM|verse text

Example:
1|In the beginning God created the heavens and the earth.
2|Now the earth was formless and empty...

Rules:
- Use ONLY the authentic ${translation} wording (not KJV, not paraphrase unless ${translation} is MSG)
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
        const numStr = trimmed.substring(0, pipeIdx).trim().replace(/\D/g, '');
        const num = parseInt(numStr);
        const text = trimmed.substring(pipeIdx + 1).trim();
        if (!isNaN(num) && num > 0 && text.length > 0) {
          verses.push({ translation, book, chapter: Number(chapter), verse: num, text, red_letter: false });
        }
      }
      if (verses.length > 0) {
        return Response.json({ verses, source: 'llm' });
      }
    }

    // Last resort: KJV fallback so the reader never shows blank
    const bookSlug = book.toLowerCase().replace(/\s+/g, '+');
    const fallback = await fetch(`https://bible-api.com/${bookSlug}+${chapter}?translation=kjv`);
    if (fallback.ok) {
      const fd = await fallback.json();
      if (fd.verses?.length > 0) {
        const verses = fd.verses.map(v => ({
          translation, book, chapter: Number(chapter),
          verse: v.verse, text: v.text.trim(), red_letter: false,
        }));
        return Response.json({ verses, source: 'fallback-kjv' });
      }
    }

    return Response.json({ verses: [], source: 'empty' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getFullName(code) {
  const names = {
    NIV: "New International Version",
    ESV: "English Standard Version",
    NLT: "New Living Translation",
    AMP: "Amplified Bible",
    NASB: "New American Standard Bible",
    NKJV: "New King James Version",
    CSB: "Christian Standard Bible",
    MSG: "The Message",
    KJV: "King James Version",
    RVR1960: "Reina-Valera 1960",
    NVI: "Nueva Version Internacional",
    LBLA: "La Biblia de las Américas",
    DHH: "Dios Habla Hoy",
    TLA: "Traducción en Lenguaje Actual",
  };
  return names[code] || code;
}