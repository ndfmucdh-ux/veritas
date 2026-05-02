import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic, category, verse_ref } = await req.json();

    const prompt = verse_ref
      ? `Write a rich, spiritually deep devotional for the verse: ${verse_ref}.
         Include: an opening reflection (2 paragraphs), key insights, a practical application, and a closing prayer.
         Make it warm, personal, and biblically grounded.`
      : `Write a daily devotional on the topic "${topic || 'faith'}" for ${category || 'general'} audience.
         Include: a key verse, opening reflection (2 paragraphs), key insights, a practical application, and a closing prayer.
         Make it warm, personal, and biblically grounded.`;

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