import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

const LOGO = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";
const APP  = "https://veritas.base44.app";

// Hero images — peaceful/spiritual landscapes for email backgrounds
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&q=80",
  "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=600&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
];

function getDailyHeroImage(date) {
  const d = new Date(date || new Date());
  return HERO_IMAGES[d.getDay() % HERO_IMAGES.length];
}

function buildEmailHtml({ name, verse_ref, verse_text, reflection, theme, date }) {
  const firstName = name?.split(" ")[0] || "Beloved";
  const heroImg = getDailyHeroImage(date);
  const verseRefUpper = (verse_ref || "").toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Veritas · Your Daily Word</title>
</head>
<body style="margin:0;padding:0;background:#1a1510;font-family:Georgia,serif;">
<div style="max-width:480px;margin:0 auto;background:#1a1510;">

  <!-- HERO IMAGE -->
  <div style="position:relative;width:100%;line-height:0;">
    <img src="${heroImg}" alt="Veritas" width="480" style="width:100%;max-width:480px;display:block;border-radius:0 0 28px 28px;"/>
    <!-- Logo centered on image bottom -->
    <div style="text-align:center;margin-top:-44px;position:relative;z-index:2;padding-bottom:0;">
      <img src="${LOGO}" alt="Veritas" width="72" height="72"
        style="border-radius:50%;border:3px solid #c9a84c;box-shadow:0 4px 20px rgba(0,0,0,0.6);display:inline-block;"/>
    </div>
  </div>

  <!-- LABEL -->
  <div style="text-align:center;padding:18px 24px 4px;">
    <span style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;">&#128214; VERSÍCULO DEL DÍA</span>
  </div>

  <!-- VERSE CARD -->
  <div style="margin:16px 20px 20px;background:#2a2015;border-radius:20px;padding:32px 24px 28px;text-align:center;border:1px solid rgba(201,168,76,0.15);">
    <p style="font-family:Georgia,serif;font-size:20px;font-style:italic;color:#f0e6d0;line-height:1.75;margin:0 0 20px;">
      "${verse_text}"
    </p>
    <p style="font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.18em;color:#c9a84c;margin:0;">
      — ${verseRefUpper} —
    </p>
  </div>

  <!-- CTA BUTTON -->
  <div style="text-align:center;padding:4px 24px 28px;">
    <a href="${APP}/read" style="display:inline-block;background:#c9a84c;color:#1a1205;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.04em;padding:16px 48px;border-radius:50px;text-decoration:none;">
      Abrir Biblia Interactiva →
    </a>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;padding:16px 24px 28px;border-top:1px solid rgba(255,255,255,0.07);">
    <img src="${LOGO}" alt="Veritas" width="36" height="36"
      style="border-radius:50%;border:2px solid rgba(201,168,76,0.4);display:inline-block;margin-bottom:8px;"/>
    <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.45);margin:0 0 2px;">Veritas — Versículo del Día</p>
    <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.25);margin:0;">veritas.base44.app</p>
    <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.2);margin:8px 0 0;">Enviado automáticamente cada mañana · © 2026 Veritas</p>
  </div>

</div>
</body>
</html>`;
}

function buildWeeklyEmailHtml({ name, verses, weekStart }) {
  const firstName = name?.split(" ")[0] || "Beloved";
  const weekLabel = new Date(weekStart || new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const heroImg = HERO_IMAGES[0];

  const versesHtml = (verses || []).slice(0, 7).map((v, i) => `
    <div style="border-left:3px solid #c9a84c;padding:14px 16px;margin-bottom:10px;background:rgba(201,168,76,0.05);border-radius:0 12px 12px 0;">
      <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a84c;margin-bottom:6px;">Day ${i+1} · ${v.theme || "word"}</div>
      <div style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:#e8d5b0;line-height:1.6;margin-bottom:5px;">"${v.text?.slice(0,110)}${v.text?.length > 110 ? '…' : ''}"</div>
      <div style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.35);">— ${(v.verse_ref || '').toUpperCase()}</div>
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Veritas · Weekly Digest</title>
</head>
<body style="margin:0;padding:0;background:#1a1510;font-family:Georgia,serif;">
<div style="max-width:480px;margin:0 auto;background:#1a1510;">

  <!-- HERO IMAGE -->
  <div style="position:relative;width:100%;line-height:0;">
    <img src="${heroImg}" alt="Veritas" width="480" style="width:100%;max-width:480px;display:block;border-radius:0 0 28px 28px;"/>
    <div style="text-align:center;margin-top:-44px;position:relative;z-index:2;">
      <img src="${LOGO}" alt="Veritas" width="72" height="72"
        style="border-radius:50%;border:3px solid #c9a84c;box-shadow:0 4px 20px rgba(0,0,0,0.6);display:inline-block;"/>
    </div>
  </div>

  <!-- LABEL -->
  <div style="text-align:center;padding:18px 24px 4px;">
    <span style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;">&#128214; RESUMEN SEMANAL</span>
  </div>

  <!-- GREETING CARD -->
  <div style="margin:16px 20px 12px;background:#2a2015;border-radius:20px;padding:24px;text-align:center;border:1px solid rgba(201,168,76,0.15);">
    <p style="font-family:Georgia,serif;font-size:22px;font-style:italic;color:#f0e6d0;margin:0 0 6px;">${firstName},</p>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.45);margin:0;">Tu semana en la Palabra · ${weekLabel}</p>
  </div>

  <!-- VERSES -->
  <div style="margin:0 20px 20px;">
    ${versesHtml || '<div style="font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.3);text-align:center;padding:28px;">Comienza a leer cada día para ver tu resumen semanal aquí.</div>'}
  </div>

  <!-- CTA BUTTON -->
  <div style="text-align:center;padding:4px 24px 28px;">
    <a href="${APP}" style="display:inline-block;background:#c9a84c;color:#1a1205;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.04em;padding:16px 48px;border-radius:50px;text-decoration:none;">
      Abrir Veritas →
    </a>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;padding:16px 24px 28px;border-top:1px solid rgba(255,255,255,0.07);">
    <img src="${LOGO}" alt="Veritas" width="36" height="36"
      style="border-radius:50%;border:2px solid rgba(201,168,76,0.4);display:inline-block;margin-bottom:8px;"/>
    <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.45);margin:0 0 2px;">Veritas — Resumen Semanal</p>
    <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.2);margin:8px 0 0;">Enviado automáticamente cada semana · © 2026 Veritas</p>
  </div>

</div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { mode = "preview", recipient_email, recipient_name } = body;

    const today = new Date().toISOString().split("T")[0];
    const existing = await base44.asServiceRole.entities.DailyVerse.filter({ date: today });
    const verse = existing?.[0];

    if (!verse) {
      return Response.json({ error: "No daily verse found for today. Run getVerseOfTheDay first." }, { status: 404 });
    }

    if (mode === "preview_push") {
      const excerpt = verse.text?.slice(0, 70) + (verse.text?.length > 70 ? "…" : "");
      const filled = PUSH_TEMPLATES.map(t => ({
        ...t,
        title_rendered: t.title.replace("{name}", recipient_name || "Beloved").replace("{streak_days}", "7"),
        body_rendered: t.body
          .replace("{verse_excerpt}", excerpt)
          .replace("{ref}", verse.verse_ref)
          .replace("{name}", recipient_name || "Beloved"),
      }));
      return Response.json({ push_templates: filled, verse });
    }

    if (mode === "preview_email_daily") {
      const html = buildEmailHtml({
        name: recipient_name || "Beloved",
        verse_ref: verse.verse_ref,
        verse_text: verse.text,
        reflection: verse.reflection,
        theme: verse.theme,
        date: today,
      });
      return Response.json({ html, verse });
    }

    if (mode === "preview_email_weekly") {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const weekVerses = await base44.asServiceRole.entities.DailyVerse.list("-date", 7);
      const html = buildWeeklyEmailHtml({
        name: recipient_name || "Beloved",
        verses: weekVerses || [],
        weekStart: sevenDaysAgo,
      });
      return Response.json({ html, verses: weekVerses });
    }

    if (mode === "send_daily" && recipient_email) {
      const html = buildEmailHtml({
        name: recipient_name || "Beloved",
        verse_ref: verse.verse_ref,
        verse_text: verse.text,
        reflection: verse.reflection,
        theme: verse.theme,
        date: today,
      });
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: "Veritas · The Word",
        to: recipient_email,
        subject: `📖 Versículo del Día — ${verse.verse_ref}`,
        body: html,
      });
      return Response.json({ success: true, sent_to: recipient_email, verse_ref: verse.verse_ref });
    }

    return Response.json({ error: "Invalid mode. Use: preview_push | preview_email_daily | preview_email_weekly | send_daily" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});