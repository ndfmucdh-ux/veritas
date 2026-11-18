import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { ensureTodayVerse } from '../../shared/votd.ts';

// Returns today's verse for the app. Creates it (never repeating a recent one) if the morning job has not yet.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const dailyVerse = await ensureTodayVerse(base44);
    return Response.json({ dailyVerse });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}