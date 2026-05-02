import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query, translation = 'KJV' } = await req.json();
    if (!query) return Response.json({ error: 'Missing query' }, { status: 400 });

    // Use AI to find relevant verses
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a Bible search engine. Given this search query: "${query}"
      
      Return the top 10 most relevant Bible verses (KJV translation) as JSON.
      Include verses about the topic, key words, or themes mentioned.
      
      Response format:
      {
        "verses": [
          {
            "ref": "John 3:16",
            "book": "John",
            "chapter": 3,
            "verse": 16,
            "text": "For God so loved...",
            "translation": "KJV",
            "relevance": "Why this verse relates to the query"
          }
        ]
      }`,
      response_json_schema: {
        type: "object",
        properties: {
          verses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                ref: { type: "string" },
                book: { type: "string" },
                chapter: { type: "number" },
                verse: { type: "number" },
                text: { type: "string" },
                translation: { type: "string" },
                relevance: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({ results: result.verses || [], query });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});