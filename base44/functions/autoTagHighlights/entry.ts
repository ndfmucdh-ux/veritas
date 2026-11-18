import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { denyUnlessAdmin } from '../../shared/guard.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const denied = await denyUnlessAdmin(base44);
    if (denied) return denied;
    const body = await req.json().catch(() => ({}));

    // Support both entity automation payload and direct invocation
    const entityId = body?.event?.entity_id;
    let verse_ref, verse_text, highlight_id;

    if (entityId) {
      // Called from entity automation
      const highlight = body?.data || await base44.asServiceRole.entities.UserHighlight.get?.(entityId);
      if (!highlight) return Response.json({ skipped: true });
      verse_ref = highlight.verse_ref;
      highlight_id = highlight.id || entityId;
    } else {
      // Direct invocation
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      verse_ref = body.verse_ref;
      verse_text = body.verse_text;
      highlight_id = body.highlight_id;
    }

    if (!verse_ref) return Response.json({ skipped: "no verse_ref" });

    // Fetch verse text if not provided
    if (!verse_text) {
      verse_text = verse_ref; // Fallback to ref as context
    }

    // Use LLM to auto-categorize
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze this Bible verse reference and assign 2-4 relevant thematic tags from this list only: [faith, hope, love, prayer, salvation, grace, peace, strength, wisdom, forgiveness, joy, trust, obedience, worship, healing, promises, family, identity, purpose, trial, comfort, gratitude, prophecy, righteousness, covenant].

Verse reference: ${verse_ref}

Return ONLY a JSON object like: {"tags": ["faith", "hope"]}`,
      response_json_schema: {
        type: "object",
        properties: {
          tags: { type: "array", items: { type: "string" } }
        }
      }
    });

    const tags = result?.tags || [];
    if (tags.length === 0) return Response.json({ success: true, tags: [] });

    // Create or update a UserNote with the tags
    const existingNotes = await base44.asServiceRole.entities.UserNote.filter({ verse_ref }).catch(() => []);
    const tagNote = `[Auto-tags: ${tags.join(', ')}]`;

    if (existingNotes?.[0]) {
      const existing = existingNotes[0];
      if (!existing.note_text?.includes('[Auto-tags:')) {
        await base44.asServiceRole.entities.UserNote.update(existing.id, {
          note_text: existing.note_text + '\n' + tagNote
        });
      }
    } else {
      await base44.asServiceRole.entities.UserNote.create({
        verse_ref,
        note_text: tagNote,
        is_private: true,
        created_by: body?.data?.created_by || undefined
      });
    }

    return Response.json({ success: true, tags });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});