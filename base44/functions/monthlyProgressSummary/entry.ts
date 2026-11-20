import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { denyUnlessAdmin } from '../../shared/guard.ts';
import { renderEmail, sendBrandedEmail, appLink, heroFor, firstNameOf } from '../../shared/emailBrand.ts';
import { readerLang, readerTranslation } from '../../shared/bibleLocale.ts';
import { loadPrefsMap, pick } from '../../shared/people.ts';
import { verseByRef } from '../../shared/scripture.ts';

// Monthly workflow: sends each active reader a summary of last month.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const denied = await denyUnlessAdmin(base44);
    if (denied) return denied;

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    const db = base44.asServiceRole.entities;
    const [progress, xpRows, users, prefs] = await Promise.all([
      db.ReadingProgress.list('-completed_at', 2000),
      db.UserXP.list('-updated_date', 1000),
      db.User.list('-created_date', 1000),
      loadPrefsMap(base44),
    ]);

    const byUser = new Map<string, any[]>();
    for (const p of progress || []) {
      const email = String(p.created_by || '').toLowerCase();
      const at = new Date(p.completed_at || p.created_date);
      if (!email || at < start || at >= end) continue;
      byUser.set(email, [...(byUser.get(email) || []), p]);
    }
    const xpBy = new Map<string, any>();
    for (const x of xpRows || []) { const k = String(x.created_by || '').toLowerCase(); if (k && !xpBy.has(k)) xpBy.set(k, x); }
    const nameBy = new Map<string, any>((users || []).map((u: any) => [String(u.email).toLowerCase(), u]));

    const memo = new Map();
    let sent = 0;
    for (const [email, rows] of byUser) {
      const pref = prefs.get(email);
      if (pref?.reminders?.channels?.email === false) continue;
      const lang = readerLang(pref);
      const locale = lang === 'es' ? 'es-US' : lang === 'fr' ? 'fr-FR' : lang === 'pt' ? 'pt-BR' : lang === 'de' ? 'de-DE' : 'en-US';
      const month = start.toLocaleString(locale, { month: 'long', year: 'numeric' });
      const books = [...new Set(rows.map((p) => p.book))];
      const xp = xpBy.get(email);
      const v = await verseByRef(base44, '2 Peter 3:18', readerTranslation(pref), memo);
      const u = nameBy.get(email);
      const first = firstNameOf(u?.display_name || u?.full_name, pick(lang, { en: 'Beloved', es: 'Amado' }));
      const ok = await sendBrandedEmail(base44, {
        to: email,
        subject: pick(lang, { en: `Your ${month} in the Word`, es: `Tu ${month} en la Palabra` }),
        html: renderEmail({
          lang, chip: pick(lang, { en: '📅 MONTHLY SUMMARY', es: '📅 RESUMEN MENSUAL' }), hero: heroFor('grace'),
          title: pick(lang, { en: `${first}, here is ${month}`, es: `${first}, así fue ${month}` }),
          quote: v?.text, quoteRef: v?.ref,
          paragraphs: [`${pick(lang, { en: 'Books you explored', es: 'Libros que exploraste' })}: ${books.join(', ')}`],
          stats: [
            { label: pick(lang, { en: 'chapters', es: 'capítulos' }), value: rows.length },
            { label: 'XP', value: (xp?.total_xp || 0).toLocaleString() },
            { label: pick(lang, { en: 'day streak', es: 'días de racha' }), value: xp?.streak_days || 0 },
          ],
          cta: { label: pick(lang, { en: 'View my profile', es: 'Ver mi perfil' }), url: appLink('/profile') },
          footerTag: pick(lang, { en: 'Monthly Summary', es: 'Resumen Mensual' }),
          sentLine: pick(lang, { en: 'Sent automatically each month', es: 'Enviado automáticamente cada mes' }),
        }),
        category: 'transactional',
      });
      if (ok) sent++;
    }
    return Response.json({ success: true, summaries_sent: sent });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}