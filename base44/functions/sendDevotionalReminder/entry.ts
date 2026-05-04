import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if user has made any reading progress today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const progress = await base44.entities.ReadingProgress.filter({
      plan_id: { $exists: true },
    });

    const todayProgress = (progress || []).filter(p => {
      const d = new Date(p.created_date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (todayProgress.length > 0) {
      return Response.json({ skipped: true, reason: 'User already made progress today' });
    }

    // Find the most recent plan progress to recommend a plan
    const lastPlan = (progress || []).sort((a, b) =>
      new Date(b.created_date) - new Date(a.created_date)
    )[0];

    const planName = lastPlan?.plan_id || 'your reading plan';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: '📖 Continue Your Devotional Plan — Day Isn\'t Over Yet!',
      body: `
<!DOCTYPE html>
<html>
<body style="background:#0a0f1e;font-family:Georgia,serif;color:#e2e8f0;max-width:500px;margin:0 auto;padding:32px;">
  <div style="text-align:center;margin-bottom:28px;">
    <p style="font-size:56px;margin:0;">📖</p>
    <h1 style="color:#fbbf24;font-size:20px;margin:8px 0 4px;">Continue Your Journey</h1>
    <p style="color:#64748b;font-size:13px;">You haven't read today yet</p>
  </div>
  <p style="font-size:15px;line-height:1.7;color:#cbd5e1;text-align:center;margin-bottom:20px;">
    Don't let the day pass without spending time in the Word. Your plan <strong style="color:#fbbf24;">"${planName}"</strong> is waiting for you.
  </p>
  <div style="background:rgba(251,191,36,0.05);border:1px solid rgba(251,191,36,0.2);border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
    <p style="color:#94a3b8;font-size:13px;font-style:italic;margin:0;">"Your word is a lamp for my feet, a light on my path."</p>
    <p style="color:#fbbf24;font-size:11px;margin:8px 0 0;">— Psalm 119:105</p>
  </div>
  <div style="text-align:center;">
    <a href="${Deno.env.get('APP_URL') || '#'}/plans" style="display:inline-block;padding:12px 32px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.35);border-radius:10px;color:#fbbf24;text-decoration:none;font-size:14px;">Continue Reading →</a>
  </div>
  <p style="text-align:center;color:#334155;font-size:11px;margin-top:24px;">You're receiving this because you set a 7pm devotional reminder in your preferences.</p>
</body>
</html>`,
    });

    return Response.json({ sent: true, plan: planName });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});