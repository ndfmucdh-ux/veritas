import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const today = new Date().toISOString().split('T')[0];

    // Check if today's verse already exists
    const existing = await base44.asServiceRole.entities.DailyVerse.filter({ date: today });
    if (existing && existing.length > 0) {
      return Response.json({ dailyVerse: existing[0] });
    }

    // Generate new verse of the day using AI
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Today is ${today}. Select a meaningful, encouraging Bible verse for "Verse of the Day".
      
      Choose from well-known uplifting verses. Return JSON:
      {
        "ref": "John 3:16",
        "book": "John", 
        "chapter": 3,
        "verse": 16,
        "text": "For God so loved the world...",
        "reflection": "A 2-3 sentence devotional reflection on this verse",
        "theme": "love"
      }`,
      response_json_schema: {
        type: "object",
        properties: {
          ref: { type: "string" },
          book: { type: "string" },
          chapter: { type: "number" },
          verse: { type: "number" },
          text: { type: "string" },
          reflection: { type: "string" },
          theme: { type: "string" }
        }
      }
    });

    const dailyVerse = await base44.asServiceRole.entities.DailyVerse.create({
      date: today,
      verse_ref: result.ref,
      book: result.book,
      chapter: result.chapter,
      verse: result.verse,
      translation: 'KJV',
      text: result.text,
      reflection: result.reflection,
      theme: result.theme,
    });

    return Response.json({ dailyVerse });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});