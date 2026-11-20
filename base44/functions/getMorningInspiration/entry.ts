import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { LANG_NAME, parseRef, translationLang } from '../../shared/bibleLocale.ts';
import { fetchVerseText } from '../../shared/scripture.ts';

// Morning Inspiration for the signed-in user: a verse chosen from their recent reading, shown in
// THEIR default Bible, with the reflection written in their app language.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { language = 'en', translation = 'KJV' } = await req.json().catch(() => ({}));
    const reflectionLang = LANG_NAME[language] || 'English';

    const [progress, xpData] = await Promise.all([
      base44.entities.ReadingProgress.filter({ created_by: user.email }, '-created_date', 10),
      base44.entities.UserXP.filter({ created_by: user.email }, '-updated_date', 1),
    ]);

    const recentBooks = [...new Set((progress || []).map((p: any) => p.book).filter(Boolean))].slice(0, 3);
    const activePlan = (progress || []).find((p: any) => p.plan_id)?.plan_id || null;
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
- verse_ref: ENGLISH reference of one specific verse (e.g. "Romans 8:28")
- book: the ENGLISH book name (e.g. "Romans")
- chapter: the chapter number
- verse: the verse number
- verse_text: the verse text in ${LANG_NAME[translationLang(translation)] || 'English'}
- reflection: a warm, 2-3 sentence personalized reflection connected to their recent reading, written in ${reflectionLang}
- theme: one English word theme (hope, strength, grace, peace, love or faith)

Choose a verse that feels like a gentle nudge forward, not random.`,
      response_json_schema: {
        type: 'object',
        properties: {
          verse_ref: { type: 'string' }, book: { type: 'string' }, chapter: { type: 'number' }, verse: { type: 'number' },
          verse_text: { type: 'string' }, reflection: { type: 'string' }, theme: { type: 'string' },
        },
      },
    });

    // The verse itself comes from the user's chosen Bible, not from the AI's memory of it.
    const { chapter, from, to } = parseRef(result?.verse_ref, result || {});
    const text = await fetchVerseText(base44, {
      translation, book: result.book, chapter, from, to, baseText: result.verse_text, baseTranslation: '__ai__',
    }, new Map());

    return Response.json({ inspiration: { ...result, chapter, verse: from, verse_text: text || result.verse_text, translation } });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}