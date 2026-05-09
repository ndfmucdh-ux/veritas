import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MILESTONES = [
  { xp: 100, name: "First Steps", message: "You've reached 100 XP — your journey has truly begun! 🌱" },
  { xp: 250, name: "Growing", message: "250 XP milestone reached! You're growing in the Word daily. 🔥" },
  { xp: 500, name: "Disciple", message: "500 XP! You've become a true Disciple. Keep pressing forward! 📖" },
  { xp: 750, name: "Faithful", message: "750 XP — your faithfulness is bearing fruit! 🍎" },
  { xp: 1000, name: "Scholar", message: "1,000 XP — Scholar level unlocked! Your dedication is inspiring. ✨" },
  { xp: 2500, name: "Elder", message: "2,500 XP! You've reached Elder status — a beacon of scripture wisdom. 🏆" },
  { xp: 5000, name: "Patriarch", message: "5,000 XP! Patriarch level achieved — walking in the footsteps of the greats. 👑" },
];

// Audio listening hour milestones (in seconds)
const AUDIO_MILESTONES = [
  { seconds: 3600,   hours: 1,   badge: "🎧", name: "First Hour", bonus_xp: 50,  message: "1 hour of scripture audio complete! The Word is washing over you. +50 XP" },
  { seconds: 18000,  hours: 5,   badge: "🔊", name: "5 Hours",    bonus_xp: 100, message: "5 hours of listening — your faith is growing through hearing! +100 XP" },
  { seconds: 36000,  hours: 10,  badge: "📻", name: "10 Hours",   bonus_xp: 150, message: "10 hours! 'Faith comes from hearing.' You're living it. +150 XP" },
  { seconds: 90000,  hours: 25,  badge: "🌟", name: "25 Hours",   bonus_xp: 250, message: "25 hours of scripture audio — extraordinary dedication! +250 XP" },
  { seconds: 180000, hours: 50,  badge: "🏅", name: "50 Hours",   bonus_xp: 500, message: "50 HOURS of scripture audio! You are a true student of the Word. +500 XP 🏅" },
  { seconds: 360000, hours: 100, badge: "👑", name: "100 Hours",  bonus_xp: 1000, message: "100 HOURS! You have sat at the feet of the Word like few others. +1000 XP 👑" },
];

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

    // Check audio milestones if requested
    if (check_audio) {
      const audioHistory = await base44.entities.BibleAudioProgress.filter({ completed: true }).catch(() => []);
      const totalSeconds = (audioHistory || []).reduce((s, a) => s + (a.timestamp_seconds || 0), 0);
      const prevSeconds = body.previous_audio_seconds || 0;
      const newAudioMilestones = AUDIO_MILESTONES.filter(m => m.seconds > prevSeconds && m.seconds <= totalSeconds);
      for (const am of newAudioMilestones) {
        // Award bonus XP
        const xpRecords = await base44.entities.UserXP.list('-updated_date', 1).catch(() => []);
        if (xpRecords?.[0]) {
          await base44.entities.UserXP.update(xpRecords[0].id, {
            total_xp: (xpRecords[0].total_xp || 0) + am.bonus_xp,
            badges: [...(xpRecords[0].badges || []), `audio_${am.hours}h`],
          });
        }
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: `${am.badge} Audio Milestone: ${am.name} Unlocked!`,
          body: `<div style="background:#0a0f1e;font-family:Georgia,serif;color:#e2e8f0;max-width:500px;margin:0 auto;padding:32px;text-align:center;border-radius:16px;">
            <p style="font-size:64px;margin:0;">${am.badge}</p>
            <h1 style="color:#fbbf24;font-size:22px;margin:8px 0 4px;">Audio Milestone!</h1>
            <h2 style="color:#00f5ff;font-size:18px;margin:0;">${am.name} Listening</h2>
            <p style="color:#94a3b8;font-size:16px;line-height:1.6;margin:20px 0;">${am.message}</p>
            <p style="color:#475569;font-size:13px;font-style:italic;">"Faith comes from hearing, and hearing through the word of Christ." — Romans 10:17</p>
          </div>`
        });
      }
    }

    for (const milestone of newMilestones) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: `🏆 Milestone Reached: ${milestone.name} — ${milestone.xp} XP!`,
        body: `
<!DOCTYPE html>
<html>
<body style="background:#0a0f1e;font-family:Georgia,serif;color:#e2e8f0;max-width:500px;margin:0 auto;padding:32px;text-align:center;">
  <div style="margin-bottom:24px;">
    <p style="font-size:64px;margin:0;">🏆</p>
    <h1 style="color:#fbbf24;font-size:22px;margin:8px 0 4px;">Milestone Reached!</h1>
    <h2 style="color:#00f5ff;font-size:18px;margin:0;">${milestone.name} · ${milestone.xp} XP</h2>
  </div>
  <p style="color:#94a3b8;font-size:16px;line-height:1.6;margin-bottom:24px;">${milestone.message}</p>
  <p style="color:#475569;font-size:13px;font-style:italic;">"Well done, good and faithful servant." — Matthew 25:21</p>
  <a href="${Deno.env.get('APP_URL') || '#'}/profile" style="display:inline-block;margin-top:20px;padding:10px 28px;background:rgba(251,191,36,0.15);border:1px solid rgba(251,191,36,0.4);border-radius:8px;color:#fbbf24;text-decoration:none;">View My Progress →</a>
</body>
</html>`,
      });
    }

    return Response.json({ milestones_hit: newMilestones.map(m => m.name), count: newMilestones.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});