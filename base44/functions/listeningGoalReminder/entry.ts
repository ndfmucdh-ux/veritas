import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayStr = todayStart.toISOString().slice(0, 10);

    // Get all audio completions today
    const allAudio = await base44.asServiceRole.entities.BibleAudioProgress.list('-updated_date', 2000);
    
    const userTodayCount = {};
    for (const a of allAudio) {
      const date = (a.updated_date || a.created_date)?.slice(0, 10);
      if (date !== todayStr) continue;
      const email = a.created_by;
      if (!email) continue;
      if (!userTodayCount[email]) userTodayCount[email] = 0;
      if (a.completed) userTodayCount[email]++;
    }

    // Get all users with preferences for their daily goal
    const allPrefs = await base44.asServiceRole.entities.UserPreferences.list('-updated_date', 500);
    
    let sent = 0;
    for (const pref of allPrefs) {
      const email = pref.created_by;
      if (!email) continue;
      
      const dailyGoal = pref.daily_audio_goal || 1;
      const todayCount = userTodayCount[email] || 0;
      
      if (todayCount < dailyGoal) {
        const remaining = dailyGoal - todayCount;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: "🎧 Don't forget your daily listening goal!",
          body: `<div style="font-family: Georgia, serif; max-width: 600px; margin: auto; background: #0a0f1e; color: #e8e8e8; padding: 32px; border-radius: 16px;">
            <h2 style="color: #00f5ff;">Your Daily Audio Goal Awaits</h2>
            <p style="color: rgba(255,255,255,0.75); line-height: 1.7;">Beloved, you still have <strong style="color: #fbbf24;">${remaining} chapter${remaining !== 1 ? 's' : ''}</strong> to go to reach your daily listening goal of <strong>${dailyGoal}</strong>.</p>
            <p style="color: rgba(255,255,255,0.5); font-style: italic;">"Faith comes from hearing, and hearing through the word of Christ." — Romans 10:17</p>
            <a href="https://app.veritas.com/read" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #00f5ff; color: #0a0f1e; border-radius: 8px; text-decoration: none; font-weight: bold;">Start Listening →</a>
          </div>`
        });
        sent++;
      }
    }

    return Response.json({ success: true, reminders_sent: sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});