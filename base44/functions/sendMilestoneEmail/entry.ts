import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { renderEmail, sendBrandedEmail, appLink, heroFor, firstNameOf } from '../../shared/emailBrand.ts';
import { readerLang, readerTranslation } from '../../shared/bibleLocale.ts';
import { getPrefs, pick } from '../../shared/people.ts';
import { verseByRef } from '../../shared/scripture.ts';

// Reading-streak milestone email for the signed-in user (7, 14, 21, 30, 60, 100 and 365 days).
// The recipient is always the caller. Sent as Veritas through SendEmail (integration credits).

const MILESTONES: Record<number, { ref: string; theme: string }> = {
  7: { ref: 'Lamentations 3:23', theme: 'faith' },
  14: { ref: 'Revelation 1:3', theme: 'wisdom' },
  21: { ref: 'Philippians 4:13', theme: 'strength' },
  30: { ref: 'Lamentations 3:23', theme: 'grace' },
  60: { ref: 'Isaiah 40:31', theme: 'courage' },
  100: { ref: 'Psalm 32:7', theme: 'peace' },
  365: { ref: 'Psalm 23:6', theme: 'joy' },
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const xpData = await base44.entities.UserXP.list('-updated_date', 1).catch(() => []);
    const streak = Number(body.streakDays) || xpData?.[0]?.streak_days || 0;
    const chapters = body.chaptersRead === undefined ? (xpData?.[0]?.chapters_read ?? 0) : Number(body.chaptersRead) || 0;

    if (!body.preview && !MILESTONES[streak]) {
      return Response.json({ skipped: true, reason: `${streak} is not a milestone day` });
    }

    const pref = await getPrefs(base44, user.email);
    const lang = readerLang(pref);
    const m = MILESTONES[streak] || { ref: 'Psalm 119:105', theme: 'hope' };
    const v = await verseByRef(base44, m.ref, readerTranslation(pref), new Map());
    const first = firstNameOf(user.display_name || user.full_name, pick(lang, { en: 'Beloved', es: 'Amado' }));

    const html = renderEmail({
      lang,
      chip: pick(lang, { en: `🔥 ${streak}-DAY STREAK`, es: `🔥 RACHA DE ${streak} DÍAS` }),
      hero: heroFor(m.theme),
      title: pick(lang, { en: `${first}, ${streak} days in the Word`, es: `${first}, ${streak} días en la Palabra` }),
      quote: v?.text, quoteRef: v?.ref,
      stats: [
        { label: pick(lang, { en: 'day streak', es: 'días de racha' }), value: streak },
        { label: pick(lang, { en: 'chapters read', es: 'capítulos leídos' }), value: chapters },
      ],
      cta: { label: pick(lang, { en: 'Keep going', es: 'Seguir leyendo' }), url: appLink('/read') },
      footerTag: pick(lang, { en: 'Streak Achievement', es: 'Logro de Racha' }),
    });

    if (body.preview) return Response.json({ html, streak, chapters });

    const ok = await sendBrandedEmail(base44, {
      to: user.email,
      subject: pick(lang, { en: `${streak}-day streak achievement. Keep going, ${first}!`, es: `Racha de ${streak} días. ¡Sigue así, ${first}!` }),
      html, category: 'transactional',
    });
    return Response.json({ sent: ok, streak, milestone: `${streak}-day` });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}