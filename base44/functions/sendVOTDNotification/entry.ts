import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
// buildVeritasEmail — inlined (no local imports allowed in Deno deploy)
function buildVeritasEmail({ heroImageUrl, chipLabel="VERITAS · THE WORD", heading, verseRef, bodyLines=[], ctaUrl, ctaLabel="Open →", footerLine="Veritas", previewBlock, date }) {
  const heroImg = heroImageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80";
  const formattedDate = date ? new Date(date).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}) : new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const bodyHtml = bodyLines.map(l=>`<p style="font-family:Georgia,serif;font-size:14px;font-style:italic;color:rgba(255,255,255,0.62);line-height:1.78;margin:0 0 10px;">${l}</p>`).join("");
  const previewHtml = previewBlock ? `<div style="margin:0 18px 16px;padding:16px 18px;background:#1a1510;border-radius:13px;border-left:3px solid rgba(201,168,76,0.45);"><p style="font-family:Arial,sans-serif;font-size:8.5px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(201,168,76,0.55);margin:0 0 6px;">${previewBlock.label||"✦ Reflection"}</p><p style="font-family:Georgia,serif;font-size:14px;font-style:italic;color:rgba(255,255,255,0.6);line-height:1.75;margin:0;">"${previewBlock.text}"</p></div>` : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${chipLabel}</title></head><body style="margin:0;padding:0;background:#0a0805;"><div style="max-width:480px;margin:0 auto;background:#0a0805;font-family:Georgia,serif;"><div style="width:100%;height:4px;background:linear-gradient(90deg,#7b4f1e,#c9a84c,#7b4f1e);"></div><div style="line-height:0;position:relative;"><img src="${heroImg}" alt="" width="480" style="width:100%;max-width:480px;display:block;height:230px;object-fit:cover;object-position:center 40%;"/><div style="position:absolute;bottom:0;left:0;right:0;height:110px;background:linear-gradient(to bottom,transparent,#0a0805);"></div></div><div style="background:#0a0805;text-align:center;padding:0 24px 6px;margin-top:-52px;position:relative;z-index:2;"><div style="display:inline-block;background:#0a0805;padding:4px;border-radius:50%;border:2px solid #c9a84c;box-shadow:0 0 30px rgba(201,168,76,0.35);"><img src="${LOGO}" alt="Veritas" width="72" height="72" style="border-radius:50%;display:block;background:#0a0805;"/></div><p style="font-family:Arial,sans-serif;font-size:8.5px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.22);margin:8px 0 0;">VERITAS · THE WORD</p></div><div style="text-align:center;padding:12px 24px 4px;"><div style="display:inline-block;background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.25);border-radius:999px;padding:5px 18px;"><span style="font-family:Arial,sans-serif;font-size:8.5px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;">${chipLabel}</span></div><p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.2);margin:8px 0 0;">${formattedDate}</p></div><div style="margin:14px 18px 6px;background:#14100a;border-radius:18px;padding:28px 22px 24px;text-align:center;border:1px solid rgba(201,168,76,0.14);box-shadow:0 8px 40px rgba(0,0,0,0.5);">${heading?`<p style="font-family:Georgia,serif;font-size:19px;font-style:italic;font-weight:bold;color:#f0e6d0;line-height:1.75;margin:0 0 16px;">"${heading}"</p>`:""} ${verseRef?`<div style="width:32px;height:1px;background:#c9a84c;opacity:0.35;margin:0 auto 12px;"></div><p style="font-family:Arial,sans-serif;font-size:9.5px;font-weight:bold;letter-spacing:0.2em;color:#c9a84c;margin:0 0 16px;">— ${verseRef.toUpperCase()} —</p>`:""} ${bodyHtml}</div>${previewHtml}<div style="text-align:center;padding:18px 24px 24px;"><a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#b8862e,#c9a84c,#b8862e);color:#0a0805;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:0.06em;padding:15px 52px;border-radius:50px;text-decoration:none;box-shadow:0 4px 20px rgba(201,168,76,0.3);">${ctaLabel}</a></div><div style="margin:0 24px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.18),transparent);"></div><div style="text-align:center;padding:20px 24px 28px;"><img src="${LOGO}" alt="Veritas" width="28" height="28" style="border-radius:50%;border:1.5px solid rgba(201,168,76,0.3);display:inline-block;margin-bottom:8px;"/><p style="font-family:Arial,sans-serif;font-size:10.5px;color:rgba(255,255,255,0.35);margin:0 0 2px;">${footerLine}</p><p style="font-family:Arial,sans-serif;font-size:9.5px;color:rgba(255,255,255,0.15);margin:4px 0 0;">veritas.base44.app · © 2026 Veritas</p></div><div style="width:100%;height:3px;background:linear-gradient(90deg,#7b4f1e,#c9a84c,#7b4f1e);"></div></div></body></html>`;
}

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

// Semantic hero images mapped to verse themes
const THEME_HERO_IMAGES = {
  hope:      "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&q=80",  // sunrise through mist
  faith:     "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",  // aerial valley light
  love:      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80",  // warm forest path
  peace:     "https://images.unsplash.com/photo-1439405328-88d5d2a8f36d?w=600&q=80",     // still lake at dawn
  strength:  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",  // mountain peak
  wisdom:    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",  // starry night sky
  grace:     "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",  // alpine meadow golden
  courage:   "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",  // sunlit forest walk
  purpose:   "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=600&q=80",  // forest dawn rays
  joy:       "https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=600&q=80",  // colorful wildflowers
  prayer:    "https://images.unsplash.com/photo-1545730344-26c5815483f2?w=600&q=80",     // misty morning chapel
  default:   "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", // alpine meadow
};

function getThemeHero(theme) {
  return THEME_HERO_IMAGES[theme?.toLowerCase()] || THEME_HERO_IMAGES.default;
}

function buildEmailHtml({ name, verse_ref, verse_text, reflection, theme, date, devotionalPreview }) {
  const themeDisplay = theme ? theme.charAt(0).toUpperCase() + theme.slice(1) : "Daily Word";
  return buildVeritasEmail({
    heroImageUrl: getThemeHero(theme),
    chipLabel: `VERSÍCULO DEL DÍA · ${themeDisplay.toUpperCase()}`,
    heading: verse_text,
    verseRef: verse_ref,
    bodyLines: [],
    ctaUrl: `${APP}/#/read`,
    ctaLabel: "Abrir en Veritas →",
    footerLine: "Veritas — Versículo del Día",
    date,
    previewBlock: devotionalPreview ? { label: "✦ Today's Reflection", text: devotionalPreview } : undefined,
  });
}

function buildWeeklyEmailHtml({ name, verses, weekStart }) {
  const firstName = name?.split(" ")[0] || "Beloved";
  const weekLabel = new Date(weekStart || new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const versesHtml = (verses || []).slice(0, 7).map((v, i) => `
    <div style="border-left:2px solid #c9a84c;padding:12px 14px;margin-bottom:8px;background:rgba(201,168,76,0.04);border-radius:0 10px 10px 0;">
      <div style="font-family:Arial,sans-serif;font-size:8.5px;letter-spacing:0.18em;text-transform:uppercase;color:#c9a84c;margin-bottom:5px;">Día ${i+1}${v.theme ? ` · ${v.theme}` : ""}</div>
      <div style="font-family:Georgia,serif;font-style:italic;font-size:13.5px;color:#e8d5b0;line-height:1.62;margin-bottom:4px;">"${(v.text||"").slice(0,110)}${(v.text||"").length>110?"…":""}"</div>
      <div style="font-family:Arial,sans-serif;font-size:9.5px;color:rgba(255,255,255,0.3);">— ${(v.verse_ref||"").toUpperCase()}</div>
    </div>`).join("");

  const base = buildVeritasEmail({
    heroImageUrl: THEME_HERO_IMAGES.grace,
    chipLabel: "📖 RESUMEN SEMANAL",
    heading: `${firstName}, tu semana en la Palabra`,
    verseRef: `Semana del ${weekLabel}`,
    bodyLines: verses?.length ? [] : ["Comienza a leer cada día para ver tu resumen semanal aquí."],
    ctaUrl: APP,
    ctaLabel: "Abrir Veritas →",
    footerLine: "Veritas — Resumen Semanal",
  });
  return base.replace(
    '<div style="text-align:center;padding:18px 24px 24px;">',
    `<div style="margin:0 18px 16px;">${versesHtml}</div><div style="text-align:center;padding:18px 24px 24px;">`
  );
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
      // Generate a short devotional preview sentence
      let devotionalPreview = null;
      if (verse.reflection) {
        devotionalPreview = verse.reflection.split(". ")[0] + ".";
      }
      const html = buildEmailHtml({
        name: recipient_name || "Beloved",
        verse_ref: verse.verse_ref,
        verse_text: verse.text,
        reflection: verse.reflection,
        theme: verse.theme,
        date: today,
        devotionalPreview,
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
      let devotionalPreview = null;
      if (verse.reflection) {
        devotionalPreview = verse.reflection.split(". ")[0] + ".";
      }
      const html = buildEmailHtml({
        name: recipient_name || "Beloved",
        verse_ref: verse.verse_ref,
        verse_text: verse.text,
        reflection: verse.reflection,
        theme: verse.theme,
        date: today,
        devotionalPreview,
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