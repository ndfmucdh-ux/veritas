import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { ensureTodayVerse, sendVerseEmails } from '../../shared/votd.ts';

// Called every morning by the "Daily Verse Generator" workflow:
// makes sure today's verse is new, then emails it to every user who has notifications on.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const verse = await ensureTodayVerse(base44);
    const emails = await sendVerseEmails(base44, verse);
    console.log(`Verse ${verse.verse_ref} for ${verse.date}`, emails);
    return Response.json({ success: true, dailyVerse: verse, emails });
  } catch (error) {
    console.error('Daily verse failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}