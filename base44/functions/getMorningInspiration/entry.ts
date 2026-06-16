import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get recent reading progress and plans
    const [progress, xpData] = await Promise.all([
      base44.entities.ReadingProgress.list('-created_date', 10),
      base44.entities.UserXP.list('-updated_date', 1),
    ]);

    const recentBooks = [...new Set((progress || []).map(p => p.book).filter(Boolean))].slice(0, 3);
    const planProgress = (progress || []).filter(p => p.plan_id).map(p => p.plan_id);
    const activePlan = planProgress.length > 0 ? [...new Set(planProgress)][0] : null;
    const level = xpData?.[0]?.level || 'Seeker';

    const contextInfo = recentBooks.length > 0
      ? `The user has recently been reading: ${recentBooks.join(', ')}.`
      : 'The user is just beginning their Bible reading journey.';

    const planInfo = activePlan
      ? `They are currently following the "${activePlan}" devotional plan.`
      : 'They have not started a devotional plan yet.';

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a wise, gentle spiritual companion. Generate a personalized morning inspiration verse for a Bible app user.

${contextInfo} ${planInfo} Their current level is: ${level}.

Respond with a JSON object containing:
- verse_ref: a specific Bible verse reference (e.g. "Romans 8:28")  
- verse_text: the exact KJV text of that verse
- book: just the book name (e.g. "Romans")
- chapter: the chapter number
- reflection: a warm, 2-3 sentence personalized reflection that connects to their recent reading context
- theme: one word theme (e.g. "hope", "strength", "grace", "peace")

Choose a verse that feels like a gentle nudge forward, not random — one that connects thematically to where they've been reading.`,
      response_json_schema: {
        type: "object",
        properties: {
          verse_ref: { type: "string" },
          verse_text: { type: "string" },
          book: { type: "string" },
          chapter: { type: "number" },
          reflection: { type: "string" },
          theme: { type: "string" },
        }
      }
    });

    return Response.json({ inspiration: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});