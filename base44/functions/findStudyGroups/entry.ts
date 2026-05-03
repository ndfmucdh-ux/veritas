import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { category = "study_group", limit = 10 } = await req.json();

    const groups = await base44.asServiceRole.entities.CommunityGroup.filter({
      category,
      verified: true
    }, '-updated_date', limit);

    const enriched = groups.map(g => ({
      ...g,
      members_label: `${g.member_count} ${g.member_count === 1 ? 'member' : 'members'}`
    }));

    return Response.json({ groups: enriched, total: groups.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});