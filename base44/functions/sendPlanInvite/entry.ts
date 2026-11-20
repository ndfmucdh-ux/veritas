import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { renderEmail, sendBrandedEmail, appLink, heroFor, firstNameOf } from '../../shared/emailBrand.ts';

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

    const inviter = firstNameOf(user.display_name || user.full_name, 'A friend');
    // Plain text only: renderEmail escapes every value, so names and notes can never inject markup.
    const ok = await sendBrandedEmail(base44, {
      to: email,
      subject: `${inviter.replace(/[\r\n]/g, ' ')} invited you to "${planTitle.replace(/[\r\n]/g, ' ')}"`,
      html: renderEmail({
        chip: '📖 READING PLAN INVITATION', hero: heroFor('hope'),
        title: `${inviter} invited you to read together`,
        quote: note || undefined, paragraphs: [`"${planTitle}"`],
        cta: { label: 'Open Veritas', url: appLink('/plans') },
        footerTag: 'Reading Plans',
      }),
      category: 'transactional',
    });
    if (!ok) return Response.json({ sent: false, error: 'That address could not receive the invitation.' }, { status: 422 });
    return Response.json({ sent: true });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}