import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { denyUnlessAdmin } from '../../shared/guard.ts';
import { renderEmail, sendBrandedEmail, appLink, heroFor, firstNameOf } from '../../shared/emailBrand.ts';
import { localNow, readerLang, readerTranslation } from '../../shared/bibleLocale.ts';
import { pick } from '../../shared/people.ts';
import { verseByRef } from '../../shared/scripture.ts';

// Evening workflow: reminds people who set a daily listening goal and haven't reached it today (in their own time zone).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const denied = await denyUnlessAdmin(base44);
    if (denied) return denied;

    const db = base44.asServiceRole.entities;
    const [audio, prefs, users] = await Promise.all([
      db.BibleAudioProgress.list('-updated_date', 2000),
      db.UserPreferences.list('-updated_date', 1000),
      db.User.list('-created_date', 1000),
    ]);
    const nameBy = new Map<string, any>((users || []).map((u: any) => [String(u.email).toLowerCase(), u]));

    const seen = new Set<string>();
    const memo = new Map();
    let sent = 0;
    for (const pref of prefs || []) {
      const email = String(pref.created_by || '').toLowerCase();
      if (!email || seen.has(email)) continue;
      seen.add(email);
      const goal = Number(pref.daily_audio_goal || 0);
      if (!goal || pref.reminders?.channels?.email === false) continue;

      const today = localNow(pref.timezone || 'America/New_York').date;
      const done = (audio || []).filter((a: any) =>
        String(a.created_by || '').toLowerCase() === email && a.completed &&
        localNow(pref.timezone || 'America/New_York', new Date(a.updated_date || a.created_date)).date === today).length;
      if (done >= goal) continue;

      const remaining = goal - done;
      const lang = readerLang(pref);
      const v = await verseByRef(base44, 'Romans 10:17', readerTranslation(pref), memo);
      const u = nameBy.get(email);
      const first = firstNameOf(u?.display_name || u?.full_name, pick(lang, { en: 'Beloved', es: 'Amado' }));
      const ok = await sendBrandedEmail(base44, {
        to: email,
        subject: pick(lang, { en: "Don't forget your daily listening goal", es: 'No olvides tu meta diaria de escucha' }),
        html: renderEmail({
          lang, chip: pick(lang, { en: '🎧 DAILY LISTENING GOAL', es: '🎧 META DIARIA DE ESCUCHA' }), hero: heroFor('peace'),
          title: pick(lang, { en: `${first}, your audio goal awaits`, es: `${first}, tu meta de audio te espera` }),
          quote: v?.text, quoteRef: v?.ref,
          stats: [{ label: pick(lang, { en: 'chapters to go', es: 'capítulos por escuchar' }), value: remaining }],
          cta: { label: pick(lang, { en: 'Start listening', es: 'Empezar a escuchar' }), url: appLink('/audio-dashboard') },
          footerTag: pick(lang, { en: 'Listening Goal', es: 'Meta de Escucha' }),
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