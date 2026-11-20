import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { renderEmail, sendBrandedEmail, appLink, heroFor, firstNameOf } from '../../shared/emailBrand.ts';
import { readerLang, readerTranslation } from '../../shared/bibleLocale.ts';
import { getPrefs, pick } from '../../shared/people.ts';
import { verseByRef } from '../../shared/scripture.ts';

// "Remind me about my reading plan": emails the signed-in user, unless they already made plan progress today.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const progress = await base44.entities.ReadingProgress.filter({ created_by: user.email, plan_id: { $exists: true } }, '-created_date', 50);
    const todayKey = new Date().toISOString().slice(0, 10);
    if ((progress || []).some((p: any) => String(p.created_date).slice(0, 10) === todayKey)) {
      return Response.json({ skipped: true, reason: 'User already made progress today' });
    }

    const pref = await getPrefs(base44, user.email);
    const lang = readerLang(pref);
    const planName = progress?.[0]?.plan_id || pick(lang, { en: 'Your reading plan', es: 'Tu plan de lectura' });
    const v = await verseByRef(base44, 'Proverbs 30:5', readerTranslation(pref), new Map());
    const first = firstNameOf(user.display_name || user.full_name, pick(lang, { en: 'Beloved', es: 'Amado' }));

    const ok = await sendBrandedEmail(base44, {
      to: user.email,
      subject: pick(lang, { en: `Continue "${planName}"`, es: `Continúa "${planName}"` }),
      html: renderEmail({
        lang, chip: pick(lang, { en: '📖 DEVOTIONAL PLAN', es: '📖 PLAN DEVOCIONAL' }), hero: heroFor('faith'),
        title: pick(lang, { en: `${first}, continue your journey today`, es: `${first}, continúa tu jornada hoy` }),
        quote: v?.text, quoteRef: v?.ref, paragraphs: [planName],
        cta: { label: pick(lang, { en: 'Continue my plan', es: 'Continuar mi plan' }), url: appLink('/plans') },
        footerTag: pick(lang, { en: 'Devotional Plan', es: 'Plan Devocional' }),
      }),
      category: 'transactional',
    });
    return Response.json({ sent: ok, plan: planName });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}