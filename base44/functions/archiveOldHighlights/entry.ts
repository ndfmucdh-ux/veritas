import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get all user highlights older than 30 days that aren't already archived
    const highlights = await base44.entities.UserHighlight.filter({
      created_by: user.email,
    });

    const oldHighlights = (highlights || []).filter(h =>
      h.created_date && h.created_date < thirtyDaysAgo && !h.archived
    );

    let archived = 0;
    for (const h of oldHighlights) {
      await base44.entities.UserHighlight.update(h.id, { archived: true, archived_at: new Date().toISOString() });
      archived++;
    }

    return Response.json({ archived, total_checked: highlights.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});