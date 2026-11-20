import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { denyUnlessAdmin } from '../../shared/guard.ts';
import { renderEmail, sendBrandedEmail, appLink, heroFor, firstNameOf } from '../../shared/emailBrand.ts';
import { readerLang, readerTranslation } from '../../shared/bibleLocale.ts';
import { getPrefs, pick } from '../../shared/people.ts';
import { verseByRef } from '../../shared/scripture.ts';

// Called by the entity automation when someone's XP record changes: celebrates each 500 XP they cross.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const denied = await denyUnlessAdmin(base44);
    if (denied) return denied;

    const { data, old_data } = await req.json().catch(() => ({}));
    if (!data) return Response.json({ skipped: true });

    const currentXP = data.total_xp || 0;
    const band = Math.floor(currentXP / 500);
    if (band <= Math.floor((old_data?.total_xp || 0) / 500)) return Response.json({ skipped: 'no threshold crossed' });

    const userEmail = data.created_by;
    if (!userEmail) return Response.json({ skipped: 'no user email' });
    const milestone = band * 500;

    const [pref, person] = await Promise.all([
      getPrefs(base44, userEmail),
      base44.asServiceRole.entities.User.filter({ email: userEmail }, '-created_date', 1),
    ]);
    const lang = readerLang(pref);
    const v = await verseByRef(base44, 'Psalm 119:105', readerTranslation(pref), new Map());
    const first = firstNameOf(person?.[0]?.display_name || person?.[0]?.full_name, pick(lang, { en: 'Beloved', es: 'Amado' }));

    const ok = await sendBrandedEmail(base44, {
      to: userEmail,
      subject: pick(lang, { en: `You've reached ${milestone} XP in Veritas`, es: `Alcanzaste ${milestone} XP en Veritas` }),
      html: renderEmail({
        lang, chip: pick(lang, { en: '🎉 XP MILESTONE', es: '🎉 META DE XP' }), hero: heroFor('joy'),
        title: pick(lang, { en: `Congratulations, ${first}!`, es: `¡Felicidades, ${first}!` }),
        quote: v?.text, quoteRef: v?.ref,
        paragraphs: [pick(lang, {
          en: 'Every verse you read, every note you write, every prayer you journal counts.',
          es: 'Cada versículo que lees, cada nota que escribes y cada oración que registras cuenta.',
        })],
        stats: [{ label: 'XP', value: milestone.toLocaleString() }],
        cta: { label: pick(lang, { en: 'View my journey', es: 'Ver mi camino' }), url: appLink('/profile') },
        footerTag: pick(lang, { en: 'Achievements', es: 'Logros' }),
      }),
      category: 'transactional',
    });
    return Response.json({ success: ok, milestone, userEmail });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}