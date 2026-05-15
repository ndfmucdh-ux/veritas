import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Returns a short AI-generated prayer or thought-provoking question for a given verse.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { verseRef, verseText } = await req.json();
    if (!verseRef || !verseText) {
      return Response.json({ error: 'Missing verseRef or verseText' }, { status: 400 });
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this Bible verse:
"${verseText}" (${verseRef})

Generate ONE of the following (randomly alternate between them):
- A short, heartfelt prayer (2-3 sentences) inspired by this verse
- A single thought-provoking reflection question that helps the reader apply this verse to their daily life

Keep it brief (under 60 words), personal, and spiritually meaningful. Do not include a label like "Prayer:" or "Question:" — just the content itself.`,
      response_json_schema: {
        type: "object",
        properties: {
          reflection: { type: "string" },
          type: { type: "string", enum: ["prayer", "question"] }
        },
        required: ["reflection", "type"]
      }
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});