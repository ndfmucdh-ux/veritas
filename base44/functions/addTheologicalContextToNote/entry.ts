import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { denyUnlessAdmin } from '../../shared/guard.ts';

// Called by entity automation when a new UserNote is created.
// Uses AI to append a brief historical context summary to the note's related data.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const denied = await denyUnlessAdmin(base44);
    if (denied) return denied;
    const body = await req.json();
    const { data, event } = body;

    // Only run on create
    if (event?.type !== 'create' || !data) {
      return Response.json({ skipped: true });
    }

    const { verse_ref, book, chapter, verse, note_text, created_by } = data;
    if (!verse_ref || !note_text) return Response.json({ skipped: "missing fields" });

    // Generate historical context using LLM
    const context = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `A user just wrote a personal note on ${verse_ref}. Their note reads: "${note_text}"

Please provide a brief (2-3 sentence) historical and theological context for ${verse_ref} that would enrich their understanding and complement their reflection. Be concise, scholarly but warm. Focus on: the historical setting, the author's intent, and one key theological insight. Do not repeat what they wrote.`,
      response_json_schema: {
        type: "object",
        properties: {
          historical_context: { type: "string" },
          key_insight: { type: "string" }
        },
        required: ["historical_context", "key_insight"]
      }
    });

    // Save the context as a StudyNote linked to this verse
    await base44.asServiceRole.entities.StudyNote.create({
      title: `Historical Context: ${verse_ref}`,
      content: `**Context for ${verse_ref}**\n\n${context.historical_context}\n\n**Key Insight:** ${context.key_insight}\n\n*Automatically generated based on your note.*`,
      topic: "exegesis",
      related_verses: [verse_ref],
      created_by,
    });

    return Response.json({ success: true, verse_ref, context });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});