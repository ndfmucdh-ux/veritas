import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled weekly: sends each user a digest of their PrayerJournal entries from the past 7 days.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users
    const users = await base44.asServiceRole.entities.User.list();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    let sent = 0;
    for (const user of users) {
      if (!user.email) continue;

      // Get this user's prayer journal entries from the past 7 days
      const entries = await base44.asServiceRole.entities.PrayerJournal.filter({
        created_by: user.email,
      });

      const weekEntries = entries.filter(e => e.created_date >= sevenDaysAgo);
      if (weekEntries.length === 0) continue;

      // Build HTML digest
      const moodEmojis = { grateful: "🙏", confessing: "💙", interceding: "✨", celebrating: "🎉" };

      const entriesHtml = weekEntries.map(entry => `
        <div style="margin-bottom: 24px; padding: 20px; background: rgba(255,255,255,0.03); border-left: 3px solid #a78bfa; border-radius: 8px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
            ${moodEmojis[entry.mood] || "🙏"} ${entry.mood || "prayer"} · ${new Date(entry.created_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
          ${entry.verse_ref ? `<div style="font-size: 13px; color: #fbbf24; margin-bottom: 8px;">📖 ${entry.verse_ref}</div>` : ''}
          <p style="font-size: 15px; color: #e2e8f0; line-height: 1.7; margin: 0;">${entry.prayer_text}</p>
          ${entry.answered ? `<div style="margin-top: 8px; font-size: 12px; color: #34d399;">✅ Prayer answered: ${entry.answered_note || ''}</div>` : ''}
        </div>
      `).join('');

      const subject = `📖 Your Weekly Prayer Digest — ${weekEntries.length} entry${weekEntries.length > 1 ? 'ies' : 'y'} this week`;
      const body = `
        <div style="font-family: Georgia, serif; background: #0a0f1e; color: #fff; padding: 40px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #a78bfa; font-size: 24px; margin-bottom: 4px;">Your Weekly Prayer Journal</h1>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 32px;">
            ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.8; margin-bottom: 24px;">
            Dear ${user.full_name || 'Beloved'},<br/>
            Here is a reflection of your prayer journey this week. ${weekEntries.length} conversation${weekEntries.length > 1 ? 's' : ''} with God — each one treasured.
          </p>
          ${entriesHtml}
          <blockquote style="border-left: 3px solid #fbbf24; padding-left: 16px; color: #a78bfa; font-style: italic; margin: 32px 0;">
            "The prayer of a righteous person is powerful and effective." — James 5:16
          </blockquote>
          <p style="color: #475569; font-size: 13px;">Keep praying. Keep seeking. He hears every word. 🙏</p>
        </div>
      `;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject,
        body,
        from_name: "Veritas · Prayer Journal",
      });
      sent++;
    }

    return Response.json({ success: true, digestsSent: sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});