import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { verse_ref, mood = "grateful" } = await req.json();
    if (!verse_ref) return Response.json({ error: 'Missing verse_ref' }, { status: 400 });

    const moodDescriptions = {
      grateful: "expressing gratitude and thanksgiving",
      confessing: "acknowledging shortcomings and seeking forgiveness",
      interceding: "praying for others and their needs",
      celebrating: "rejoicing and celebrating God's goodness"
    };

    const guidedPrayer = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Create a brief, beautiful guided prayer based on the verse "${verse_ref}". The prayer should be ${moodDescriptions[mood]} and approximately 2-3 paragraphs. Make it personal, reflective, and spiritually uplifting.`,
      model: "claude_sonnet_4_6"
    });

    const prayerRecord = await base44.entities.PrayerJournal.create({
      verse_ref,
      prayer_text: guidedPrayer,
      mood,
      tags: [mood]
    });

    return Response.json({ 
      prayer: guidedPrayer, 
      prayer_id: prayerRecord.id,
      verse_ref,
      mood 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});