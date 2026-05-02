import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

    // Fallback: use bible-api.com (free, no key needed)
    const bookSlug = book.toLowerCase().replace(/\s+/g, '+');
    const url = `https://bible-api.com/${bookSlug}+${chapter}?translation=${translation.toLowerCase()}`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      const formattedVerses = (data.verses || []).map(v => ({
        translation,
        book,
        chapter: Number(chapter),
        verse: v.verse,
        text: v.text.trim(),
        red_letter: false,
        testament: Number(chapter) > 0 ? 'OT' : 'NT',
      }));
      return Response.json({ verses: formattedVerses, source: 'api' });
    }

    return Response.json({ verses: [], source: 'empty' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});