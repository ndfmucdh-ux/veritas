import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MILESTONES = [
  { xp: 100, name: "First Steps", message: "You've reached 100 XP — your journey has truly begun! 🌱" },
  { xp: 500, name: "Disciple", message: "500 XP! You've become a true Disciple. Keep pressing forward! 📖" },
  { xp: 1000, name: "Scholar", message: "1,000 XP — Scholar level unlocked! Your dedication is inspiring. ✨" },
  { xp: 2500, name: "Elder", message: "2,500 XP! You've reached Elder status — a beacon of scripture wisdom. 🏆" },
  { xp: 5000, name: "Patriarch", message: "5,000 XP! Patriarch level achieved — walking in the footsteps of the greats. 👑" },
  { xp: 250, name: "Growing", message: "250 XP milestone reached! You're growing in the Word daily. 🔥" },
  { xp: 750, name: "Faithful", message: "750 XP — your faithfulness is bearing fruit! 🍎" },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { previous_xp, current_xp } = await req.json();
    if (typeof current_xp !== 'number') return Response.json({ error: 'Missing current_xp' }, { status: 400 });

    const prevXP = previous_xp || 0;
    const newMilestones = MILESTONES.filter(m => m.xp > prevXP && m.xp <= current_xp);

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