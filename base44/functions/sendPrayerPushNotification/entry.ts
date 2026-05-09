import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's prayer reminder time from UserPreferences or default
    const prefs = await base44.entities.UserPreferences.list().catch(() => []);
    const userPref = prefs?.find(p => p.created_by === user.email);
    const reminderTime = userPref?.prayer_reminder_time || "20:00";

    // Get today's prayer journal entries
    const today = new Date().toISOString().split('T')[0];
    const prayers = await base44.entities.PrayerJournal.filter({ created_date: { $gte: today } }).catch(() => []);

    if (prayers.length === 0) {
      return Response.json({ message: "No prayers to remind about" });
    }

    // Build deep link to prayer journal with today's entries
    const deepLink = `${Deno.env.get("APP_URL") || "https://veritas.app"}/prayer-journal?date=${today}`;

    // Send push notification via your push service
    const title = "🙏 Prayer Time Reminder";
    const body = `You have ${prayers.length} prayer${prayers.length > 1 ? "s" : ""} to follow up on today. Tap to continue.`;

    // Example: Send via your backend service or platform
    console.log("Push notification:", { title, body, deepLink, reminderTime });

    return Response.json({
      success: true,
      notificationSent: {
        title,
        body,
        deepLink,
        prayerCount: prayers.length,
        reminderTime
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});