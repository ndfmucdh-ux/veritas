import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { denyUnlessAdmin } from '../../shared/guard.ts';
import { renderEmail, sendBrandedEmail, appLink, heroFor, firstNameOf } from '../../shared/emailBrand.ts';
import { readerLang, readerTranslation } from '../../shared/bibleLocale.ts';
import { loadPrefsMap, pick } from '../../shared/people.ts';
import { verseByRef } from '../../shared/scripture.ts';

// Weekly workflow: each person receives a digest of their own prayer journal entries from the past 7 days.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const denied = await denyUnlessAdmin(base44);
    if (denied) return denied;

    const db = base44.asServiceRole.entities;
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [entries, users, prefs] = await Promise.all([
      db.PrayerJournal.filter({ created_date: { $gte: since } }, '-created_date', 1000),
      db.User.list('-created_date', 1000),
      loadPrefsMap(base44),
    ]);
    const byUser = new Map<string, any[]>();
    for (const e of entries || []) {
      const k = String(e.created_by || '').toLowerCase();
      if (k) byUser.set(k, [...(byUser.get(k) || []), e]);
    }
    const nameBy = new Map<string, any>((users || []).map((u: any) => [String(u.email).toLowerCase(), u]));

    const memo = new Map();
    let sent = 0;
    for (const [email, week] of byUser) {
      const pref = prefs.get(email);
      if (pref?.reminders?.channels?.email === false) continue;
      const lang = readerLang(pref);
      const v = await verseByRef(base44, 'James 5:16', readerTranslation(pref), memo);
      const u = nameBy.get(email);
      const first = firstNameOf(u?.display_name || u?.full_name, pick(lang, { en: 'Beloved', es: 'Amado' }));
      const answered = week.filter((e) => e.answered).length;
      const ok = await sendBrandedEmail(base44, {
        to: email,
        subject: pick(lang, { en: `Your weekly prayer digest (${week.length})`, es: `Tu resumen semanal de oración (${week.length})` }),
        html: renderEmail({
          lang, chip: pick(lang, { en: '🙏 WEEKLY PRAYER DIGEST', es: '🙏 RESUMEN SEMANAL DE ORACIÓN' }), hero: heroFor('prayer'),
          title: pick(lang, { en: `${first}, your week in prayer`, es: `${first}, tu semana en oración` }),
          quote: v?.text, quoteRef: v?.ref,
          stats: [
            { label: pick(lang, { en: 'prayers', es: 'oraciones' }), value: week.length },
            { label: pick(lang, { en: 'answered', es: 'respondidas' }), value: answered },
          ],
          paragraphs: week.slice(0, 5).map((e) => String(e.prayer_text || '').slice(0, 160)),
          cta: { label: pick(lang, { en: 'Open Prayer Journal', es: 'Abrir Diario de Oración' }), url: appLink('/prayer-journal') },
          footerTag: pick(lang, { en: 'Prayer Journal', es: 'Diario de Oración' }),
          sentLine: pick(lang, { en: 'Sent automatically each week', es: 'Enviado automáticamente cada semana' }),
        }),
        category: 'transactional',
      });
      if (ok) sent++;
    }
    return Response.json({ success: true, digestsSent: sent });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}