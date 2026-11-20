import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { renderEmail, sendBrandedEmail, appLink, heroFor, firstNameOf } from '../../shared/emailBrand.ts';
import { readerLang, readerTranslation } from '../../shared/bibleLocale.ts';
import { getPrefs, pick } from '../../shared/people.ts';
import { verseByRef } from '../../shared/scripture.ts';

// Called by the app after XP changes: emails the signed-in user when they cross an XP or listening milestone.
// Sent as Veritas through the app's SendEmail integration (integration credits).

const MILESTONES = [
  { xp: 100, name: "First Steps", es: "Primeros Pasos", ref: "Psalm 119:105", theme: "hope" },
  { xp: 250, name: "Growing", es: "Creciendo", ref: "2 Peter 3:18", theme: "grace" },
  { xp: 500, name: "Disciple", es: "Discípulo", ref: "John 8:31", theme: "faith" },
  { xp: 750, name: "Faithful", es: "Fiel", ref: "Matthew 25:21", theme: "joy" },
  { xp: 1000, name: "Scholar", es: "Erudito", ref: "2 Timothy 2:15", theme: "wisdom" },
  { xp: 2500, name: "Elder", es: "Anciano", ref: "Proverbs 1:5", theme: "wisdom" },
  { xp: 5000, name: "Patriarch", es: "Patriarca", ref: "2 Timothy 4:7", theme: "strength" },
];
const AUDIO_MILESTONES = [
  { seconds: 3600, hours: 1, bonus_xp: 50 },
  { seconds: 18000, hours: 5, bonus_xp: 100 },
  { seconds: 36000, hours: 10, bonus_xp: 150 },
  { seconds: 90000, hours: 25, bonus_xp: 250 },
  { seconds: 180000, hours: 50, bonus_xp: 500 },
  { seconds: 360000, hours: 100, bonus_xp: 1000 },
];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { previous_xp, current_xp, check_audio } = body;
    if (typeof current_xp !== 'number') return Response.json({ error: 'Missing current_xp' }, { status: 400 });

    const pref = await getPrefs(base44, user.email);
    const lang = readerLang(pref);
    const translation = readerTranslation(pref);
    const first = firstNameOf(user.display_name || user.full_name);
    const memo = new Map();

    if (check_audio) {
      const audioHistory = await base44.entities.BibleAudioProgress.filter({ completed: true }).catch(() => []);
      const totalSeconds = (audioHistory || []).reduce((s: number, a: any) => s + (a.timestamp_seconds || 0), 0);
      const prevSeconds = body.previous_audio_seconds || 0;
      const reached = AUDIO_MILESTONES.filter((m) => m.seconds > prevSeconds && m.seconds <= totalSeconds);
      for (const am of reached) {
        const xpRecords = await base44.entities.UserXP.list('-updated_date', 1).catch(() => []);
        if (xpRecords?.[0]) {
          await base44.entities.UserXP.update(xpRecords[0].id, {
            total_xp: (xpRecords[0].total_xp || 0) + am.bonus_xp,
            badges: [...(xpRecords[0].badges || []), `audio_${am.hours}h`],
          });
        }
        const v = await verseByRef(base44, 'Romans 10:17', translation, memo);
        const hoursLabel = pick(lang, { en: `${am.hours} hours of listening`, es: `${am.hours} horas de escucha` });
        await sendBrandedEmail(base44, {
          to: user.email,
          subject: pick(lang, { en: `${hoursLabel} · Achievement unlocked`, es: `${hoursLabel} · Logro desbloqueado` }),
          html: renderEmail({
            lang, chip: pick(lang, { en: "🎧 LISTENING ACHIEVEMENT", es: "🎧 LOGRO DE ESCUCHA" }), hero: heroFor('peace'),
            title: pick(lang, { en: `${first || 'Beloved'}, you reached ${hoursLabel}`, es: `${first || 'Amado'}, alcanzaste ${hoursLabel}` }),
            quote: v?.text, quoteRef: v?.ref,
            stats: [{ label: pick(lang, { en: 'bonus XP', es: 'XP de bonificación' }), value: `+${am.bonus_xp}` }],
            cta: { label: pick(lang, { en: 'View audio stats', es: 'Ver estadísticas de audio' }), url: appLink('/audio-dashboard') },
            footerTag: pick(lang, { en: 'Achievements', es: 'Logros' }),
          }),
          category: 'transactional',
        });
      }
    }

    const newMilestones = MILESTONES.filter((m) => m.xp > (previous_xp || 0) && m.xp <= current_xp);
    for (const m of newMilestones) {
      const v = await verseByRef(base44, m.ref, translation, memo);
      const name = pick(lang, { en: m.name, es: m.es });
      await sendBrandedEmail(base44, {
        to: user.email,
        subject: pick(lang, { en: `${name} · ${m.xp.toLocaleString()} XP milestone reached`, es: `${name} · Meta de ${m.xp.toLocaleString()} XP alcanzada` }),
        html: renderEmail({
          lang, chip: pick(lang, { en: "🏆 MILESTONE REACHED", es: "🏆 META ALCANZADA" }), hero: heroFor(m.theme),
          title: pick(lang, { en: `${first || 'Beloved'}, you reached ${name}`, es: `${first || 'Amado'}, alcanzaste ${name}` }),
          quote: v?.text, quoteRef: v?.ref,
          stats: [{ label: 'XP', value: m.xp.toLocaleString() }],
          cta: { label: pick(lang, { en: 'View my journey', es: 'Ver mi camino' }), url: appLink('/profile') },
          footerTag: pick(lang, { en: 'Achievements', es: 'Logros' }),
        }),
        category: 'transactional',
      });
    }
    return Response.json({ milestones_hit: newMilestones.map((m) => m.name), count: newMilestones.length });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}