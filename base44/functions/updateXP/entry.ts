import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const LEVEL_THRESHOLDS = [
  { name: "Seeker", minXP: 0 },
  { name: "Disciple", minXP: 500 },
  { name: "Scholar", minXP: 2000 },
  { name: "Elder", minXP: 5000 },
];

function getLevelForXP(xp) {
  let level = LEVEL_THRESHOLDS[0];
  for (const l of LEVEL_THRESHOLDS) {
    if (xp >= l.minXP) level = l;
  }
  return level.name;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action } = await req.json();

    // Never trust client-provided XP. Award only fixed server-side values.
    const XP_BY_ACTION = {
      READ_CHAPTER: 10,
      ADD_HIGHLIGHT: 5,
      ADD_BOOKMARK: 5,
      ADD_NOTE: 15,
      COMPLETE_PLAN_DAY: 25,
      AUDIO_STREAK: 10,
    };
    const xp_amount = XP_BY_ACTION[action] || 0;
    if (xp_amount <= 0) {
      return Response.json({ error: 'Invalid XP action' }, { status: 400 });
    }

    // Get or create XP record for user
    const existing = await base44.entities.UserXP.filter({ created_by: user.email });
    let xpRecord = existing && existing.length > 0 ? existing[0] : null;

    if (!xpRecord) {
      xpRecord = await base44.entities.UserXP.create({
        total_xp: 0, level: "Seeker", streak_days: 0,
        longest_streak: 0, chapters_read: 0, verses_highlighted: 0,
        notes_written: 0, badges: []
      });
    }

    const newXP = (xpRecord.total_xp || 0) + (xp_amount || 10);
    const newLevel = getLevelForXP(newXP);

    // Update specific counters
    const updates = { total_xp: newXP, level: newLevel };
    if (action === 'READ_CHAPTER') updates.chapters_read = (xpRecord.chapters_read || 0) + 1;
    if (action === 'ADD_HIGHLIGHT') updates.verses_highlighted = (xpRecord.verses_highlighted || 0) + 1;
    if (action === 'ADD_NOTE') updates.notes_written = (xpRecord.notes_written || 0) + 1;

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastRead = xpRecord.last_read_date;
    if (lastRead !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (lastRead === yesterdayStr) {
        updates.streak_days = (xpRecord.streak_days || 0) + 1;
      } else {
        updates.streak_days = 1;
      }
      updates.last_read_date = today;
      updates.longest_streak = Math.max(xpRecord.longest_streak || 0, updates.streak_days);
    }

    await base44.entities.UserXP.update(xpRecord.id, updates);

    // Fire streak milestone email for 7 and 30-day streaks
    const newStreak = updates.streak_days || xpRecord.streak_days || 0;
    const STREAK_MILESTONES = [7, 14, 21, 30, 60, 100, 365];
    if (STREAK_MILESTONES.includes(newStreak) && updates.streak_days) {
      // Call sendMilestoneEmail as service role — fire and forget
      base44.asServiceRole.functions.invoke('sendMilestoneEmail', {
        streakDays: newStreak,
        preview: false,
        // Service role has no user context — pass the recipient explicitly so
        // the milestone email actually reaches this user.
        recipientEmail: user.email,
        recipientName: user.full_name,
        chaptersRead: updates.chapters_read ?? xpRecord.chapters_read ?? 0,
      }).catch(() => {});
    }

    return Response.json({ 
      success: true, 
      new_xp: newXP, 
      new_level: newLevel,
      level_up: newLevel !== xpRecord.level,
      streak: newStreak,
      milestone_triggered: STREAK_MILESTONES.includes(updates.streak_days || 0),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});