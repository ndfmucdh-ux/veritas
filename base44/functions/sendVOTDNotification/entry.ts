import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { denyUnlessAdmin } from '../../shared/guard.ts';
import { renderEmail, sendBrandedEmail, heroFor, appLink } from '../../shared/emailBrand.ts';
import { buildVerseEmail } from '../../shared/votd.ts';

// Admin tools for the Notification Studio: previews and a test send of the Verse of the Day.
// Every send uses the app's SendEmail integration (integration credits) and the Veritas sender name.

const PUSH_TEMPLATES = [
  { id: "morning_grace", title: "✨ Good morning, {name}", body: '"{verse_excerpt}" — {ref}\n\nYour daily word awaits. 🙏' },
  { id: "strength_today", title: "🔥 Walk in strength today, {name}", body: '"{verse_excerpt}" — {ref}\n\nOpen Veritas to read the full verse & reflection.' },
  { id: "reflective_noon", title: "📖 A word for your afternoon", body: '"{verse_excerpt}"\n— {ref}\n\nPause. Breathe. Let this sink in.' },
  { id: "streaking", title: "🔥 {streak_days}-day streak, {name}!", body: 'You\'re on fire. Today\'s verse: "{verse_excerpt}" — {ref}' },
  { id: "personal_invitation", title: "🌅 Your daily word is ready", body: '"{verse_excerpt}"\n— {ref} · Tap to open your full devotional.' },
  { id: "evening_peace", title: "🌙 Evening peace, {name}", body: 'Before you rest: "{verse_excerpt}" — {ref}\n\nReflect & rest in His word.' },
  { id: "new_believer", title: "✝️ God\'s word for you today", body: '"{verse_excerpt}"\n— {ref}\n\nEvery day in the Word is a step closer to Him.' },
  { id: "deep_study", title: "🧠 Today\'s verse to study", body: '"{verse_excerpt}" — {ref}\n\nOpen Study Center to go deeper. 📚' },
];

function weeklyDigestHtml(name: string, verses: any[]) {
  const first = String(name || "").split(" ")[0];
  return renderEmail({
    chip: "📖 WEEKLY DIGEST",
    hero: heroFor("grace"),
    title: `${first || "Beloved"}, your week in the Word`,
    paragraphs: verses.length
      ? verses.slice(0, 7).map((v, i) => `Day ${i + 1}${v.theme ? ` · ${v.theme}` : ""}: "${String(v.text || "").slice(0, 110)}" — ${v.verse_ref}`)
      : ["Start reading each day to see your weekly summary here."],
    cta: { label: "Open Veritas", url: appLink("/") },
    footerTag: "Weekly Digest",
    sentLine: "Sent automatically each week",
  });
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const denied = await denyUnlessAdmin(base44);
    if (denied) return denied;

    const { mode = "preview_email_daily", recipient_email, recipient_name } = await req.json().catch(() => ({}));
    const today = new Date().toISOString().split("T")[0];
    const verse = (await base44.asServiceRole.entities.DailyVerse.filter({ date: today }))?.[0];
    if (!verse) return Response.json({ error: "No daily verse found for today. Run getVerseOfTheDay first." }, { status: 404 });

    if (mode === "preview_push") {
      const excerpt = verse.text?.slice(0, 70) + (verse.text?.length > 70 ? "…" : "");
      const filled = PUSH_TEMPLATES.map((t) => ({
        ...t,
        title_rendered: t.title.replace("{name}", recipient_name || "Beloved").replace("{streak_days}", "7"),
        body_rendered: t.body.replace("{verse_excerpt}", excerpt).replace("{ref}", verse.verse_ref).replace("{name}", recipient_name || "Beloved"),
      }));
      return Response.json({ push_templates: filled, verse });
    }

    if (mode === "preview_email_weekly") {
      const weekVerses = await base44.asServiceRole.entities.DailyVerse.list("-date", 7);
      return Response.json({ html: weeklyDigestHtml(recipient_name || "Beloved", weekVerses || []), verses: weekVerses });
    }

    // Daily preview / test send: written for the signed-in admin's own default Bible and language.
    const me = await base44.auth.me();
    const myPrefs = (await base44.asServiceRole.entities.UserPreferences.filter({ created_by: me.email }, "-updated_date", 1))?.[0];
    const mail = await buildVerseEmail(base44, verse, { name: recipient_name || me.display_name || me.full_name, prefs: myPrefs }, new Map());

    if (mode === "preview_email_daily") return Response.json({ html: mail.html, verse });

    if (mode === "send_daily" && recipient_email) {
      const accepted = await sendBrandedEmail(base44, { to: recipient_email, subject: mail.subject, html: mail.html, category: "transactional" });
      if (!accepted) return Response.json({ error: "That address can't receive email from the app." }, { status: 422 });
      return Response.json({ success: true, sent_to: recipient_email, verse_ref: verse.verse_ref });
    }

    return Response.json({ error: "Invalid mode. Use: preview_push | preview_email_daily | preview_email_weekly | send_daily" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}