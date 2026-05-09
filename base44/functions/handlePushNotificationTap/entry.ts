import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Handles push notification tap - redirects user to prayer journal or reading plan
 * Called when user taps a VOTD, prayer reminder, or plan reminder notification
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationType, targetId, verseRef, book, chapter } = await req.json();

    // notificationType: "prayer_reminder" | "votd" | "reading_plan"
    // targetId: prayer journal ID or reading plan ID
    // verseRef / book / chapter: for navigation

    let redirectUrl = "/";

    switch (notificationType) {
      case "prayer_reminder":
        // Redirect to prayer journal with specific prayer deep-linked
        redirectUrl = targetId ? `/prayer-journal?id=${targetId}` : "/prayer-journal";
        break;

      case "votd":
      case "devotional":
        // Redirect to reading plan, jump to verse
        if (book && chapter) {
          redirectUrl = `/read?book=${encodeURIComponent(book)}&chapter=${chapter}&verse=1`;
        }
        break;

      case "reading_plan":
        // Redirect to active reading plan exactly where user left off
        if (targetId) {
          const plan = await base44.entities.CustomPlan.filter({ id: targetId }).then(p => p?.[0] || null).catch(() => null);
          if (plan) {
            const lastCompleted = plan.completed_chapters?.[plan.completed_chapters.length - 1];
            if (lastCompleted) {
              const [b, ch] = lastCompleted.split(":");
              redirectUrl = `/plans?planId=${targetId}&continueFrom=${b}:${ch}`;
            } else {
              redirectUrl = `/plans?planId=${targetId}`;
            }
          }
        }
        break;
    }

    // Log the deep link for analytics
    await base44.analytics.track({
      eventName: "push_notification_tapped",
      properties: {
        notification_type: notificationType,
        target_id: targetId,
        redirect_url: redirectUrl
      }
    }).catch(() => {});

    return Response.json({
      success: true,
      redirectUrl,
      message: `Opening ${notificationType}...`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});