import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { sendBrandedEmail } from '../../shared/emailBrand.ts';
import { buildReminderEmail, reminderContext } from '../../shared/reminderEmail.ts';

// "Send me a prayer reminder now": emails the signed-in user their own reminder (the daily ones are sent by the reminder dispatcher).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const pref = (await base44.asServiceRole.entities.UserPreferences.filter({ created_by: user.email }, '-updated_date', 1))?.[0];
    const ctx = await reminderContext(base44, 'prayer', user.email, pref?.timezone || 'America/New_York');
    if (ctx.skip) return Response.json({ message: 'You already prayed today', skipped: true });

    const mail = await buildReminderEmail(base44, 'prayer', user, pref, ctx, new Map());
    const ok = await sendBrandedEmail(base44, { to: user.email, subject: mail.subject, html: mail.html, category: 'transactional' });
    return Response.json({ success: ok, reminded: user.email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}