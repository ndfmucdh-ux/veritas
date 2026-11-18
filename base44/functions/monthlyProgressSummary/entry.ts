import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { denyUnlessAdmin } from '../../shared/guard.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const denied = await denyUnlessAdmin(base44);
    if (denied) return denied;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
    const monthName = new Date(now.getFullYear(), now.getMonth() - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Get all reading progress for last month
    const allProgress = await base44.asServiceRole.entities.ReadingProgress.list('-completed_at', 2000);
    const allXP = await base44.asServiceRole.entities.UserXP.list('-updated_date', 500);

    // Group by user
    const byUser = {};
    for (const p of allProgress) {
      const email = p.created_by;
      if (!email) continue;
      const date = new Date(p.completed_at || p.created_date);
      if (date < new Date(monthStart) || date > new Date(monthEnd)) continue;
      if (!byUser[email]) byUser[email] = { progress: [], xp: null };
      byUser[email].progress.push(p);
    }

    for (const xpRec of allXP) {
      const email = xpRec.created_by;
      if (email && byUser[email]) byUser[email].xp = xpRec;
    }

    let sent = 0;
    for (const [email, data] of Object.entries(byUser)) {
      const { progress, xp } = data;
      if (progress.length === 0) continue;

      const booksRead = [...new Set(progress.map(p => p.book))];
      const chaptersRead = progress.length;
      const totalXP = xp?.total_xp || 0;
      const streak = xp?.streak_days || 0;
      const level = xp?.level || 'Seeker';

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `📊 Your Veritas Monthly Summary — ${monthName}`,
        body: `<div style="font-family: Georgia, serif; max-width: 600px; margin: auto; background: #0a0f1e; color: #e8e8e8; padding: 32px; border-radius: 16px;">
          <h2 style="color: #00f5ff; font-family: Georgia, serif;">Your ${monthName} Summary</h2>
          <p style="color: rgba(255,255,255,0.6); line-height: 1.7;">Here's a reflection on your spiritual journey last month:</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
            <div style="background: rgba(0,245,255,0.08); border: 1px solid rgba(0,245,255,0.2); border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #00f5ff;">${chaptersRead}</div>
              <div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px;">Chapters Read</div>
            </div>
            <div style="background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #fbbf24;">${totalXP}</div>
              <div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px;">Total XP Earned</div>
            </div>
            <div style="background: rgba(167,139,250,0.08); border: 1px solid rgba(167,139,250,0.2); border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #a78bfa;">${streak}🔥</div>
              <div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px;">Day Streak</div>
            </div>
            <div style="background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #34d399;">${level}</div>
              <div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px;">Current Level</div>
            </div>
          </div>

          <p style="color: rgba(255,255,255,0.6);">Books you explored: <strong style="color: #fbbf24;">${booksRead.join(', ') || 'None recorded'}</strong></p>
          <p style="color: rgba(255,255,255,0.5); font-style: italic; border-left: 3px solid #fbbf24; padding-left: 12px; margin: 20px 0;">"But grow in the grace and knowledge of our Lord and Savior Jesus Christ." — 2 Peter 3:18</p>
          <a href="https://app.veritas.com/profile" style="display: inline-block; margin-top: 8px; padding: 12px 24px; background: #00f5ff; color: #0a0f1e; border-radius: 8px; text-decoration: none; font-weight: bold;">View Full Profile →</a>
        </div>`
      });
      sent++;
    }

    return Response.json({ success: true, summaries_sent: sent, month: monthName });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});