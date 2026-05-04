import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get last prayer journal entry
    const prayers = await base44.entities.PrayerJournal.list('-created_date', 1);
    const lastPrayer = prayers?.[0];
    const lastPrayerDate = lastPrayer ? new Date(lastPrayer.created_date) : null;
    const daysSince = lastPrayerDate
      ? Math.floor((Date.now() - lastPrayerDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const message = daysSince === null
      ? "You haven't started your Prayer Journal yet. Begin today and watch how God moves."
      : daysSince === 0
      ? "You've already prayed today — may your prayers rise like incense before Him. 🙏"
      : `It's been ${daysSince} day${daysSince > 1 ? 's' : ''} since your last prayer entry. Your heart is welcome here.`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: '🙏 Time to Pray — Your Journal Awaits',
      body: `
<!DOCTYPE html>
<html>
<body style="background:#0a0f1e;font-family:Georgia,serif;color:#e2e8f0;max-width:500px;margin:0 auto;padding:32px;">
  <div style="text-align:center;margin-bottom:28px;">
    <p style="font-size:56px;margin:0;">🙏</p>
    <h1 style="color:#a78bfa;font-size:20px;margin:8px 0 4px;">Prayer Journal Reminder</h1>
    <p style="color:#64748b;font-size:13px;">${new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</p>
  </div>
  <p style="font-size:15px;line-height:1.7;color:#cbd5e1;text-align:center;margin-bottom:20px;">${message}</p>
  <div style="background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.2);border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
    <p style="color:#94a3b8;font-size:13px;font-style:italic;margin:0;">"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."</p>
    <p style="color:#a78bfa;font-size:11px;margin:8px 0 0;">— Philippians 4:6</p>
  </div>
  <div style="text-align:center;">
    <a href="${Deno.env.get('APP_URL') || '#'}/prayer-journal" style="display:inline-block;padding:12px 32px;background:rgba(167,139,250,0.15);border:1px solid rgba(167,139,250,0.35);border-radius:10px;color:#a78bfa;text-decoration:none;font-size:14px;">Open Prayer Journal →</a>
  </div>
</body>
</html>`,
    });

    return Response.json({ sent: true, days_since_last: daysSince });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});