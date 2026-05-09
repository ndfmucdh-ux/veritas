import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { book, chapter, translation } = body;

    if (!book || !chapter) return Response.json({ error: 'Missing book/chapter' }, { status: 400 });

    // Record audio progress
    const existing = await base44.entities.BibleAudioProgress.filter({ book, chapter, translation: translation || 'KJV' });
    if (existing?.[0]) {
      await base44.entities.BibleAudioProgress.update(existing[0].id, { completed: true });
    } else {
      await base44.entities.BibleAudioProgress.create({
        book, chapter, translation: translation || 'KJV',
        completed: true, timestamp_seconds: 0
      });
    }

    // Calculate audio streak
    const allAudio = await base44.entities.BibleAudioProgress.filter({ completed: true });
    
    // Get unique dates of completion
    const completedDates = new Set(
      (allAudio || []).map(a => a.updated_date?.slice(0, 10) || a.created_date?.slice(0, 10)).filter(Boolean)
    );

    // Calculate consecutive days
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (completedDates.has(key)) streak++;
      else if (i > 0) break;
    }

    // Bonus XP for streaks
    let bonusXP = 10; // base for completing audio
    let bonusMessage = null;

    if (streak >= 7) { bonusXP = 50; bonusMessage = "🔥 7-day audio streak! +50 XP bonus!"; }
    else if (streak >= 3) { bonusXP = 25; bonusMessage = "⚡ 3-day audio streak! +25 XP bonus!"; }
    else if (streak >= 2) { bonusXP = 15; bonusMessage = "✨ 2-day streak! Keep it up! +15 XP!"; }

    await base44.functions.invoke('updateXP', { action: 'AUDIO_COMPLETE', xp_amount: bonusXP });

    return Response.json({ 
      success: true, 
      streak_days: streak, 
      xp_awarded: bonusXP,
      bonus_message: bonusMessage 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});