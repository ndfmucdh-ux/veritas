import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";
const APP  = "https://veritas.base44.app";

// Celebration hero images — sunrise, mountain peaks, light breaking through
const CELEBRATION_HEROES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", // mountain sunrise
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80", // aerial valley light
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80", // golden peak
];

const MILESTONES = {
  7:   { label: "7-Day Streak", icon: "🔥", title: "Seven Days of Faithfulness", color: "#f97316", verse: "\"Great is thy faithfulness.\"", ref: "LAMENTATIONS 3:23" },
  14:  { label: "14-Day Streak", icon: "⚡", title: "A Fortnight in the Word", color: "#FFD700", verse: "\"Blessed is the one who reads aloud the words of this prophecy.\"", ref: "REVELATION 1:3" },
  21:  { label: "21-Day Streak", icon: "🏆", title: "Twenty-One Days Strong", color: "#00F5FF", verse: "\"I can do all things through Christ which strengtheneth me.\"", ref: "PHILIPPIANS 4:13" },
  30:  { label: "30-Day Streak", icon: "👑", title: "A Month of Devotion", color: "#c9a84c", verse: "\"His mercies are new every morning.\"", ref: "LAMENTATIONS 3:23" },
  60:  { label: "60-Day Streak", icon: "🌟", title: "Two Months Unbroken", color: "#a78bfa", verse: "\"They that wait upon the Lord shall renew their strength.\"", ref: "ISAIAH 40:31" },
  100: { label: "100-Day Streak", icon: "💎", title: "One Hundred Days of Grace", color: "#f472b6", verse: "\"Thou art my hiding place; thou shalt preserve me from trouble.\"", ref: "PSALM 32:7" },
  365: { label: "1-Year Streak", icon: "🕊️", title: "A Year in His Presence", color: "#34d399", verse: "\"Surely goodness and mercy shall follow me all the days of my life.\"", ref: "PSALM 23:6" },
};

function buildMilestoneEmail({ name, streakDays, chaptersRead }) {
  const firstName = name?.split(" ")[0] || "Beloved";
  const milestone = MILESTONES[streakDays] || {
    label: `${streakDays}-Day Streak`,
    icon: "🔥",
    title: `${streakDays} Days in the Word`,
    color: "#c9a84c",
    verse: '"Your word is a lamp to my feet and a light to my path."',
    ref: "PSALM 119:105",
  };
  const heroImg = CELEBRATION_HEROES[streakDays % CELEBRATION_HEROES.length];
  const accentColor = milestone.color;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Veritas · ${milestone.label} Achievement</title>
</head>
<body style="margin:0;padding:0;background:#0f0d0a;font-family:Georgia,serif;">
<div style="max-width:480px;margin:0 auto;background:#0f0d0a;">

  <!-- HERO IMAGE — full-width, no overlap -->
  <div style="width:100%;line-height:0;">
    <img src="${heroImg}" alt="Celebration" width="480"
      style="width:100%;max-width:480px;display:block;height:220px;object-fit:cover;object-position:center top;"/>
  </div>

  <!-- LOGO + BRAND — below image, fully visible -->
  <div style="background:#0f0d0a;text-align:center;padding:24px 24px 8px;">
    <img src="${LOGO}" alt="Veritas" width="64" height="64"
      style="border-radius:50%;border:2px solid ${accentColor};box-shadow:0 0 20px rgba(201,168,76,0.35);display:inline-block;"/>
    <p style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin:10px 0 0;">VERITAS · THE WORD</p>
  </div>

  <!-- CELEBRATION BADGE -->
  <div style="text-align:center;padding:8px 24px 0;">
    <div style="display:inline-block;background:${accentColor}18;border:1px solid ${accentColor}55;border-radius:999px;padding:6px 22px;">
      <span style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${accentColor};">
        ${milestone.icon} ${milestone.label.toUpperCase()}
      </span>
    </div>
  </div>

  <!-- ACHIEVEMENT TITLE -->
  <div style="text-align:center;padding:20px 28px 0;">
    <p style="font-family:Georgia,serif;font-size:26px;font-style:italic;color:#f5ead8;margin:0;line-height:1.35;">${milestone.title}</p>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.4);margin:10px 0 0;line-height:1.7;">
      ${firstName}, you have shown up for God's Word<br/>
      <strong style="color:${accentColor};">${streakDays} days</strong> in a row. That is not ordinary — that is holy discipline.
    </p>
  </div>

  <!-- DIVIDER -->
  <div style="text-align:center;padding:22px 0 0;">
    <div style="display:inline-block;width:48px;height:1px;background:${accentColor};opacity:0.4;"></div>
    <span style="font-family:Arial,sans-serif;font-size:14px;color:${accentColor};margin:0 10px;vertical-align:middle;">✦</span>
    <div style="display:inline-block;width:48px;height:1px;background:${accentColor};opacity:0.4;"></div>
  </div>

  <!-- VERSE CARD -->
  <div style="margin:20px 20px;background:#1e1a12;border-radius:20px;padding:28px 24px;text-align:center;border:1px solid ${accentColor}25;">
    <p style="font-family:Georgia,serif;font-size:18px;font-style:italic;color:#f0e6d0;line-height:1.80;margin:0 0 16px;">
      ${milestone.verse}
    </p>
    <p style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;letter-spacing:0.2em;color:${accentColor};margin:0;">
      — ${milestone.ref} —
    </p>
  </div>

  <!-- STATS ROW -->
  <div style="margin:0 20px 20px;display:table;width:calc(100% - 40px);">
    <div style="display:table-cell;width:50%;padding-right:6px;">
      <div style="background:#1e1a12;border:1px solid ${accentColor}25;border-radius:14px;padding:16px;text-align:center;">
        <div style="font-family:Georgia,serif;font-size:28px;color:${accentColor};font-weight:bold;line-height:1;">${streakDays}</div>
        <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-top:4px;">Day Streak</div>
      </div>
    </div>
    <div style="display:table-cell;width:50%;padding-left:6px;">
      <div style="background:#1e1a12;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;text-align:center;">
        <div style="font-family:Georgia,serif;font-size:28px;color:#a78bfa;font-weight:bold;line-height:1;">${chaptersRead || '?'}</div>
        <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-top:4px;">Chapters Read</div>
      </div>
    </div>
  </div>

  <!-- MESSAGE -->
  <div style="margin:0 20px 24px;padding:20px 22px;background:#1a1510;border-radius:16px;border-left:3px solid ${accentColor};">
    <p style="font-family:Georgia,serif;font-size:14px;font-style:italic;color:rgba(255,255,255,0.65);line-height:1.75;margin:0;">
      "Keep going, ${firstName}. The discipline you build today becomes the faith that carries you through tomorrow. His Word never returns void."
    </p>
  </div>

  <!-- CTA BUTTON -->
  <div style="text-align:center;padding:4px 24px 28px;">
    <a href="${APP}/#/" style="display:inline-block;background:${accentColor};color:#0f0d0a;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.06em;padding:16px 52px;border-radius:50px;text-decoration:none;">
      ${milestone.icon} Continue Your Streak →
    </a>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;padding:16px 24px 28px;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.35);margin:0 0 2px;">Veritas · Achievement Unlocked</p>
    <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.18);margin:8px 0 0;">© 2026 Veritas · veritas.base44.app</p>
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

    const body = await req.json().catch(() => ({}));
    const { streakDays, preview } = body;

    const xpData = await base44.entities.UserXP.list('-updated_date', 1).catch(() => []);
    const streak = streakDays || xpData?.[0]?.streak_days || 0;
    const chapters = xpData?.[0]?.chapters_read || 0;

    // Only send for known milestones unless preview mode
    const milestoneDays = [7, 14, 21, 30, 60, 100, 365];
    if (!preview && !milestoneDays.includes(streak)) {
      return Response.json({ skipped: true, reason: `${streak} is not a milestone day` });
    }

    const html = buildMilestoneEmail({ name: user.full_name, streakDays: streak, chaptersRead: chapters });

    if (preview) {
      return Response.json({ html, streak, chapters });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: "Veritas · The Word",
      to: user.email,
      subject: `${streak >= 30 ? "👑" : "🔥"} ${streak}-Day Streak Achievement — Keep Going, ${user.full_name?.split(" ")[0] || "Beloved"}!`,
      body: html,
    });

    return Response.json({ sent: true, streak, milestone: `${streak}-day` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});