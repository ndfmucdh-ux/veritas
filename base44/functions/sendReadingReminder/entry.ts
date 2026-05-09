import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's reading progress for today
    const today = new Date().toISOString().split('T')[0];
    const todayProgress = await base44.entities.ReadingProgress.filter({
      created_by: user.email,
      completed_at: { $regex: `^${today}` }
    }).catch(() => []);

    // If user has already read today, skip reminder
    if (todayProgress && todayProgress.length > 0) {
      return Response.json({ message: 'User already read today', skipped: true });
    }

    // Get last reading session to provide context
    const lastSession = await base44.entities.ReadingProgress.list('-completed_at', 1)
      .catch(() => []);

    const lastBook = lastSession?.[0]?.book || 'John';
    const lastChapter = lastSession?.[0]?.chapter || 1;

    // Send reminder via LLM to generate personalized message
    const message = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a short, warm, encouraging push notification text (max 120 chars) reminding a Bible reader to open the Veritas app and continue reading ${lastBook} ${lastChapter}. Be personal and faith-focused. No emojis.`,
      model: 'gemini_3_flash'
    });

    // Send the reminder via email
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: '📖 Time to read your daily verse',
      body: `Hi ${user.full_name},\n\nYour daily reading is waiting. Continue where you left off in ${lastBook} ${lastChapter}.\n\n${message}\n\nOpen Veritas now: https://veritas.app/read?book=${encodeURIComponent(lastBook)}&chapter=${lastChapter}`
    });

    return Response.json({
      success: true,
      reminded: user.email,
      context: { lastBook, lastChapter },
      message: message
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});