import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { book, depth = "overview" } = await req.json();
    if (!book) return Response.json({ error: 'Missing book' }, { status: 400 });

    const depthDescription = {
      overview: "high-level summary of key themes",
      detailed: "chapter-by-chapter breakdown with key verses",
      advanced: "detailed theological analysis with cross-references"
    }[depth] || "overview";

    const outline = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Create a comprehensive ${depthDescription} for the Bible book of ${book}. 
Format as a structured outline with:
- Main themes
- Key sections
- Important verses
- Theological significance

Make it study-friendly and suitable for personal Bible study.`,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          book: { type: "string" },
          themes: { type: "array", items: { type: "string" } },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                key_verses: { type: "array", items: { type: "string" } },
                summary: { type: "string" }
              }
            }
          },
          theology: { type: "string" }
        }
      }
    });

    return Response.json({ outline });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});