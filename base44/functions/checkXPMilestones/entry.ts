import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";
const APP  = "https://veritas.base44.app";
const HERO = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80";

const MILESTONES = [
  { xp: 100,  name: "First Steps",  color: "#34d399", verse: '"Your word is a lamp to my feet and a light to my path."', ref: "PSALM 119:105" },
  { xp: 250,  name: "Growing",      color: "#00f5ff", verse: '"But grow in the grace and knowledge of our Lord and Saviour Jesus Christ."', ref: "2 PETER 3:18" },
  { xp: 500,  name: "Disciple",     color: "#a78bfa", verse: '"If ye continue in my word, then are ye my disciples indeed."', ref: "JOHN 8:31" },
  { xp: 750,  name: "Faithful",     color: "#c9a84c", verse: '"Well done, good and faithful servant."', ref: "MATTHEW 25:21" },
  { xp: 1000, name: "Scholar",      color: "#c9a84c", verse: '"Study to shew thyself approved unto God, a workman that needeth not to be ashamed."', ref: "2 TIMOTHY 2:15" },
  { xp: 2500, name: "Elder",        color: "#f97316", verse: '"A wise man will hear, and will increase learning."', ref: "PROVERBS 1:5" },
  { xp: 5000, name: "Patriarch",    color: "#f472b6", verse: '"I have fought a good fight, I have finished my course, I have kept the faith."', ref: "2 TIMOTHY 4:7" },
];

const AUDIO_MILESTONES = [
  { seconds: 3600,   hours: 1,   name: "First Hour",   bonus_xp: 50,  color: "#34d399" },
  { seconds: 18000,  hours: 5,   name: "Five Hours",   bonus_xp: 100, color: "#00f5ff" },
  { seconds: 36000,  hours: 10,  name: "Ten Hours",    bonus_xp: 150, color: "#a78bfa" },
  { seconds: 90000,  hours: 25,  name: "Twenty-Five Hours", bonus_xp: 250, color: "#c9a84c" },
  { seconds: 180000, hours: 50,  name: "Fifty Hours",  bonus_xp: 500, color: "#f97316" },
  { seconds: 360000, hours: 100, name: "One Hundred Hours", bonus_xp: 1000, color: "#f472b6" },
];

function buildMilestoneHtml({ firstName, milestoneName, xp, verse, ref, color }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Veritas · ${milestoneName} Achievement</title>
</head>
<body style="margin:0;padding:0;background:#0f0d0a;font-family:Georgia,serif;">
<div style="max-width:480px;margin:0 auto;background:#0f0d0a;">

  <div style="width:100%;line-height:0;">
    <img src="${HERO}" alt="Achievement" width="480"
      style="width:100%;max-width:480px;display:block;height:220px;object-fit:cover;object-position:center center;"/>
  </div>

  <div style="background:#0f0d0a;text-align:center;padding:22px 24px 4px;">
    <img src="${LOGO}" alt="Veritas" width="68" height="68"
      style="border-radius:50%;border:2px solid ${color};box-shadow:0 0 22px ${color}44;display:inline-block;"/>
    <p style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.28);margin:8px 0 0;">VERITAS · THE WORD</p>
  </div>

  <div style="text-align:center;padding:12px 24px 4px;">
    <div style="display:inline-block;background:${color}18;border:1px solid ${color}55;border-radius:999px;padding:5px 20px;">
      <span style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:${color};">
        ${xp.toLocaleString()} XP · ${milestoneName.toUpperCase()}
      </span>
    </div>
  </div>

  <div style="text-align:center;padding:20px 28px 0;">
    <p style="font-family:Georgia,serif;font-size:24px;font-style:italic;color:#f5ead8;margin:0;line-height:1.35;">Milestone Reached</p>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.4);margin:10px 0 0;line-height:1.7;">
      ${firstName}, your dedication to the Sacred Scriptures<br/>has carried you to <strong style="color:${color};">${milestoneName}</strong> — ${xp.toLocaleString()} XP earned.
    </p>
  </div>

  <div style="text-align:center;padding:22px 0 0;">
    <div style="display:inline-block;width:48px;height:1px;background:${color};opacity:0.4;"></div>
    <span style="font-family:Arial,sans-serif;font-size:14px;color:${color};margin:0 10px;vertical-align:middle;">✦</span>
    <div style="display:inline-block;width:48px;height:1px;background:${color};opacity:0.4;"></div>
  </div>

  <div style="margin:20px 20px;background:#1e1a12;border-radius:20px;padding:28px 24px;text-align:center;border:1px solid ${color}25;">
    <p style="font-family:Georgia,serif;font-size:18px;font-style:italic;color:#f0e6d0;line-height:1.80;margin:0 0 16px;">${verse}</p>
    <p style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;letter-spacing:0.2em;color:${color};margin:0;">— ${ref} —</p>
  </div>

  <div style="text-align:center;padding:4px 24px 28px;">
    <a href="${APP}/#/profile" style="display:inline-block;background:${color};color:#0f0d0a;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.06em;padding:16px 52px;border-radius:50px;text-decoration:none;">
      View My Journey →
    </a>
  </div>

  <div style="text-align:center;padding:16px 24px 28px;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.35);margin:0 0 2px;">Veritas · Achievement Unlocked</p>
    <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.18);margin:8px 0 0;">© 2026 Veritas · veritas.base44.app</p>
  </div>

</div>
</body>
</html>`;
}

function buildAudioMilestoneHtml({ firstName, hours, milestoneName, bonusXp, color }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Veritas · ${hours}-Hour Listening Achievement</title>
</head>
<body style="margin:0;padding:0;background:#0f0d0a;font-family:Georgia,serif;">
<div style="max-width:480px;margin:0 auto;background:#0f0d0a;">

  <div style="width:100%;line-height:0;">
    <img src="${HERO}" alt="Achievement" width="480"
      style="width:100%;max-width:480px;display:block;height:220px;object-fit:cover;object-position:center center;"/>
  </div>

  <div style="background:#0f0d0a;text-align:center;padding:22px 24px 4px;">
    <img src="${LOGO}" alt="Veritas" width="68" height="68"
      style="border-radius:50%;border:2px solid ${color};box-shadow:0 0 22px ${color}44;display:inline-block;"/>
    <p style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.28);margin:8px 0 0;">VERITAS · THE WORD</p>
  </div>

  <div style="text-align:center;padding:12px 24px 4px;">
    <div style="display:inline-block;background:${color}18;border:1px solid ${color}55;border-radius:999px;padding:5px 20px;">
      <span style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:${color};">
        ${hours} Hours · Audio Achievement
      </span>
    </div>
  </div>

  <div style="text-align:center;padding:20px 28px 0;">
    <p style="font-family:Georgia,serif;font-size:24px;font-style:italic;color:#f5ead8;margin:0;line-height:1.35;">${milestoneName} of Listening</p>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.4);margin:10px 0 0;line-height:1.7;">
      ${firstName}, you have listened to <strong style="color:${color};">${hours} hours</strong> of Sacred Scripture.<br/>
      +${bonusXp} bonus XP awarded to your journey.
    </p>
  </div>

  <div style="margin:20px 20px;background:#1e1a12;border-radius:20px;padding:28px 24px;text-align:center;border:1px solid ${color}25;">
    <p style="font-family:Georgia,serif;font-size:18px;font-style:italic;color:#f0e6d0;line-height:1.80;margin:0 0 16px;">
      "So then faith cometh by hearing, and hearing by the word of God."
    </p>
    <p style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;letter-spacing:0.2em;color:${color};margin:0;">— ROMANS 10:17 —</p>
  </div>

  <div style="text-align:center;padding:4px 24px 28px;">
    <a href="${APP}/#/audio-dashboard" style="display:inline-block;background:${color};color:#0f0d0a;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.06em;padding:16px 52px;border-radius:50px;text-decoration:none;">
      View Audio Stats →
    </a>
  </div>

  <div style="text-align:center;padding:16px 24px 28px;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.35);margin:0 0 2px;">Veritas · Audio Achievement</p>
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
    const { previous_xp, current_xp, check_audio } = body;
    if (typeof current_xp !== 'number') return Response.json({ error: 'Missing current_xp' }, { status: 400 });

    const prevXP = previous_xp || 0;
    const newMilestones = MILESTONES.filter(m => m.xp > prevXP && m.xp <= current_xp);
    const firstName = user.full_name?.split(" ")[0] || "Beloved";

    // Check audio milestones if requested
    if (check_audio) {
      const audioHistory = await base44.entities.BibleAudioProgress.filter({ completed: true }).catch(() => []);
      const totalSeconds = (audioHistory || []).reduce((s, a) => s + (a.timestamp_seconds || 0), 0);
      const prevSeconds = body.previous_audio_seconds || 0;
      const newAudioMilestones = AUDIO_MILESTONES.filter(m => m.seconds > prevSeconds && m.seconds <= totalSeconds);
      for (const am of newAudioMilestones) {
        const xpRecords = await base44.entities.UserXP.list('-updated_date', 1).catch(() => []);
        if (xpRecords?.[0]) {
          await base44.entities.UserXP.update(xpRecords[0].id, {
            total_xp: (xpRecords[0].total_xp || 0) + am.bonus_xp,
            badges: [...(xpRecords[0].badges || []), `audio_${am.hours}h`],
          });
        }
        const html = buildAudioMilestoneHtml({ firstName, hours: am.hours, milestoneName: am.name, bonusXp: am.bonus_xp, color: am.color });
        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: "Veritas · The Word",
          to: user.email,
          subject: `${am.name} of Listening — Achievement Unlocked`,
          body: html,
        });
      }
    }

    for (const milestone of newMilestones) {
      const html = buildMilestoneHtml({
        firstName,
        milestoneName: milestone.name,
        xp: milestone.xp,
        verse: milestone.verse,
        ref: milestone.ref,
        color: milestone.color,
      });
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: "Veritas · The Word",
        to: user.email,
        subject: `${milestone.name} · ${milestone.xp.toLocaleString()} XP Milestone Reached`,
        body: html,
      });
    }

    return Response.json({ milestones_hit: newMilestones.map(m => m.name), count: newMilestones.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});