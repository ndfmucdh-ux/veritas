import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { verse_ref, verse_text, user_mood = "seeking" } = await req.json();

    if (!verse_ref || !verse_text) {
      return Response.json({ error: 'Missing verse_ref or verse_text' }, { status: 400 });
    }

    // Generate personalized devotional
    const devotional = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a compassionate Bible teacher writing a brief daily devotional (150-200 words) for someone named ${user.full_name}.

Verse: ${verse_ref}
"${verse_text}"

Their mood/context: ${user_mood}

Write a warm, personal reflection that:
1. Explains the verse's meaning in modern life
2. Offers a practical application
3. Ends with a brief prayer or encouragement

Use simple, accessible language. Be authentic and pastoral.`,
      model: 'gemini_3_flash'
    });

    return Response.json({
      success: true,
      verse_ref,
      devotional,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});