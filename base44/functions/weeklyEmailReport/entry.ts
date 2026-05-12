import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";
const APP  = "https://veritas.base44.app";
const FONTS = "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;1,400&family=Inter:wght@300;400;500&display=swap');";

function buildWeeklyReportEmail({ name, chaptersRead, highlightsCount, progressRows, highlightRows, weekStart }) {
  const firstName = name?.split(" ")[0] || "Beloved";
  const weekLabel = new Date(weekStart || new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const progressTable = progressRows?.length ? `
    <div style="margin:0 32px 20px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:18px;overflow:hidden;">
      <div style="padding:18px 22px 10px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.25);">📖 Chapters Read This Week</div>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:rgba(255,255,255,0.03);">
          <th style="padding:10px 18px;text-align:left;font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.25);">Reference</th>
          <th style="padding:10px 18px;text-align:left;font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.25);">Translation</th>
        </tr></thead>
        <tbody>${progressRows.join("")}</tbody>
      </table>
    </div>` : "";

  const highlightTable = highlightRows?.length ? `
    <div style="margin:0 32px 20px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:18px;overflow:hidden;">
      <div style="padding:18px 22px 10px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.25);">✨ Highlighted Verses</div>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:rgba(255,255,255,0.03);">
          <th style="padding:10px 18px;text-align:left;font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.25);">Verse</th>
          <th style="padding:10px 18px;text-align:left;font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.25);">Color</th>
        </tr></thead>
        <tbody>${highlightRows.join("")}</tbody>
      </table>
    </div>` : "";

  const emptyState = (!progressRows?.length && !highlightRows?.length) ? `
    <div style="background:rgba(0,245,255,0.04);border:1px solid rgba(0,245,255,0.18);border-radius:18px;padding:24px;margin:0 32px 24px;text-align:center;">
      <div style="font-family:'Playfair Display',serif;font-style:italic;font-size:15px;color:rgba(255,255,255,0.6);line-height:1.75;">Start reading daily to build your weekly summary.</div>
      <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.15em;color:#00F5FF;margin-top:10px;">— Veritas</div>
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Veritas · Weekly Report</title>
<style>
  ${FONTS}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#06080f;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
  a{text-decoration:none;}
  .wrap{max-width:600px;margin:0 auto;background:#06080f;}
  .hdr{background:linear-gradient(160deg,#0a0f1e 0%,#0d1326 60%,#06080a 100%);padding:40px 32px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07);}
  .logo{display:inline-block;border-radius:22%;overflow:hidden;width:64px;height:64px;box-shadow:0 0 36px rgba(0,245,255,0.18);}
  .logo img{width:100%;height:100%;object-fit:cover;display:block;}
  .brand{font-family:'Cinzel',serif;font-size:22px;font-weight:700;color:#fff;letter-spacing:0.20em;margin-top:14px;}
  .brand-sub{font-size:10px;font-family:'Inter',sans-serif;color:rgba(255,255,255,0.3);letter-spacing:0.25em;text-transform:uppercase;margin-top:5px;}
  .hero{background:linear-gradient(145deg,#0b1020 0%,#111827 100%);padding:44px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);}
  .pill{display:inline-block;font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#00F5FF;background:rgba(0,245,255,0.06);border:1px solid rgba(0,245,255,0.25);border-radius:999px;padding:5px 18px;margin-bottom:22px;}
  .divider{width:64px;height:1px;background:linear-gradient(90deg,transparent,rgba(0,245,255,0.5),transparent);margin:32px auto;}
  .cta-wrap{padding:8px 32px 32px;text-align:center;}
  .btn-primary{display:inline-block;font-family:'Cinzel',serif;font-size:12px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#06080f;background:linear-gradient(135deg,#00F5FF,rgba(0,245,255,0.75));border-radius:13px;padding:15px 36px;margin:6px;box-shadow:0 6px 28px rgba(0,245,255,0.18);}
  .btn-secondary{display:inline-block;font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#00F5FF;background:rgba(255,255,255,0.04);border:1px solid rgba(0,245,255,0.35);border-radius:13px;padding:12px 24px;margin:5px;}
  .ftr{padding:28px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);}
  .ftr p{font-family:'Inter',sans-serif;font-size:11px;color:rgba(255,255,255,0.18);line-height:1.9;}
  .ftr a{color:rgba(255,255,255,0.28);font-size:11px;margin:0 8px;}
  @media(max-width:600px){.cta-wrap{padding:8px 16px 24px;}.hdr,.hero{padding-left:20px;padding-right:20px;}}
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
    <div class="pill">Week of ${weekLabel}</div>
    <div style="font-family:'Cinzel',serif;font-size:13px;color:rgba(255,255,255,0.4);letter-spacing:0.08em;margin-bottom:8px;">Your week in the Word,</div>
    <div style="font-family:'Playfair Display',serif;font-size:28px;font-style:italic;color:rgba(255,255,255,0.9);">${firstName}</div>
    <div style="font-family:'Inter',sans-serif;font-size:14px;font-weight:300;color:rgba(255,255,255,0.4);margin-top:12px;line-height:1.7;">Seven days. Seven verses. One faithful God.</div>
  </div>

  <div class="divider"></div>

  <!-- Stats row -->
  <table style="width:calc(100% - 64px);margin:0 32px 24px;border-spacing:12px 0;border-collapse:separate;">
    <tr>
      <td style="width:50%;background:rgba(0,245,255,0.05);border:1px solid rgba(0,245,255,0.18);border-radius:14px;padding:20px;text-align:center;">
        <div style="font-family:'Cinzel',serif;font-size:34px;font-weight:700;color:#00F5FF;line-height:1;">${chaptersRead || 0}</div>
        <div style="font-family:'Inter',sans-serif;font-size:11px;color:rgba(255,255,255,0.35);margin-top:7px;">Chapters Read</div>
      </td>
      <td style="width:50%;background:rgba(167,139,250,0.05);border:1px solid rgba(167,139,250,0.18);border-radius:14px;padding:20px;text-align:center;">
        <div style="font-family:'Cinzel',serif;font-size:34px;font-weight:700;color:#a78bfa;line-height:1;">${highlightsCount || 0}</div>
        <div style="font-family:'Inter',sans-serif;font-size:11px;color:rgba(255,255,255,0.35);margin-top:7px;">Verses Highlighted</div>
      </td>
    </tr>
  </table>

  ${progressTable}
  ${highlightTable}
  ${emptyState}

  <div class="cta-wrap">
    <a href="${APP}" class="btn-primary">Continue This Week</a>
    <br/>
    <a href="${APP}/plans" class="btn-secondary">📖 Start a Plan</a>
    <a href="${APP}/prayer-journal" class="btn-secondary">🙏 Prayer Journal</a>
  </div>

  <div class="ftr">
    <p>"Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105<br/>You have weekly reports enabled in your Veritas preferences.</p>
    <div style="margin-top:12px;"><a href="#">Unsubscribe</a><a href="${APP}">Open App</a><a href="#">Preferences</a></div>
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

    const [progress, highlights] = await Promise.all([
      base44.entities.ReadingProgress.list('-created_date', 50),
      base44.entities.UserHighlight.list('-created_date', 30),
    ]);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentProgress  = (progress   || []).filter(p => new Date(p.created_date) >= weekAgo);
    const recentHighlights = (highlights || []).filter(h => new Date(h.created_date) >= weekAgo);

    const COLOR_NAMES = { yellow: "🟡", cyan: "🔵", purple: "🟣", green: "🟢", red: "🔴" };

    const progressRows = recentProgress.slice(0, 10).map(p =>
      `<tr style="border-top:1px solid rgba(255,255,255,0.04);">
         <td style="padding:9px 18px;font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.72);">${p.book} ${p.chapter}</td>
         <td style="padding:9px 18px;font-family:'Cinzel',serif;font-size:11px;color:rgba(255,255,255,0.35);">${p.translation || "KJV"}</td>
       </tr>`
    );

    const highlightRows = recentHighlights.slice(0, 10).map(h =>
      `<tr style="border-top:1px solid rgba(255,255,255,0.04);">
         <td style="padding:9px 18px;font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.72);">${h.verse_ref}</td>
         <td style="padding:9px 18px;font-family:'Cinzel',serif;font-size:11px;color:rgba(255,255,255,0.35);">${COLOR_NAMES[h.color] || "⭐"} ${h.color}</td>
       </tr>`
    );

    const weekStart = weekAgo.toISOString().split("T")[0];

    const html = buildWeeklyReportEmail({
      name: user.full_name,
      chaptersRead: recentProgress.length,
      highlightsCount: recentHighlights.length,
      progressRows,
      highlightRows,
      weekStart,
    });

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: "Veritas · The Word",
      to: user.email,
      subject: `✦ Your Veritas Weekly Report — ${recentProgress.length} chapter${recentProgress.length !== 1 ? "s" : ""} read`,
      body: html,
    });

    return Response.json({ sent: true, chapters: recentProgress.length, highlights: recentHighlights.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});