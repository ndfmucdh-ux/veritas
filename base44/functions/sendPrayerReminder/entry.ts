import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";
const APP  = "https://veritas.base44.app";
const FONTS = "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;1,400&family=Inter:wght@300;400;500&display=swap');";

function buildPrayerReminderEmail({ name, message, daysSince }) {
  const firstName = name?.split(" ")[0] || "Beloved";
  const formattedDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const contextLine = daysSince === null
    ? "Your prayer journal is ready — begin today and watch how God moves."
    : daysSince === 0
    ? "You've already prayed today. May your prayers rise like incense before Him."
    : `It has been <strong style="color:#a78bfa;">${daysSince} day${daysSince > 1 ? "s" : ""}</strong> since your last prayer entry. Your heart is welcome here.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Veritas · Prayer Journal Reminder</title>
<style>
  ${FONTS}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#06080f;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
  a{text-decoration:none;}
  .wrap{max-width:600px;margin:0 auto;background:#06080f;}
  .hdr{background:linear-gradient(160deg,#0a0f1e 0%,#0d1326 60%,#06080a 100%);padding:40px 32px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07);}
  .logo{display:inline-block;border-radius:22%;overflow:hidden;width:64px;height:64px;box-shadow:0 0 36px rgba(167,139,250,0.2);}
  .logo img{width:100%;height:100%;object-fit:cover;display:block;}
  .brand{font-family:'Cinzel',serif;font-size:22px;font-weight:700;color:#fff;letter-spacing:0.20em;margin-top:14px;}
  .brand-sub{font-size:10px;font-family:'Inter',sans-serif;color:rgba(255,255,255,0.3);letter-spacing:0.25em;text-transform:uppercase;margin-top:5px;}
  .hero{background:linear-gradient(145deg,#0b1020 0%,#111827 100%);padding:44px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);}
  .pill{display:inline-block;font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#a78bfa;background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.25);border-radius:999px;padding:5px 18px;margin-bottom:22px;}
  .hero-title{font-family:'Cinzel',serif;font-size:20px;color:rgba(255,255,255,0.88);letter-spacing:0.06em;margin-bottom:10px;}
  .hero-sub{font-family:'Playfair Display',serif;font-size:16px;color:rgba(255,255,255,0.5);font-style:italic;margin-top:8px;}
  .divider{width:64px;height:1px;background:linear-gradient(90deg,transparent,rgba(167,139,250,0.5),transparent);margin:32px auto;}
  .card{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:28px;margin:0 32px 24px;}
  .card-label{font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:14px;}
  .card-text{font-family:'Inter',sans-serif;font-size:15px;font-weight:300;color:rgba(255,255,255,0.72);line-height:1.85;}
  .accent-card{background:rgba(167,139,250,0.04);border:1px solid rgba(167,139,250,0.18);border-radius:18px;padding:24px;margin:0 32px 24px;text-align:center;}
  .accent-card .quote{font-family:'Playfair Display',serif;font-style:italic;font-size:15px;color:rgba(255,255,255,0.78);line-height:1.75;}
  .accent-card .ref{font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.15em;color:#a78bfa;margin-top:10px;}
  .cta-wrap{padding:8px 32px 32px;text-align:center;}
  .btn-primary{display:inline-block;font-family:'Cinzel',serif;font-size:12px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#06080f;background:linear-gradient(135deg,#a78bfa,rgba(167,139,250,0.75));border-radius:13px;padding:15px 36px;margin:6px;box-shadow:0 6px 28px rgba(167,139,250,0.2);}
  .btn-secondary{display:inline-block;font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#a78bfa;background:rgba(255,255,255,0.04);border:1px solid rgba(167,139,250,0.35);border-radius:13px;padding:12px 24px;margin:5px;}
  .ftr{padding:28px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);}
  .ftr p{font-family:'Inter',sans-serif;font-size:11px;color:rgba(255,255,255,0.18);line-height:1.9;}
  .ftr a{color:rgba(255,255,255,0.28);font-size:11px;margin:0 8px;}
  @media(max-width:600px){.card,.accent-card{margin:0 16px 20px;padding:20px;}.cta-wrap{padding:8px 16px 24px;}.hdr,.hero{padding-left:20px;padding-right:20px;}}
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
    <div class="hero-title">Time to pray, ${firstName} 🙏</div>
    <div class="hero-sub">Your heart is welcome here</div>
  </div>
  <div class="divider"></div>
  <div class="card">
    <div class="card-label">✦ A Moment with God</div>
    <div class="card-text">${contextLine} ${message ? `<br/><br/>${message}` : "Open your prayer journal and bring what's on your heart — gratitude, confession, intercession, or simply His presence."}</div>
  </div>
  <div class="accent-card">
    <div class="quote">"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."</div>
    <div class="ref">— Philippians 4:6</div>
  </div>
  <div class="cta-wrap">
    <a href="${APP}/prayer-journal" class="btn-primary">Open Prayer Journal</a>
    <br/>
    <a href="${APP}/read" class="btn-secondary">📖 Read the Word</a>
    <a href="${APP}/study-center" class="btn-secondary">🕊️ Study Center</a>
  </div>
  <div class="ftr">
    <p>"The prayer of a righteous person is powerful and effective." — James 5:16<br/>You have prayer reminders enabled in your Veritas preferences.</p>
    <div style="margin-top:12px;"><a href="#">Unsubscribe</a><a href="${APP}">Open App</a></div>
  </div>
</div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const prayers = await base44.entities.PrayerJournal.list('-created_date', 1);
    const lastPrayer = prayers?.[0];
    const lastPrayerDate = lastPrayer ? new Date(lastPrayer.created_date) : null;
    const daysSince = lastPrayerDate
      ? Math.floor((Date.now() - lastPrayerDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const html = buildPrayerReminderEmail({
      name: user.full_name,
      message: null,
      daysSince,
    });

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: "Veritas · The Word",
      to: user.email,
      subject: `🙏 Time to Pray, ${user.full_name?.split(" ")[0] || "Beloved"} — Your Journal Awaits`,
      body: html,
    });

    return Response.json({ sent: true, days_since_last: daysSince });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});