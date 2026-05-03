import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic, category, verse_ref } = await req.json();

    const STYLE_RULE = `Important style rules: In all your narrative text (reflections, insights, applications, prayers), always use "Father" instead of "God" or "Dios", and always refer to the Bible as "Sacred Scriptures" (or "Sagradas Escrituras" in Spanish) instead of "Bible" or "Biblia". Exception: when quoting or referencing a direct Bible verse citation (e.g. "John 3:16"), keep the original wording of the verse text itself unchanged.`;

    const prompt = verse_ref
      ? `Write a rich, spiritually deep devotional for the verse: ${verse_ref}.
         Include: an opening reflection (2 paragraphs), key insights, a practical application, and a closing prayer.
         Make it warm, personal, and biblically grounded. ${STYLE_RULE}`
      : `Write a daily devotional on the topic "${topic || 'faith'}" for ${category || 'general'} audience.
         Include: a key verse, opening reflection (2 paragraphs), key insights, a practical application, and a closing prayer.
         Make it warm, personal, and biblically grounded. ${STYLE_RULE}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          key_verse: { type: "string" },
          key_verse_text: { type: "string" },
          reflection: { type: "string" },
          insights: { type: "array", items: { type: "string" } },
          application: { type: "string" },
          prayer: { type: "string" }
        }
      }
    });

    return Response.json({ devotional: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});