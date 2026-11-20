import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Entities that hold a person's own records (matched by the creator's email).
const OWN_RECORDS = [
  'UserPreferences', 'PrayerWallPost', 'PlanProgressComment', 'CustomPlan', 'ReadingSession',
  'UserVerseInteraction', 'VeritasAIConversation', 'UserNote', 'PrayerJournal', 'ReadingProgress',
  'UserHighlight', 'UserXP', 'AudioPlaylist', 'Bookmark', 'Flashcard', 'PlanInvite',
  'VerseAudioReflection', 'VerseCollection', 'UserAchievement', 'PrayerReminder', 'VerseFolder',
  'StudyNote', 'WidgetData', 'VerseImage', 'FamilyModeSettings', 'BibleAudioProgress',
  'DevotionalPlan', 'GroupMember', 'Friendship', 'VerseEmailLog', 'GroupInvite', 'GroupPost',
];

// Lets a signed-in person permanently close their own account: deletes their records,
// emails a confirmation, then removes the account. Admins must be demoted first.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role === 'admin') return Response.json({ error: 'Admin accounts cannot be closed here' }, { status: 403 });

    const email = user.email;
    const db = base44.asServiceRole.entities;
    for (const name of OWN_RECORDS) {
      await db[name]?.deleteMany({ created_by: email }).catch(() => null);
    }
    await db.ReminderLog?.deleteMany({ user_email: email }).catch(() => null);

    // Confirmation goes out before the account disappears (transactional: always delivered).
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      from_name: 'Veritas',
      template_name: 'AccountClosed',
      variables: { first_name: String(user.full_name || '').trim().split(/\s+/)[0] || 'friend' },
      category: 'transactional',
    }).catch(() => null);

    await db.User.delete(user.id);
    return Response.json({ closed: true });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}