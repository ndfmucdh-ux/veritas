import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { denyUnlessAdmin } from '../../shared/guard.ts';
import { renderEmail, sendBrandedEmail, appLink, readLink, heroFor, firstNameOf } from '../../shared/emailBrand.ts';
import { localNow, readerLang, readerTranslation, translationLang } from '../../shared/bibleLocale.ts';
import { fetchVerseText, bookNameIn } from '../../shared/scripture.ts';
import type { Memo } from '../../shared/scripture.ts';
import { KINDS, REMINDER_DEFAULTS, REMINDER_VERSE, TEXT } from '../../shared/reminderText.ts';
import type { Kind } from '../../shared/reminderText.ts';

// Runs every 30 minutes. For each person it checks, in THEIR time zone, whether a reminder is due:
// streak (8:00 AM by default), scripture, prayer and follow-up. Each is sent at most once a day,
// only when it still makes sense (e.g. no streak reminder if they already read today).
// Push goes to the native app; email goes out as Veritas. Both use integration credits.

const CATCH_UP_MINUTES = 120;
const STREAK_LABEL: Record<string, string> = { en: "day streak", es: "días de racha", fr: "jours de série", pt: "dias de sequência", de: "Tage in Folge" };

const toMinutes = (hhmm: string) => {
  const [h, m] = String(hhmm || "").split(":").map(Number);
  return Number.isFinite(h) ? h * 60 + (m || 0) : null;
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const denied = await denyUnlessAdmin(base44);
    if (denied) return denied;

    const db = base44.asServiceRole.entities;
    const [users, prefs] = await Promise.all([
      db.User.list("-created_date", 1000),
      db.UserPreferences.list("-updated_date", 1000),
    ]);
    const prefByEmail = new Map<string, any>();
    for (const p of prefs || []) {
      const k = String(p.created_by || "").toLowerCase();
      if (k && !prefByEmail.has(k)) prefByEmail.set(k, p);
    }

    const memo: Memo = new Map();
    const stats = { checked: 0, due: 0, email: 0, push: 0, skipped: 0, failed: 0 };

    for (const u of users || []) {
      const email = String(u.email || "").toLowerCase();
      if (!email) continue;
      const pref = prefByEmail.get(email);
      const cfg = pref?.reminders || {};
      const channels = { push: cfg.channels?.push !== false, email: cfg.channels?.email !== false };
      if (!channels.push && !channels.email) continue;
      const tz = pref?.timezone || "America/New_York";
      const { date, minutes } = localNow(tz);

      for (const kind of KINDS) {
        const rule = { ...REMINDER_DEFAULTS[kind], ...(cfg[kind] || {}) };
        if (!rule.enabled) continue;
        const at = toMinutes(rule.time);
        if (at === null || minutes < at || minutes - at >= CATCH_UP_MINUTES) continue;
        stats.checked++;

        const already = await db.ReminderLog.filter({ user_email: email, kind, local_date: date }, "-created_date", 1);
        if (already?.length) continue;

        const context = await reminderContext(base44, kind, email, tz, date);
        // Log first so a slow or failed send can never turn into a second reminder.
        await db.ReminderLog.create({ user_email: email, kind, local_date: date, channels: context.skip ? "skipped" : [channels.push && "push", channels.email && "email"].filter(Boolean).join("+") });
        if (context.skip) { stats.skipped++; continue; }
        stats.due++;

        const lang = readerLang(pref);
        const translation = readerTranslation(pref);
        const T = (TEXT[lang] || TEXT.en)[kind as Kind];
        const first = firstNameOf(u.display_name || u.full_name);
        const url = context.url || appLink("/");

        if (channels.push) {
          try {
            await base44.asServiceRole.integrations.Core.SendPushNotification({
              user_id: u.id, title: first ? `${T.push}, ${first}` : T.push, content: context.summary || T.line, action_url: url,
            });
            stats.push++;
          } catch { /* no native app on this account: email still goes out */ }
        }
        if (channels.email) {
          try {
            const v = REMINDER_VERSE[kind as Kind];
            const verseLang = translationLang(translation);
            const [text, book] = await Promise.all([
              fetchVerseText(base44, { translation, book: v.book, chapter: v.chapter, from: v.from, to: v.to }, memo),
              bookNameIn(base44, v.book, verseLang, translation, memo),
            ]);
            const html = renderEmail({
              lang,
              chip: T.chip,
              hero: heroFor(kind === "prayer" ? "prayer" : kind === "streak" ? "strength" : "hope"),
              title: first ? `${T.hello}, ${first}` : T.hello,
              quote: text,
              quoteRef: `${book} ${v.chapter}:${v.from}${v.to ? `-${v.to}` : ""} (${translation})`,
              paragraphs: [T.line, ...(context.lines || [])],
              stats: context.streak ? [{ label: STREAK_LABEL[lang] || STREAK_LABEL.en, value: context.streak }] : undefined,
              cta: { label: T.cta, url },
              footerTag: T.foot,
              sentLine: undefined,
            });
            const ok = await sendBrandedEmail(base44, { to: u.email, subject: `${T.push}`, html, category: "transactional" });
            if (ok) stats.email++; else stats.failed++;
          } catch { stats.failed++; }
        }
      }
    }
    return Response.json({ success: true, ...stats });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// What a reminder should say for this person right now, or skip: true when it would be pointless.
async function reminderContext(base44: any, kind: Kind, email: string, tz: string, today: string): Promise<{
  skip?: boolean; url?: string; lines?: string[]; summary?: string; streak?: number;
}> {
  const db = base44.asServiceRole.entities;
  const sameDay = (ts?: string) => !!ts && localNow(tz, new Date(ts)).date === today;

  if (kind === "streak" || kind === "scripture") {
    const [last] = await db.ReadingProgress.filter({ created_by: email }, "-completed_at", 1);
    if (sameDay(last?.completed_at || last?.created_date)) return { skip: true };
    const book = last?.book || "John";
    const chapter = Number(last?.chapter) || 1;
    const url = readLink(book, chapter);
    if (kind === "scripture") return { url, lines: [`${book} ${chapter}`] };
    const [xp] = await db.UserXP.filter({ created_by: email }, "-updated_date", 1);
    const streak = Number(xp?.streak_days || 0);
    return { url, streak };
  }

  if (kind === "prayer") {
    const [last] = await db.PrayerJournal.filter({ created_by: email }, "-created_date", 1);
    if (sameDay(last?.created_date)) return { skip: true };
    return { url: appLink("/prayer-journal") };
  }

  // followup: audio left unfinished, then a reading plan still in progress
  const audio = await db.BibleAudioProgress.filter({ created_by: email, completed: false }, "-updated_date", 1);
  if (audio?.[0]) {
    const a = audio[0];
    return { url: readLink(a.book, a.chapter, undefined, a.translation), lines: [`${a.book} ${a.chapter}`], summary: `${a.book} ${a.chapter}` };
  }
  const plans = await db.CustomPlan.filter({ created_by: email }, "-updated_date", 5);
  const open = (plans || []).find((p: any) => Number(p.total_chapters || 0) > Number(p.completed_count || 0));
  if (open) return { url: appLink("/plans"), lines: [open.title], summary: open.title };
  return { skip: true };
}