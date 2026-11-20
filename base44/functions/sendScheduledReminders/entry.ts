import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { denyUnlessAdmin } from '../../shared/guard.ts';
import { sendBrandedEmail } from '../../shared/emailBrand.ts';
import { localNow } from '../../shared/bibleLocale.ts';
import type { Memo } from '../../shared/scripture.ts';
import { buildReminderEmail, reminderContext } from '../../shared/reminderEmail.ts';
import { KINDS, REMINDER_DEFAULTS } from '../../shared/reminderText.ts';

// Runs every 30 minutes. For each person it checks, in THEIR time zone, whether a reminder is due:
// streak (8:00 AM by default), scripture, prayer and follow-up. Each is sent at most once a day,
// only when it still makes sense (e.g. no streak reminder if they already read today).
// Push goes to the native app; email goes out as Veritas. Both use integration credits.

const CATCH_UP_MINUTES = 120;

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

        const ctx = await reminderContext(base44, kind, email, tz);
        // Log first so a slow or failed send can never turn into a second reminder.
        await db.ReminderLog.create({
          user_email: email, kind, local_date: date,
          channels: ctx.skip ? "skipped" : [channels.push && "push", channels.email && "email"].filter(Boolean).join("+"),
        });
        if (ctx.skip) { stats.skipped++; continue; }
        stats.due++;

        try {
          const mail = await buildReminderEmail(base44, kind, u, pref, ctx, memo);
          if (channels.push) {
            try {
              await base44.asServiceRole.integrations.Core.SendPushNotification({
                user_id: u.id, title: mail.pushTitle, content: mail.pushBody, action_url: mail.url,
              });
              stats.push++;
            } catch { /* no native app on this account: email still goes out */ }
          }
          if (channels.email) {
            const ok = await sendBrandedEmail(base44, { to: u.email, subject: mail.subject, html: mail.html, category: "transactional" });
            if (ok) stats.email++; else stats.failed++;
          }
        } catch { stats.failed++; }
      }
    }
    return Response.json({ success: true, ...stats });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}