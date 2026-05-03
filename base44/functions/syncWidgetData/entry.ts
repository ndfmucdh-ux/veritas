import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const dailyVerses = await base44.entities.DailyVerse.filter({}, '-created_date', 1);
    const dailyVerse = dailyVerse?.[0];

    if (!dailyVerse) return Response.json({ error: 'No verse available' }, { status: 404 });

    const widgetRecord = await base44.entities.WidgetData.filter({ created_by: user.email }, '-updated_date', 1);
    
    if (widgetRecord?.length > 0) {
      await base44.entities.WidgetData.update(widgetRecord[0].id, {
        verse_of_day: dailyVerse.verse_ref,
        reflection: dailyVerse.reflection || "",
        theme: "dark"
      });
    } else {
      await base44.entities.WidgetData.create({
        verse_of_day: dailyVerse.verse_ref,
        reflection: dailyVerse.reflection || "",
        theme: "dark"
      });
    }

    return Response.json({ 
      verse: dailyVerse.verse_ref,
      reflection: dailyVerse.reflection,
      synced_at: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});