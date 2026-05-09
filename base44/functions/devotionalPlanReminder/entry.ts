import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This runs as a scheduled job — use service role
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 3);

    // Get all reading progress records older than 3 days
    const allProgress = await base44.asServiceRole.entities.ReadingProgress.list('-completed_at', 500);
    
    // Group by user email (created_by)
    const userLastRead = {};
    for (const p of allProgress) {
      const email = p.created_by;
      if (!email) continue;
      const date = new Date(p.completed_at || p.created_date);
      if (!userLastRead[email] || date > userLastRead[email]) {
        userLastRead[email] = date;
      }
    }

    let remindersSent = 0;
    for (const [email, lastDate] of Object.entries(userLastRead)) {
      if (lastDate < thresholdDate) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: "Your Devotional Plan Needs You 📖",
          body: `<div style="font-family: Georgia, serif; max-width: 600px; margin: auto; background: #0a0f1e; color: #e8e8e8; padding: 32px; border-radius: 16px;">
            <h2 style="color: #fbbf24; font-family: 'Georgia', serif;">Come Back to the Word</h2>
            <p style="color: rgba(255,255,255,0.75); line-height: 1.7;">Beloved, it's been a few days since you last read in your devotional plan. Your reading journey awaits — even just one chapter today can reignite your momentum.</p>
            <p style="color: rgba(255,255,255,0.5); font-style: italic;">"Your word is a lamp to my feet and a light to my path." — Psalm 119:105</p>
            <a href="https://app.veritas.com/plans" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #fbbf24; color: #0a0f1e; border-radius: 8px; text-decoration: none; font-weight: bold;">Continue Reading →</a>
          </div>`
        });
        remindersSent++;
      }
    }

    return Response.json({ success: true, reminders_sent: remindersSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});