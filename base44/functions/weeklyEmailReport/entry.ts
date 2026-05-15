import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";
const APP  = "https://veritas.base44.app";
const HERO = "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=600&q=80";

function buildWeeklyReportEmail({ name, chaptersRead, highlightsCount, prayerCount, progressRows, highlightRows, prayerRows, weekStart, totalXP }) {
  const firstName = name?.split(" ")[0] || "Beloved";
  const weekLabel = new Date(weekStart || new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const chaptersHtml = progressRows?.length ? progressRows.slice(0, 6).join("") : "";
  const highlightsHtml = highlightRows?.length ? highlightRows.slice(0, 6).join("") : "";
  const prayerHtml = prayerRows?.length ? prayerRows.slice(0, 5).join("") : "";

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
  <div style="width:100%;line-height:0;">
    <img src="${HERO}" alt="Veritas" width="480" style="width:100%;max-width:480px;display:block;height:220px;object-fit:cover;object-position:center center;"/>
  </div>

  <!-- LOGO -->
  <div style="background:#1a1510;text-align:center;padding:0 24px 4px;margin-top:-44px;position:relative;z-index:2;">
    <img src="${LOGO}" alt="Veritas" width="80" height="80"
      style="border-radius:50%;border:3px solid #c9a84c;box-shadow:0 0 28px rgba(201,168,76,0.4);display:inline-block;background:#1a1510;"/>
    <p style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.28);margin:10px 0 0;">VERITAS · THE WORD</p>
  </div>

  <!-- LABEL -->
  <div style="text-align:center;padding:12px 24px 4px;">
    <span style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;">WEEKLY DIGEST</span>
  </div>

  <!-- GREETING -->
  <div style="margin:16px 20px 16px;background:#2a2015;border-radius:20px;padding:28px 24px;text-align:center;border:1px solid rgba(201,168,76,0.15);">
    <p style="font-family:Georgia,serif;font-size:20px;font-style:italic;color:#f0e6d0;line-height:1.7;margin:0 0 8px;">
      "Your week in the Word, ${firstName}"
    </p>
    <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.4);margin:0;">Week of ${weekLabel}</p>
  </div>

  <!-- STATS ROW -->
  <div style="margin:0 20px 16px;display:table;width:calc(100% - 40px);">
    <div style="display:table-cell;width:33%;padding-right:4px;">
      <div style="background:#2a2015;border:1px solid rgba(201,168,76,0.2);border-radius:16px;padding:14px 8px;text-align:center;">
        <div style="font-family:Arial,sans-serif;font-size:28px;font-weight:bold;color:#c9a84c;line-height:1;">${chaptersRead || 0}</div>
        <div style="font-family:Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.35);margin-top:4px;letter-spacing:0.06em;text-transform:uppercase;">Chapters</div>
      </div>
    </div>
    <div style="display:table-cell;width:33%;padding:0 2px;">
      <div style="background:#2a2015;border:1px solid rgba(167,139,250,0.2);border-radius:16px;padding:14px 8px;text-align:center;">
        <div style="font-family:Arial,sans-serif;font-size:28px;font-weight:bold;color:#a78bfa;line-height:1;">${highlightsCount || 0}</div>
        <div style="font-family:Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.35);margin-top:4px;letter-spacing:0.06em;text-transform:uppercase;">Highlights</div>
      </div>
    </div>
    <div style="display:table-cell;width:33%;padding-left:4px;">
      <div style="background:#2a2015;border:1px solid rgba(0,229,255,0.2);border-radius:16px;padding:14px 8px;text-align:center;">
        <div style="font-family:Arial,sans-serif;font-size:28px;font-weight:bold;color:#00e5ff;line-height:1;">${prayerCount || 0}</div>
        <div style="font-family:Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.35);margin-top:4px;letter-spacing:0.06em;text-transform:uppercase;">Prayers</div>
      </div>
    </div>
  </div>

  ${totalXP ? `
  <!-- XP MILESTONE -->
  <div style="margin:0 20px 16px;background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.15);border-radius:14px;padding:14px 18px;text-align:center;">
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#fbbf24;margin:0;">⭐ You've earned <strong>${totalXP} XP</strong> total — keep growing!</p>
  </div>` : ''}

  <!-- CHAPTERS READ -->
  ${chaptersHtml ? `
  <div style="margin:0 20px 16px;">
    <p style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin:0 0 8px;">📖 Chapters Read This Week</p>
    ${chaptersHtml}
  </div>` : ''}

  <!-- PRAYER JOURNAL -->
  ${prayerHtml ? `
  <div style="margin:0 20px 16px;">
    <p style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin:0 0 8px;">🙏 Prayer Journal This Week</p>
    ${prayerHtml}
  </div>` : ''}

  <!-- HIGHLIGHTS -->
  ${highlightsHtml ? `
  <div style="margin:0 20px 20px;">
    <p style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin:0 0 8px;">✨ Verses You Highlighted</p>
    ${highlightsHtml}
  </div>` : ''}

  ${!chaptersHtml && !highlightsHtml && !prayerHtml ? `
  <div style="margin:0 20px 20px;background:#2a2015;border-radius:16px;padding:24px;text-align:center;border:1px solid rgba(201,168,76,0.1);">
    <p style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:rgba(255,255,255,0.4);margin:0;">"Begin reading each day to see your weekly digest here."</p>
  </div>` : ''}

  <!-- ENCOURAGEMENT -->
  <div style="margin:0 20px 20px;background:#2a2015;border-radius:14px;padding:20px 18px;border-left:3px solid #c9a84c;">
    <p style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:#e8d5b0;line-height:1.7;margin:0;">
      "Your word is a lamp to my feet and a light to my path." — Psalm 119:105
    </p>
  </div>

  <!-- CTA BUTTON -->
  <div style="text-align:center;padding:4px 24px 28px;">
    <a href="${APP}/#/" style="display:inline-block;background:#c9a84c;color:#1a1205;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.04em;padding:16px 48px;border-radius:50px;text-decoration:none;">
      Open Veritas →
    </a>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;padding:16px 24px 28px;border-top:1px solid rgba(255,255,255,0.07);">
    <img src="${LOGO}" alt="Veritas" width="36" height="36"
      style="border-radius:50%;border:2px solid rgba(201,168,76,0.4);display:inline-block;margin-bottom:8px;"/>
    <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.45);margin:0 0 2px;">Veritas — Weekly Digest</p>
    <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.2);margin:8px 0 0;">Sent automatically every week · © 2026 Veritas</p>
  </div>

</div>
</body>
</html>`;
}

// This function supports two modes:
// 1. Called directly by a user (GET/POST from frontend) → sends to that user
// 2. Called by scheduled automation (no auth) using service role → sends to ALL users
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Try to get the calling user
    let user = null;
    try { user = await base44.auth.me(); } catch {}

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekStart = weekAgo.toISOString().split("T")[0];

    async function buildAndSendForUser(targetUser) {
      if (!targetUser?.email) return false;

      const [progress, highlights, prayers, xpRecords] = await Promise.all([
        base44.asServiceRole.entities.ReadingProgress.filter({ created_by: targetUser.email }),
        base44.asServiceRole.entities.UserHighlight.filter({ created_by: targetUser.email }),
        base44.asServiceRole.entities.PrayerJournal.filter({ created_by: targetUser.email }),
        base44.asServiceRole.entities.UserXP.filter({ created_by: targetUser.email }),
      ]);

      const recentProgress   = (progress   || []).filter(p => new Date(p.created_date) >= weekAgo);
      const recentHighlights = (highlights || []).filter(h => new Date(h.created_date) >= weekAgo);
      const recentPrayers    = (prayers    || []).filter(p => new Date(p.created_date) >= weekAgo);
      const totalXP = (xpRecords?.[0]?.total_xp || 0);

      // Only send if user had any activity this week
      if (recentProgress.length === 0 && recentHighlights.length === 0 && recentPrayers.length === 0) return false;

      const COLOR_NAMES = { yellow: "🟡", cyan: "🔵", purple: "🟣", green: "🟢", red: "🔴" };
      const MOOD_EMOJI  = { grateful: "🙏", confessing: "💙", interceding: "✨", celebrating: "🎉" };

      const progressRows = recentProgress.slice(0, 6).map(p =>
        `<div style="border-left:3px solid rgba(201,168,76,0.4);padding:10px 14px;margin-bottom:8px;background:rgba(201,168,76,0.04);border-radius:0 10px 10px 0;">
           <span style="font-family:Arial,sans-serif;font-size:13px;color:#e8d5b0;">${p.book} ${p.chapter}</span>
           <span style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.3);margin-left:10px;">${p.translation || "KJV"}</span>
         </div>`
      );

      const highlightRows = recentHighlights.slice(0, 6).map(h =>
        `<div style="border-left:3px solid rgba(167,139,250,0.4);padding:10px 14px;margin-bottom:8px;background:rgba(167,139,250,0.04);border-radius:0 10px 10px 0;">
           <span style="font-family:Arial,sans-serif;font-size:13px;color:#e8d5b0;">${h.verse_ref}</span>
           <span style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.3);margin-left:10px;">${COLOR_NAMES[h.color] || "⭐"}</span>
         </div>`
      );

      const prayerRows = recentPrayers.slice(0, 5).map(p =>
        `<div style="border-left:3px solid rgba(0,229,255,0.3);padding:10px 14px;margin-bottom:8px;background:rgba(0,229,255,0.03);border-radius:0 10px 10px 0;">
           <div style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:4px;">${MOOD_EMOJI[p.mood] || "🙏"} ${p.mood || "prayer"} ${p.verse_ref ? '· ' + p.verse_ref : ''}</div>
           <span style="font-family:Georgia,serif;font-size:13px;color:#e8d5b0;font-style:italic;">"${(p.prayer_text || '').slice(0, 100)}${p.prayer_text?.length > 100 ? '…' : ''}"</span>
           ${p.answered ? '<div style="margin-top:4px;font-size:11px;color:#34d399;">✅ Answered</div>' : ''}
         </div>`
      );

      const html = buildWeeklyReportEmail({
        name: targetUser.full_name,
        chaptersRead: recentProgress.length,
        highlightsCount: recentHighlights.length,
        prayerCount: recentPrayers.length,
        progressRows,
        highlightRows,
        prayerRows,
        weekStart,
        totalXP,
      });

      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: "Veritas · The Word",
        to: targetUser.email,
        subject: `✦ Your Weekly Veritas Digest — ${recentProgress.length} chapter${recentProgress.length !== 1 ? "s" : ""} read`,
        body: html,
      });

      return true;
    }

    // If called by a logged-in user directly, send only to them
    if (user) {
      const sent = await buildAndSendForUser(user);
      return Response.json({ sent, mode: "single_user" });
    }

    // Otherwise (scheduled automation), send to all users
    const allUsers = await base44.asServiceRole.entities.User.list();
    let sentCount = 0;
    for (const u of allUsers) {
      const sent = await buildAndSendForUser(u);
      if (sent) sentCount++;
    }

    return Response.json({ sent: true, digestsSent: sentCount, mode: "all_users" });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});