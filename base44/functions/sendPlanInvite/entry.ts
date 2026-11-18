import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { escapeHtml } from '../../shared/guard.ts';

const APP_URL = 'https://veritas-hub.base44.app';
const MAX_PER_DAY = 20;

// Sends a fixed-template reading-plan invitation. Callers can only supply the
// recipient, the plan name and a short personal note (plain text, links removed).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const planTitle = String(body.planTitle || '').trim().slice(0, 120);
    const note = String(body.message || '').replace(/https?:\/\/\S+|www\.\S+/gi, '').trim().slice(0, 300);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !planTitle) {
      return Response.json({ error: 'A valid email and plan title are required' }, { status: 400 });
    }

    // Simple per-user daily limit, counted from the invites this user has already sent.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recent = await base44.asServiceRole.entities.PlanInvite.filter(
      { created_by_id: user.id, created_date: { $gte: since } }, '-created_date', MAX_PER_DAY + 1,
    );
    if ((recent?.items || recent || []).length > MAX_PER_DAY) {
      return Response.json({ error: 'Daily invite limit reached' }, { status: 429 });
    }

    const inviter = escapeHtml(user.full_name || 'A friend');
    const html = `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:24px;">
<h2 style="margin:0 0 12px;">You've been invited to a reading plan</h2>
<p>${inviter} invited you to join the "${escapeHtml(planTitle)}" reading plan on Veritas.</p>
${note ? `<p style="font-style:italic;">"${escapeHtml(note)}"</p>` : ''}
<p><a href="${APP_URL}">Open Veritas</a> to get started.</p>
</div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'Veritas · The Word',
      to: email,
      subject: `You've been invited to join "${planTitle.replace(/[\r\n]/g, ' ')}"`,
      body: html,
    });
    return Response.json({ sent: true });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}