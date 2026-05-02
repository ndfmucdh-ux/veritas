import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// This function is called daily by automation to generate verse of the day
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const today = new Date().toISOString().split('T')[0];

    // Check if today's verse already exists
    const existing = await base44.asServiceRole.entities.DailyVerse.filter({ date: today });
    if (existing && existing.length > 0) {
      return Response.json({ message: 'Already generated', date: today });
    }

    // Generate new verse using AI
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Today is ${today}. Select an encouraging, uplifting Bible verse for "Verse of the Day" from the King James Bible.
      
      Choose a well-known verse that will inspire and encourage believers. Avoid repeating overused verses too often.
      Rotate through themes: faith, hope, love, strength, peace, wisdom, courage, grace, purpose.
      
      Return JSON with:
      - ref: The verse reference (e.g. "John 3:16")
      - book: Book name
      - chapter: Chapter number
      - verse: Verse number  
      - text: The full KJV verse text
      - reflection: A warm, personal 2-3 sentence devotional reflection on this verse
      - theme: One word theme`,
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
      chapter: Number(result.chapter),
      verse: Number(result.verse),
      translation: 'KJV',
      text: result.text,
      reflection: result.reflection,
      theme: result.theme,
    });

    console.log(`Daily verse generated for ${today}: ${result.ref}`);
    return Response.json({ success: true, dailyVerse });
  } catch (error) {
    console.error('Error generating daily verse:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});