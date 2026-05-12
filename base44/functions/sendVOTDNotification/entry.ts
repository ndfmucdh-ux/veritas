import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Push notification copy templates — 8 premium variants
const PUSH_TEMPLATES = [
  {
    id: "morning_grace",
    variant: "inspirational",
    time: "morning",
    title: "✨ Good morning, {name}",
    body: '"{verse_excerpt}" — {ref}\n\nYour daily word awaits. 🙏',
  },
  {
    id: "strength_today",
    variant: "challenging",
    time: "morning",
    title: "🔥 Walk in strength today, {name}",
    body: '"{verse_excerpt}" — {ref}\n\nOpen Veritas to read the full verse & reflection.',
  },
  {
    id: "reflective_noon",
    variant: "reflective",
    time: "afternoon",
    title: "📖 A word for your afternoon",
    body: '"{verse_excerpt}"\n— {ref}\n\nPause. Breathe. Let this sink in.',
  },
  {
    id: "streaking",
    variant: "streak",
    time: "morning",
    title: "🔥 {streak_days}-day streak, {name}!",
    body: "You're on fire. Today's verse: \"{verse_excerpt}\" — {ref}",
  },
  {
    id: "personal_invitation",
    variant: "inspirational",
    time: "morning",
    title: "🌅 Your daily word is ready",
    body: '"{verse_excerpt}"\n— {ref} · Tap to open your full devotional.',
  },
  {
    id: "evening_peace",
    variant: "reflective",
    time: "evening",
    title: "🌙 Evening peace, {name}",
    body: 'Before you rest: "{verse_excerpt}" — {ref}\n\nReflect & rest in His word.',
  },
  {
    id: "new_believer",
    variant: "encouraging",
    time: "morning",
    title: "✝️ God's word for you today",
    body: '"{verse_excerpt}"\n— {ref}\n\nEvery day in the Word is a step closer to Him.',
  },
  {
    id: "deep_study",
    variant: "study",
    time: "morning",
    title: "🧠 Today's verse to study",
    body: '"{verse_excerpt}" — {ref}\n\nOpen Study Center to go deeper. 📚',
  },
];

const LOGO = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";
const APP  = "https://veritas.base44.app";
const FONTS = "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');";

function buildEmailHtml({ name, verse_ref, verse_text, reflection, theme, date }) {
  const themeColors = {
    hope:     { accent: "#00F5FF", glow: "rgba(0,245,255,0.18)",    rgb: "0,245,255"   },
    love:     { accent: "#f472b6", glow: "rgba(244,114,182,0.18)",  rgb: "244,114,182" },
    strength: { accent: "#f97316", glow: "rgba(249,115,22,0.18)",   rgb: "249,115,22"  },
    faith:    { accent: "#FFD700", glow: "rgba(255,215,0,0.18)",    rgb: "255,215,0"   },
    peace:    { accent: "#34d399", glow: "rgba(52,211,153,0.18)",   rgb: "52,211,153"  },
    wisdom:   { accent: "#a78bfa", glow: "rgba(167,139,250,0.18)",  rgb: "167,139,250" },
    grace:    { accent: "#00F5FF", glow: "rgba(0,245,255,0.18)",    rgb: "0,245,255"   },
    courage:  { accent: "#f59e0b", glow: "rgba(245,158,11,0.18)",   rgb: "245,158,11"  },
    purpose:  { accent: "#FFD700", glow: "rgba(255,215,0,0.18)",    rgb: "255,215,0"   },
  };
  const tc = themeColors[theme] || themeColors.hope;
  const firstName = name?.split(" ")[0] || "Beloved";
  const formattedDate = new Date(date || new Date()).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Veritas · Your Daily Word</title>
<style>
  ${FONTS}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#06080f;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
  a{text-decoration:none;}
  .wrap{max-width:600px;margin:0 auto;background:#06080f;}
  .hdr{background:linear-gradient(160deg,#0a0f1e 0%,#0d1326 60%,#06080a 100%);padding:40px 32px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07);}
  .logo{display:inline-block;border-radius:22%;overflow:hidden;width:64px;height:64px;box-shadow:0 0 36px ${tc.glow};}
  .logo img{width:100%;height:100%;object-fit:cover;display:block;}
  .brand{font-family:'Cinzel',serif;font-size:22px;font-weight:700;color:#fff;letter-spacing:0.20em;margin-top:14px;}
  .brand-sub{font-size:10px;font-family:'Inter',sans-serif;color:rgba(255,255,255,0.3);letter-spacing:0.25em;text-transform:uppercase;margin-top:5px;}
  .hero{background:linear-gradient(145deg,#0b1020 0%,#111827 100%);padding:44px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);}
  .pill{display:inline-block;font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${tc.accent};background:rgba(${tc.rgb},0.06);border:1px solid rgba(${tc.rgb},0.25);border-radius:999px;padding:5px 18px;margin-bottom:24px;}
  .greeting{font-family:'Cinzel',serif;font-size:13px;color:rgba(255,255,255,0.4);letter-spacing:0.08em;margin-bottom:8px;}
  .verse-ref{font-family:'Cinzel',serif;font-size:12px;font-weight:600;color:${tc.accent};letter-spacing:0.18em;text-transform:uppercase;margin-bottom:20px;}
  .verse-body{font-family:'Playfair Display',serif;font-size:26px;font-style:italic;color:rgba(255,255,255,0.92);line-height:1.70;padding:0 8px;position:relative;}
  .verse-body::before,.verse-body::after{font-size:52px;color:${tc.accent};opacity:0.28;font-family:'Playfair Display',serif;line-height:0;vertical-align:-20px;}
  .verse-body::before{content:'\u201C';}
  .verse-body::after{content:'\u201D';}
  .badge{display:inline-block;font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:${tc.accent};background:${tc.glow};border:1px solid rgba(${tc.rgb},0.35);border-radius:999px;padding:4px 14px;margin-top:14px;}
  .divider{width:64px;height:1px;background:linear-gradient(90deg,transparent,rgba(${tc.rgb},0.5),transparent);margin:32px auto;}
  .card{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:28px;margin:0 32px 24px;}
  .card-label{font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:14px;}
  .card-text{font-family:'Inter',sans-serif;font-size:15px;font-weight:300;color:rgba(255,255,255,0.72);line-height:1.85;}
  .cta-wrap{padding:8px 32px 32px;text-align:center;}
  .btn-primary{display:inline-block;font-family:'Cinzel',serif;font-size:12px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#06080f;background:linear-gradient(135deg,${tc.accent},rgba(${tc.rgb},0.75));border-radius:13px;padding:15px 36px;margin:6px;box-shadow:0 6px 28px ${tc.glow};}
  .btn-secondary{display:inline-block;font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${tc.accent};background:rgba(255,255,255,0.04);border:1px solid rgba(${tc.rgb},0.35);border-radius:13px;padding:12px 24px;margin:5px;}
  .ftr{padding:28px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);}
  .ftr p{font-family:'Inter',sans-serif;font-size:11px;color:rgba(255,255,255,0.18);line-height:1.9;}
  .ftr a{color:rgba(255,255,255,0.28);font-size:11px;margin:0 8px;}
  @media(max-width:600px){.verse-body{font-size:20px;}.card{margin:0 16px 20px;padding:20px;}.cta-wrap{padding:8px 16px 24px;}.hdr,.hero{padding-left:20px;padding-right:20px;}}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div class="logo"><img src="${LOGO}" alt="Veritas"/></div>
    <div class="brand">VERITAS</div>
    <div class="brand-sub">The Word · Every Day</div>
  </div>
  <div class="hero">
    <div class="pill">${formattedDate}</div>
    <div class="greeting">Good morning, ${firstName} 🙏</div>
    <div class="verse-ref">— ${verse_ref} —</div>
    <div class="verse-body">${verse_text}</div>
    <div class="badge">${theme || "daily word"}</div>
  </div>
  <div class="divider"></div>
  <div class="card">
    <div class="card-label">✦ Today's Reflection</div>
    <div class="card-text">${reflection || "Let this verse speak to your heart today."}</div>
  </div>
  <div class="cta-wrap">
    <a href="${APP}/read" class="btn-primary">Open in Veritas</a>
    <br/>
    <a href="${APP}/verse-art" class="btn-secondary">✨ Create Verse Art</a>
    <a href="${APP}/prayer-journal" class="btn-secondary">🙏 Journal a Prayer</a>
  </div>
  <div class="ftr">
    <p>Every word of God is pure — Proverbs 30:5<br/>You have daily verse emails enabled in your Veritas preferences.</p>
    <div style="margin-top:12px;"><a href="#">Unsubscribe</a><a href="#">Manage Preferences</a><a href="${APP}">Open App</a></div>
  </div>
</div>
</body>
</html>`;
}

function buildWeeklyEmailHtml({ name, verses, weekStart }) {
  const firstName = name?.split(" ")[0] || "Beloved";
  const weekLabel = new Date(weekStart || new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const versesHtml = (verses || []).slice(0, 7).map((v, i) => `
    <div style="border-left:3px solid rgba(255,215,0,0.35);padding:16px 20px;margin-bottom:12px;background:rgba(255,215,0,0.03);border-radius:0 14px 14px 0;">
      <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#FFD700;margin-bottom:8px;">Day ${i+1} · ${v.theme || "word"}</div>
      <div style="font-family:'Playfair Display',serif;font-style:italic;font-size:15px;color:rgba(255,255,255,0.82);line-height:1.65;margin-bottom:7px;">&#8220;${v.text?.slice(0,120)}${v.text?.length > 120 ? '…' : ''}&#8221;</div>
      <div style="font-family:'Cinzel',serif;font-size:10px;color:rgba(255,255,255,0.32);">— ${v.verse_ref}</div>
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Veritas · Weekly Digest</title>
<style>
  ${FONTS}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#06080f;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
  a{text-decoration:none;}
  .wrap{max-width:600px;margin:0 auto;background:#06080f;}
</style>
</head>
<body>
<div class="wrap">
  <div style="background:linear-gradient(160deg,#0a0f1e 0%,#0d1326 60%,#06080a 100%);padding:40px 32px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="display:inline-block;border-radius:22%;overflow:hidden;width:64px;height:64px;box-shadow:0 0 36px rgba(255,215,0,0.2);">
      <img src="${LOGO}" width="64" height="64" style="display:block;object-fit:cover;" alt="Veritas"/>
    </div>
    <div style="font-family:'Cinzel',serif;font-size:22px;font-weight:700;color:#fff;letter-spacing:0.20em;margin-top:14px;">VERITAS</div>
    <div style="font-size:10px;font-family:'Inter',sans-serif;color:rgba(255,255,255,0.3);letter-spacing:0.25em;text-transform:uppercase;margin-top:5px;">Weekly Spiritual Summary</div>
  </div>

  <div style="background:linear-gradient(145deg,#0b1020 0%,#111827 100%);padding:44px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
    <div style="display:inline-block;font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#FFD700;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.25);border-radius:999px;padding:5px 18px;margin-bottom:22px;">Week of ${weekLabel}</div>
    <div style="font-family:'Cinzel',serif;font-size:13px;color:rgba(255,255,255,0.4);letter-spacing:0.08em;margin-bottom:8px;">Your week in the Word,</div>
    <div style="font-family:'Playfair Display',serif;font-size:28px;font-style:italic;color:rgba(255,255,255,0.9);">${firstName}</div>
    <div style="font-family:'Inter',sans-serif;font-size:14px;font-weight:300;color:rgba(255,255,255,0.4);margin-top:12px;line-height:1.7;">Seven days. Seven verses. One faithful God.</div>
  </div>

  <div style="width:64px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,215,0,0.5),transparent);margin:32px auto;"></div>

  <div style="padding:0 32px 24px;">${versesHtml || '<div style="font-family:Inter,sans-serif;font-size:14px;color:rgba(255,255,255,0.3);text-align:center;padding:32px;">Start reading daily to see your weekly summary here.</div>'}</div>

  <div style="margin:0 32px 28px;background:rgba(255,215,0,0.04);border:1px solid rgba(255,215,0,0.18);border-radius:18px;padding:26px;text-align:center;">
    <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:14px;">✦ Continue Your Journey</div>
    <a href="${APP}" style="display:inline-block;font-family:'Cinzel',serif;font-size:12px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#06080f;background:linear-gradient(135deg,#FFD700,rgba(255,215,0,0.75));border-radius:13px;padding:15px 36px;margin-bottom:8px;text-decoration:none;box-shadow:0 6px 28px rgba(255,215,0,0.18);">Open Veritas</a>
    <br/>
    <a href="${APP}/plans" style="display:inline-block;font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#FFD700;background:rgba(255,255,255,0.04);border:1px solid rgba(255,215,0,0.35);border-radius:13px;padding:12px 24px;margin:5px;text-decoration:none;">📖 Start a Plan</a>
    <a href="${APP}/prayer-journal" style="display:inline-block;font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#FFD700;background:rgba(255,255,255,0.04);border:1px solid rgba(255,215,0,0.35);border-radius:13px;padding:12px 24px;margin:5px;text-decoration:none;">🙏 Prayer Journal</a>
  </div>

  <div style="padding:28px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
    <div style="font-family:'Inter',sans-serif;font-size:11px;color:rgba(255,255,255,0.18);line-height:1.9;">
      "Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105<br/>
      <a href="#" style="color:rgba(255,255,255,0.28);text-decoration:none;margin:0 8px;">Unsubscribe</a>
      <a href="${APP}" style="color:rgba(255,255,255,0.28);text-decoration:none;margin:0 8px;">Open App</a>
      <a href="#" style="color:rgba(255,255,255,0.28);text-decoration:none;margin:0 8px;">Preferences</a>
    </div>
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
    const { mode = "preview", template_id, recipient_email, recipient_name } = body;

    // Get today's verse
    const today = new Date().toISOString().split("T")[0];
    const existing = await base44.asServiceRole.entities.DailyVerse.filter({ date: today });
    const verse = existing?.[0];

    if (!verse) {
      return Response.json({ error: "No daily verse found for today. Run getVerseOfTheDay first." }, { status: 404 });
    }

    if (mode === "preview_push") {
      // Return all push templates with verse filled in
      const excerpt = verse.text?.slice(0, 70) + (verse.text?.length > 70 ? "…" : "");
      const filled = PUSH_TEMPLATES.map(t => ({
        ...t,
        title_rendered: t.title.replace("{name}", recipient_name || "Beloved").replace("{streak_days}", "7"),
        body_rendered: t.body
          .replace("{verse_excerpt}", excerpt)
          .replace("{ref}", verse.verse_ref)
          .replace("{name}", recipient_name || "Beloved"),
        char_count_title: t.title.replace("{name}", recipient_name || "Beloved").replace("{streak_days}", "7").length,
        char_count_body: t.body.replace("{verse_excerpt}", excerpt).replace("{ref}", verse.verse_ref).replace("{name}", recipient_name || "Beloved").length,
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
        variant: "daily",
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
        subject: `✨ ${verse.verse_ref} — Your Daily Word`,
        body: html,
      });
      return Response.json({ success: true, sent_to: recipient_email, verse_ref: verse.verse_ref });
    }

    return Response.json({ error: "Invalid mode. Use: preview_push | preview_email_daily | preview_email_weekly | send_daily" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});