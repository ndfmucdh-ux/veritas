import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { renderEmail, sendBrandedEmail, appLink, heroFor, firstNameOf } from '../../shared/emailBrand.ts';
import { readerLang, readerTranslation } from '../../shared/bibleLocale.ts';
import { getPrefs, pick } from '../../shared/people.ts';
import { verseByRef } from '../../shared/scripture.ts';

// Two ways in:
// 1. A signed-in person calls it -> they get their own weekly report.
// 2. The Monday workflow (runs as the admin) -> every active person gets theirs.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const db = base44.asServiceRole.entities;
    const memo = new Map();

    async function sendFor(target: any): Promise<boolean> {
      if (!target?.email) return false;
      const [progress, highlights, prayers, xpRows, pref] = await Promise.all([
        db.ReadingProgress.filter({ created_by: target.email, created_date: { $gte: weekAgo.toISOString() } }, '-created_date', 200),
        db.UserHighlight.filter({ created_by: target.email, created_date: { $gte: weekAgo.toISOString() } }, '-created_date', 200),
        db.PrayerJournal.filter({ created_by: target.email, created_date: { $gte: weekAgo.toISOString() } }, '-created_date', 200),
        db.UserXP.filter({ created_by: target.email }, '-updated_date', 1),
        getPrefs(base44, target.email),
      ]);
      if (!progress.length && !highlights.length && !prayers.length) return false;
      if (pref?.reminders?.channels?.email === false) return false;

      const lang = readerLang(pref);
      const v = await verseByRef(base44, 'Psalm 119:105', readerTranslation(pref), memo);
      const first = firstNameOf(target.display_name || target.full_name, pick(lang, { en: 'Beloved', es: 'Amado' }));
      const chapters = [...new Set(progress.map((p: any) => `${p.book} ${p.chapter}`))].slice(0, 6).join(', ');
      return await sendBrandedEmail(base44, {
        to: target.email,
        subject: pick(lang, { en: `Your weekly Veritas digest: ${progress.length} chapters read`, es: `Tu resumen semanal de Veritas: ${progress.length} capítulos leídos` }),
        html: renderEmail({
          lang, chip: pick(lang, { en: '✦ YOUR WEEK IN THE WORD', es: '✦ TU SEMANA EN LA PALABRA' }), hero: heroFor('purpose'),
          title: pick(lang, { en: `${first}, here is your week`, es: `${first}, así fue tu semana` }),
          quote: v?.text, quoteRef: v?.ref,
          paragraphs: chapters ? [chapters] : [],
          stats: [
            { label: pick(lang, { en: 'chapters', es: 'capítulos' }), value: progress.length },
            { label: pick(lang, { en: 'highlights', es: 'resaltados' }), value: highlights.length },
            { label: pick(lang, { en: 'prayers', es: 'oraciones' }), value: prayers.length },
          ],
          cta: { label: pick(lang, { en: 'Open Veritas', es: 'Abrir Veritas' }), url: appLink('/profile') },
          footerTag: pick(lang, { en: 'Weekly Digest', es: 'Resumen Semanal' }),
          sentLine: pick(lang, { en: 'Sent automatically each Monday', es: 'Enviado automáticamente cada lunes' }),
        }),
        category: 'transactional',
      });
    }

    if (user.role !== 'admin') return Response.json({ sent: await sendFor(user), mode: 'single_user' });

    const allUsers = await db.User.list('-created_date', 1000);
    let sentCount = 0;
    for (const u of allUsers) if (await sendFor(u)) sentCount++;
    return Response.json({ sent: true, digestsSent: sentCount, mode: 'all_users' });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}