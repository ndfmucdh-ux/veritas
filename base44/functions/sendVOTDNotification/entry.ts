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

function buildEmailHtml({ name, verse_ref, verse_text, reflection, theme, date, variant = "daily" }) {
  const themeColors = {
    hope:      { accent: "#00F5FF", glow: "rgba(0,245,255,0.18)" },
    love:      { accent: "#f472b6", glow: "rgba(244,114,182,0.18)" },
    strength:  { accent: "#f97316", glow: "rgba(249,115,22,0.18)" },
    faith:     { accent: "#FFD700", glow: "rgba(255,215,0,0.18)" },
    peace:     { accent: "#34d399", glow: "rgba(52,211,153,0.18)" },
    wisdom:    { accent: "#a78bfa", glow: "rgba(167,139,250,0.18)" },
    grace:     { accent: "#00F5FF", glow: "rgba(0,245,255,0.18)" },
    courage:   { accent: "#f59e0b", glow: "rgba(245,158,11,0.18)" },
    purpose:   { accent: "#FFD700", glow: "rgba(255,215,0,0.18)" },
  };
  const tc = themeColors[theme] || themeColors.hope;
  const firstName = name?.split(" ")[0] || "Beloved";
  const formattedDate = new Date(date || new Date()).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Veritas · Daily Verse</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#06080f;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
  a{text-decoration:none;}
  .email-wrapper{max-width:600px;margin:0 auto;background:#06080f;}
  .header{background:linear-gradient(160deg,#0a0f1e 0%,#0d1326 60%,#060a14 100%);padding:40px 32px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07);}
  .logo-wrap{display:inline-block;border-radius:22%;overflow:hidden;width:64px;height:64px;box-shadow:0 0 32px ${tc.glow};}
  .logo-wrap img{width:100%;height:100%;object-fit:cover;display:block;}
  .app-name{font-family:'Cinzel',serif;font-size:22px;font-weight:700;color:#fff;letter-spacing:0.18em;margin-top:14px;}
  .tagline{font-family:'Inter',sans-serif;font-size:11px;color:rgba(255,255,255,0.35);letter-spacing:0.22em;text-transform:uppercase;margin-top:4px;}
  .hero{background:linear-gradient(145deg,#0b1020 0%,#111827 100%);padding:40px 32px;text-align:center;position:relative;border-bottom:1px solid rgba(255,255,255,0.06);}
  .date-pill{display:inline-block;font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${tc.accent};background:rgba(255,255,255,0.04);border:1px solid ${tc.accent}33;border-radius:999px;padding:5px 16px;margin-bottom:24px;}
  .greeting{font-family:'Cinzel',serif;font-size:13px;color:rgba(255,255,255,0.4);letter-spacing:0.08em;margin-bottom:8px;}
  .verse-ref{font-family:'Cinzel',serif;font-size:12px;font-weight:600;color:${tc.accent};letter-spacing:0.15em;text-transform:uppercase;margin-bottom:20px;}
  .verse-text{font-family:'Playfair Display',serif;font-size:26px;font-style:italic;color:rgba(255,255,255,0.92);line-height:1.65;margin-bottom:12px;position:relative;padding:0 8px;}
  .verse-text::before,.verse-text::after{content:'"';font-size:48px;color:${tc.accent};opacity:0.3;font-family:'Playfair Display',serif;line-height:0;vertical-align:-18px;}
  .verse-text::after{content:'"';}
  .theme-badge{display:inline-block;font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:${tc.accent};background:${tc.glow};border:1px solid ${tc.accent}44;border-radius:999px;padding:4px 14px;margin-top:10px;}
  .divider{width:60px;height:1px;background:linear-gradient(90deg,transparent,${tc.accent}66,transparent);margin:32px auto;}
  .reflection-section{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:28px;margin:0 32px 24px;}
  .section-label{font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:14px;}
  .reflection-text{font-family:'Inter',sans-serif;font-size:15px;font-weight:300;color:rgba(255,255,255,0.72);line-height:1.8;}
  .cta-row{padding:8px 32px 32px;text-align:center;}
  .cta-primary{display:inline-block;font-family:'Cinzel',serif;font-size:12px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#06080f;background:linear-gradient(135deg,${tc.accent},${tc.accent}cc);border-radius:12px;padding:14px 32px;margin:6px;box-shadow:0 4px 24px ${tc.glow};}
  .cta-secondary{display:inline-block;font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${tc.accent};background:rgba(255,255,255,0.04);border:1px solid ${tc.accent}44;border-radius:12px;padding:12px 24px;margin:6px;}
  .footer{padding:28px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);}
  .footer-text{font-family:'Inter',sans-serif;font-size:11px;color:rgba(255,255,255,0.2);line-height:1.8;}
  .footer-links a{color:rgba(255,255,255,0.3);font-size:11px;margin:0 8px;}
  @media(max-width:600px){
    .verse-text{font-size:20px;}
    .reflection-section{margin:0 16px 20px;padding:20px;}
    .cta-row{padding:8px 16px 24px;}
    .header,.hero{padding-left:20px;padding-right:20px;}
  }
</style>
</head>
<body>
<div class="email-wrapper">

  <!-- HEADER -->
  <div class="header">
    <div class="logo-wrap">
      <img src="https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg" alt="Veritas"/>
    </div>
    <div class="app-name">VERITAS</div>
    <div class="tagline">The Word · Every Day</div>
  </div>

  <!-- HERO VERSE -->
  <div class="hero">
    <div class="date-pill">${formattedDate}</div>
    <div class="greeting">Good morning, ${firstName} 🙏</div>
    <div class="verse-ref">— ${verse_ref} —</div>
    <div class="verse-text">${verse_text}</div>
    <div class="theme-badge">${theme || "daily word"}</div>
  </div>

  <div class="divider"></div>

  <!-- REFLECTION -->
  <div class="reflection-section">
    <div class="section-label">✦ Today's Reflection</div>
    <div class="reflection-text">${reflection}</div>
  </div>

  <!-- CTA BUTTONS -->
  <div class="cta-row">
    <a href="https://veritas.base44.app/read" class="cta-primary">Open in Veritas</a>
    <br/>
    <a href="https://veritas.base44.app/verse-art" class="cta-secondary">✨ Create Verse Art</a>
    <a href="https://veritas.base44.app/prayer-journal" class="cta-secondary">🙏 Journal a Prayer</a>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-text">
      You are receiving this because you have daily verse notifications enabled.<br/>
      Every word of God is pure — Proverbs 30:5
    </div>
    <div class="footer-links" style="margin-top:12px;">
      <a href="#">Unsubscribe</a>
      <a href="#">Manage Preferences</a>
      <a href="#">Open App</a>
    </div>
  </div>

</div>
</body>
</html>`;
}

function buildWeeklyEmailHtml({ name, verses, weekStart }) {
  const firstName = name?.split(" ")[0] || "Beloved";
  const weekLabel = new Date(weekStart || new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const versesHtml = (verses || []).slice(0, 7).map((v, i) => `
    <div style="border-left:3px solid #00F5FF44;padding:16px 20px;margin-bottom:12px;background:rgba(0,245,255,0.03);border-radius:0 12px 12px 0;">
      <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#00F5FF;margin-bottom:8px;">Day ${i+1} · ${v.theme || "word"}</div>
      <div style="font-family:'Playfair Display',serif;font-style:italic;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.6;margin-bottom:6px;">"${v.text?.slice(0,120)}${v.text?.length > 120 ? '…' : ''}"</div>
      <div style="font-family:'Cinzel',serif;font-size:10px;color:rgba(255,255,255,0.35);">— ${v.verse_ref}</div>
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Veritas · Weekly Digest</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;1,400&family=Inter:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#06080f;font-family:'Inter',sans-serif;}
  .wrap{max-width:600px;margin:0 auto;}
  @media(max-width:600px){.wrap{padding:0 4px;}}
</style>
</head>
<body>
<div class="wrap">
  <div style="background:linear-gradient(160deg,#0a0f1e,#060a14);padding:36px 32px 28px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="display:inline-block;border-radius:22%;overflow:hidden;width:56px;height:56px;box-shadow:0 0 28px rgba(255,215,0,0.2);">
      <img src="https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg" width="56" height="56" style="display:block;object-fit:cover;" alt="Veritas"/>
    </div>
    <div style="font-family:'Cinzel',serif;font-size:20px;font-weight:700;color:#fff;letter-spacing:0.18em;margin-top:12px;">VERITAS</div>
    <div style="font-family:'Inter',sans-serif;font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:0.2em;text-transform:uppercase;margin-top:4px;">Weekly Spiritual Summary</div>
  </div>

  <div style="padding:32px 32px 8px;text-align:center;">
    <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#FFD700;background:rgba(255,215,0,0.07);border:1px solid rgba(255,215,0,0.18);border-radius:999px;display:inline-block;padding:5px 18px;margin-bottom:20px;">Week of ${weekLabel}</div>
    <div style="font-family:'Playfair Display',serif;font-size:24px;color:rgba(255,255,255,0.9);margin-bottom:8px;">Your week in the Word,<br/><em>${firstName}</em></div>
    <div style="font-family:'Inter',sans-serif;font-size:14px;font-weight:300;color:rgba(255,255,255,0.45);line-height:1.7;">Seven days. Seven verses. One faithful God.<br/>Here is what He spoke to you this week.</div>
  </div>

  <div style="width:50px;height:1px;background:linear-gradient(90deg,transparent,#FFD70066,transparent);margin:24px auto;"></div>

  <div style="padding:0 32px 24px;">${versesHtml || '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:32px;font-family:Inter,sans-serif;font-size:14px;">Start reading daily to see your weekly summary here.</div>'}</div>

  <div style="margin:0 32px 32px;background:rgba(255,215,0,0.04);border:1px solid rgba(255,215,0,0.15);border-radius:16px;padding:24px;text-align:center;">
    <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:12px;">✦ Continue Your Journey</div>
    <a href="https://veritas.base44.app" style="display:inline-block;font-family:'Cinzel',serif;font-size:12px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#06080f;background:linear-gradient(135deg,#FFD700,#f59e0b);border-radius:12px;padding:14px 36px;margin-bottom:8px;text-decoration:none;">Open Veritas</a>
    <br/>
    <a href="https://veritas.base44.app/plans" style="display:inline-block;font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#FFD700;background:rgba(255,255,255,0.04);border:1px solid rgba(255,215,0,0.25);border-radius:12px;padding:10px 22px;margin:4px;text-decoration:none;">📖 Start a Plan</a>
    <a href="https://veritas.base44.app/prayer-journal" style="display:inline-block;font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#FFD700;background:rgba(255,255,255,0.04);border:1px solid rgba(255,215,0,0.25);border-radius:12px;padding:10px 22px;margin:4px;text-decoration:none;">🙏 Prayer Journal</a>
  </div>

  <div style="padding:24px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
    <div style="font-family:'Inter',sans-serif;font-size:11px;color:rgba(255,255,255,0.18);line-height:1.8;">
      Thy word is a lamp unto my feet, and a light unto my path — Psalm 119:105<br/>
      <a href="#" style="color:rgba(255,255,255,0.25);text-decoration:none;margin:0 6px;">Unsubscribe</a>
      <a href="#" style="color:rgba(255,255,255,0.25);text-decoration:none;margin:0 6px;">Preferences</a>
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