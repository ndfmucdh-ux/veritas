import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { denyUnlessAdmin } from '../../shared/guard.ts';
import { renderEmail, sendBrandedEmail, appLink, heroFor, firstNameOf } from '../../shared/emailBrand.ts';
import { readerLang, readerTranslation } from '../../shared/bibleLocale.ts';
import { loadPrefsMap, pick } from '../../shared/people.ts';
import { verseByRef } from '../../shared/scripture.ts';

// Daily workflow: nudges people whose last reading was 3 days ago. Each person is nudged once (day 3), not every day after.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const denied = await denyUnlessAdmin(base44);
    if (denied) return denied;

    const DAY = 24 * 60 * 60 * 1000;
    const [progress, users, prefs] = await Promise.all([
      base44.asServiceRole.entities.ReadingProgress.list('-completed_at', 1000),
      base44.asServiceRole.entities.User.list('-created_date', 1000),
      loadPrefsMap(base44),
    ]);
    const lastRead = new Map<string, number>();
    for (const p of progress || []) {
      const email = String(p.created_by || '').toLowerCase();
      const at = new Date(p.completed_at || p.created_date).getTime();
      if (email && at > (lastRead.get(email) || 0)) lastRead.set(email, at);
    }
    const nameBy = new Map<string, any>((users || []).map((u: any) => [String(u.email).toLowerCase(), u]));

    const memo = new Map();
    let sent = 0;
    for (const [email, at] of lastRead) {
      const days = (Date.now() - at) / DAY;
      if (days < 3 || days >= 4) continue;
      const pref = prefs.get(email);
      if (pref?.reminders?.channels?.email === false) continue;
      const lang = readerLang(pref);
      const v = await verseByRef(base44, 'Psalm 119:105', readerTranslation(pref), memo);
      const u = nameBy.get(email);
      const first = firstNameOf(u?.display_name || u?.full_name, pick(lang, { en: 'Beloved', es: 'Amado' }));
      const ok = await sendBrandedEmail(base44, {
        to: email,
        subject: pick(lang, { en: 'Your reading plan needs you', es: 'Tu plan de lectura te necesita' }),
        html: renderEmail({
          lang, chip: pick(lang, { en: '📖 COME BACK TO THE WORD', es: '📖 VUELVE A LA PALABRA' }), hero: heroFor('hope'),
          title: pick(lang, { en: `${first}, your reading awaits`, es: `${first}, tu lectura te espera` }),
          quote: v?.text, quoteRef: v?.ref,
          paragraphs: [pick(lang, { en: "It's been a few days. Even one chapter today can restart your momentum.", es: 'Han pasado unos días. Un solo capítulo hoy puede reiniciar tu impulso.' })],
          cta: { label: pick(lang, { en: 'Continue reading', es: 'Continuar leyendo' }), url: appLink('/plans') },
          footerTag: pick(lang, { en: 'Reading Plan', es: 'Plan de Lectura' }),
        }),
        category: 'transactional',
      });
      if (ok) sent++;
    }
    return Response.json({ success: true, reminders_sent: sent });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}