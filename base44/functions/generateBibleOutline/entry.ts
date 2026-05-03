import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { book, depth = "overview", language = "en" } = await req.json();
    if (!book) return Response.json({ error: 'Missing book' }, { status: 400 });

    const depthDescription = {
      overview: "high-level summary of key themes",
      detailed: "chapter-by-chapter breakdown with key verses",
      advanced: "detailed theological analysis with cross-references"
    }[depth] || "overview";

    const languageInstruction = language === "es" 
      ? "Respond entirely in Spanish."
      : language === "pt"
      ? "Respond entirely in Portuguese."
      : "Respond in English.";

    const outline = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Create a comprehensive ${depthDescription} for the Bible book of ${book}. 
${languageInstruction}
Format as a structured outline with:
- Main themes (list of 4-6 themes)
- Key sections (3-5 sections with title, summary, key verses)
- Theological significance

Make it study-friendly and suitable for personal Bible study. Keep responses concise.`,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          book: { type: "string" },
          themes: { type: "array", items: { type: "string" }, minItems: 1 },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                key_verses: { type: "array", items: { type: "string" } }
              },
              required: ["title", "summary"]
            },
            minItems: 1
          },
          theology: { type: "string" }
        },
        required: ["book", "themes", "sections"]
      }
    });

    if (!outline || typeof outline !== "object") {
      return Response.json({ error: "Invalid response format" }, { status: 500 });
    }

    return Response.json({ outline });
  } catch (error) {
    console.error("Error in generateBibleOutline:", error);
    return Response.json({ error: error?.message || "Failed to generate outline" }, { status: 500 });
  }
});