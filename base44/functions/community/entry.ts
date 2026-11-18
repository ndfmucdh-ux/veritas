import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// One entry point for friends and groups. Every record is read and written here with the
// server role, so people never see each other's emails and can only touch what they belong to.
const bad = (error: string, status = 400) => Response.json({ error }, { status });
const clean = (s: unknown, max: number) => String(s || '').trim().slice(0, max);
const CATEGORIES = ['study_group', 'prayer_circle', 'accountability', 'mens_group', 'womens_group'];

const otherSide = (f: any, id: string) =>
  f.requester_id === id ? { userId: f.addressee_id, name: f.addressee_name } : { userId: f.requester_id, name: f.requester_name };

const friendships = (E: any, id: string) =>
  E.Friendship.filter({ $or: [{ requester_id: id }, { addressee_id: id }] }, '-created_date', 500);

const membership = async (E: any, groupId: string, userId: string) =>
  (await E.GroupMember.filter({ group_id: groupId, user_id: userId }))[0] || null;

const planKeys = (group: any) =>
  new Set<string>((group.plan_selections || []).flatMap((s: any) => (s.chapters || []).map((c: number) => `${s.book}:${c}`)));

const progressOf = (group: any, member: any) => {
  const keys = planKeys(group);
  return { done: (member.completed_chapters || []).filter((k: string) => keys.has(k)).length, total: keys.size };
};

const recount = async (E: any, groupId: string) => {
  const members = await E.GroupMember.filter({ group_id: groupId }, 'created_date', 500);
  await E.StudyGroup.update(groupId, { member_count: members.length });
  return members;
};

const ACTIONS: Record<string, (c: any) => Promise<any>> = {
  // ---------- friends ----------
  'friends.list': async ({ E, me }) => {
    const list = await friendships(E, me.id);
    return {
      friends: list.filter((f: any) => f.status === 'accepted').map((f: any) => ({ id: f.id, ...otherSide(f, me.id) })),
      incoming: list.filter((f: any) => f.status === 'pending' && f.addressee_id === me.id).map((f: any) => ({ id: f.id, ...otherSide(f, me.id) })),
      outgoing: list.filter((f: any) => f.status === 'pending' && f.requester_id === me.id).map((f: any) => ({ id: f.id, ...otherSide(f, me.id) })),
    };
  },

  'friends.search': async ({ E, me, body }) => {
    const q = clean(body.q, 60).toLowerCase();
    if (q.length < 2) return { results: [] };
    const [users, list] = await Promise.all([E.User.list('-created_date', 1000), friendships(E, me.id)]);
    const rel = new Map<string, any>(list.map((f: any) => [otherSide(f, me.id).userId, f]));
    const results = users
      .filter((u: any) => u.id !== me.id && (String(u.full_name || '').toLowerCase().includes(q) || String(u.email || '').toLowerCase() === q))
      .slice(0, 12)
      .map((u: any) => {
        const f = rel.get(u.id);
        const status = !f ? 'none' : f.status === 'accepted' ? 'friends' : f.requester_id === me.id ? 'outgoing' : 'incoming';
        return { userId: u.id, name: u.full_name || String(u.email).split('@')[0], status, friendshipId: f?.id || null };
      });
    return { results };
  },

  'friends.request': async ({ E, me, body }) => {
    if (!body.userId || body.userId === me.id) return bad('Invalid user');
    const target = (await E.User.filter({ id: body.userId }))[0];
    if (!target) return bad('User not found', 404);
    const existing = (await friendships(E, me.id)).find((f: any) => otherSide(f, me.id).userId === target.id);
    if (existing) {
      // They already asked you: asking back simply accepts.
      if (existing.status === 'pending' && existing.addressee_id === me.id) {
        await E.Friendship.update(existing.id, { status: 'accepted' });
        return { status: 'friends' };
      }
      return { status: existing.status === 'accepted' ? 'friends' : 'outgoing' };
    }
    await E.Friendship.create({
      requester_id: me.id, requester_name: me.name,
      addressee_id: target.id, addressee_name: target.full_name || String(target.email).split('@')[0], status: 'pending',
    });
    return { status: 'outgoing' };
  },

  'friends.respond': async ({ E, me, body }) => {
    const f = (await E.Friendship.filter({ id: body.friendshipId }))[0];
    if (!f || f.addressee_id !== me.id || f.status !== 'pending') return bad('Request not found', 404);
    if (body.accept) await E.Friendship.update(f.id, { status: 'accepted' });
    else await E.Friendship.delete(f.id);
    return { ok: true };
  },

  'friends.remove': async ({ E, me, body }) => {
    const f = (await E.Friendship.filter({ id: body.friendshipId }))[0];
    if (!f || (f.requester_id !== me.id && f.addressee_id !== me.id)) return bad('Not found', 404);
    await E.Friendship.delete(f.id);
    return { ok: true };
  },

  // ---------- groups ----------
  'groups.mine': async ({ E, me }) => {
    const mine = await E.GroupMember.filter({ user_id: me.id }, '-created_date', 200);
    const ids = mine.map((m: any) => m.group_id);
    const [groups, invites] = await Promise.all([
      ids.length ? E.StudyGroup.filter({ id: { $in: ids } }) : [],
      E.GroupInvite.filter({ to_id: me.id, status: 'pending' }, '-created_date', 50),
    ]);
    const byId = new Map<string, any>(groups.map((g: any) => [g.id, g]));
    return {
      groups: mine.filter((m: any) => byId.has(m.group_id)).map((m: any) => {
        const g = byId.get(m.group_id);
        return { id: g.id, name: g.name, description: g.description, category: g.category, privacy: g.privacy, member_count: g.member_count, role: m.role, plan_title: g.plan_title || '', progress: progressOf(g, m) };
      }),
      invites: invites.map((i: any) => ({ id: i.id, groupId: i.group_id, groupName: i.group_name, fromName: i.from_name })),
    };
  },

  'groups.discover': async ({ E, me, body }) => {
    const q = clean(body.q, 60).toLowerCase();
    const query: any = { privacy: 'public' };
    if (CATEGORIES.includes(body.category)) query.category = body.category;
    const [groups, mine] = await Promise.all([E.StudyGroup.filter(query, '-updated_date', 200), E.GroupMember.filter({ user_id: me.id }, '-created_date', 500)]);
    const joined = new Set(mine.map((m: any) => m.group_id));
    return {
      groups: groups
        .filter((g: any) => !joined.has(g.id) && (!q || `${g.name} ${g.description || ''}`.toLowerCase().includes(q)))
        .slice(0, 30)
        .map((g: any) => ({ id: g.id, name: g.name, description: g.description, category: g.category, member_count: g.member_count, owner_name: g.owner_name, plan_title: g.plan_title || '' })),
    };
  },

  'groups.create': async ({ E, me, body }) => {
    const name = clean(body.name, 60);
    if (name.length < 3) return bad('Name is too short');
    const group = await E.StudyGroup.create({
      name, description: clean(body.description, 300),
      category: CATEGORIES.includes(body.category) ? body.category : 'study_group',
      privacy: body.privacy === 'private' ? 'private' : 'public',
      owner_id: me.id, owner_name: me.name, member_count: 1,
    });
    await E.GroupMember.create({ group_id: group.id, user_id: me.id, user_name: me.name, role: 'owner', completed_chapters: [] });
    return { id: group.id };
  },

  'groups.join': async ({ E, me, body }) => {
    const group = (await E.StudyGroup.filter({ id: body.groupId }))[0];
    if (!group) return bad('Group not found', 404);
    if (await membership(E, group.id, me.id)) return { ok: true };
    const invite = (await E.GroupInvite.filter({ group_id: group.id, to_id: me.id, status: 'pending' }))[0];
    if (group.privacy !== 'public' && !invite) return bad('This group is private', 403);
    await E.GroupMember.create({ group_id: group.id, user_id: me.id, user_name: me.name, role: 'member', completed_chapters: [] });
    if (invite) await E.GroupInvite.update(invite.id, { status: 'accepted' });
    await recount(E, group.id);
    return { ok: true };
  },

  'groups.leave': async ({ E, me, body }) => {
    const m = await membership(E, body.groupId, me.id);
    if (!m) return bad('Not a member', 404);
    await E.GroupMember.delete(m.id);
    const rest = await recount(E, body.groupId);
    if (rest.length === 0) {
      await Promise.all([E.GroupPost.deleteMany({ group_id: body.groupId }), E.GroupInvite.deleteMany({ group_id: body.groupId }), E.StudyGroup.delete(body.groupId)]);
    } else if (m.role === 'owner') {
      await E.GroupMember.update(rest[0].id, { role: 'owner' });
      await E.StudyGroup.update(body.groupId, { owner_id: rest[0].user_id, owner_name: rest[0].user_name });
    }
    return { ok: true };
  },

  'groups.delete': async ({ E, me, body }) => {
    const m = await membership(E, body.groupId, me.id);
    if (!m || m.role !== 'owner') return bad('Only the owner can delete a group', 403);
    await Promise.all([E.GroupMember.deleteMany({ group_id: body.groupId }), E.GroupPost.deleteMany({ group_id: body.groupId }), E.GroupInvite.deleteMany({ group_id: body.groupId })]);
    await E.StudyGroup.delete(body.groupId);
    return { ok: true };
  },

  'groups.get': async ({ E, me, body }) => {
    const group = (await E.StudyGroup.filter({ id: body.groupId }))[0];
    if (!group) return bad('Group not found', 404);
    const mine = await membership(E, group.id, me.id);
    if (!mine) return bad('Join this group to open it', 403);
    const [members, posts, list, pending] = await Promise.all([
      E.GroupMember.filter({ group_id: group.id }, 'created_date', 500),
      E.GroupPost.filter({ group_id: group.id }, '-created_date', 60),
      friendships(E, me.id),
      E.GroupInvite.filter({ group_id: group.id, status: 'pending' }, '-created_date', 200),
    ]);
    const memberIds = new Set(members.map((m: any) => m.user_id));
    const invited = new Set(pending.map((i: any) => i.to_id));
    return {
      group: { id: group.id, name: group.name, description: group.description, category: group.category, privacy: group.privacy, member_count: members.length, plan_title: group.plan_title || '', plan_selections: group.plan_selections || [] },
      role: mine.role,
      myChapters: mine.completed_chapters || [],
      members: members.map((m: any) => ({ userId: m.user_id, name: m.user_name, role: m.role, progress: progressOf(group, m) })),
      posts: posts.map((p: any) => ({
        id: p.id, authorId: p.author_id, authorName: p.author_name, kind: p.kind, text: p.text, answered: !!p.answered,
        amenCount: (p.amen_ids || []).length, amened: (p.amen_ids || []).includes(me.id), created_date: p.created_date,
      })),
      invitable: list.filter((f: any) => f.status === 'accepted').map((f: any) => otherSide(f, me.id))
        .filter((u: any) => !memberIds.has(u.userId) && !invited.has(u.userId)),
    };
  },

  'groups.invite': async ({ E, me, body }) => {
    const group = (await E.StudyGroup.filter({ id: body.groupId }))[0];
    if (!group || !(await membership(E, group.id, me.id))) return bad('Not a member', 403);
    const ids: string[] = Array.isArray(body.userIds) ? body.userIds.slice(0, 20) : [];
    const [list, members, pending] = await Promise.all([
      friendships(E, me.id), E.GroupMember.filter({ group_id: group.id }, 'created_date', 500), E.GroupInvite.filter({ group_id: group.id, status: 'pending' }),
    ]);
    const friendIds = new Set(list.filter((f: any) => f.status === 'accepted').map((f: any) => otherSide(f, me.id).userId));
    const skip = new Set([...members.map((m: any) => m.user_id), ...pending.map((i: any) => i.to_id)]);
    const toInvite = ids.filter((id) => friendIds.has(id) && !skip.has(id));
    await Promise.all(toInvite.map((id) => E.GroupInvite.create({ group_id: group.id, group_name: group.name, from_id: me.id, from_name: me.name, to_id: id, status: 'pending' })));
    return { invited: toInvite.length };
  },

  'groups.respondInvite': async ({ E, me, body }) => {
    const invite = (await E.GroupInvite.filter({ id: body.inviteId }))[0];
    if (!invite || invite.to_id !== me.id || invite.status !== 'pending') return bad('Invite not found', 404);
    if (!body.accept) { await E.GroupInvite.update(invite.id, { status: 'declined' }); return { ok: true }; }
    if (!(await membership(E, invite.group_id, me.id))) {
      await E.GroupMember.create({ group_id: invite.group_id, user_id: me.id, user_name: me.name, role: 'member', completed_chapters: [] });
      await recount(E, invite.group_id);
    }
    await E.GroupInvite.update(invite.id, { status: 'accepted' });
    return { groupId: invite.group_id };
  },

  'groups.post': async ({ E, me, body }) => {
    const text = clean(body.text, 1000);
    if (!text) return bad('Write something first');
    if (!(await membership(E, body.groupId, me.id))) return bad('Not a member', 403);
    await E.GroupPost.create({ group_id: body.groupId, author_id: me.id, author_name: me.name, kind: body.kind === 'prayer' ? 'prayer' : 'message', text, amen_ids: [], answered: false });
    return { ok: true };
  },

  'groups.amen': async ({ E, me, body }) => {
    const post = (await E.GroupPost.filter({ id: body.postId }))[0];
    if (!post || !(await membership(E, post.group_id, me.id))) return bad('Not found', 404);
    const ids: string[] = post.amen_ids || [];
    const next = ids.includes(me.id) ? ids.filter((x) => x !== me.id) : [...ids, me.id];
    await E.GroupPost.update(post.id, { amen_ids: next });
    return { amenCount: next.length, amened: next.includes(me.id) };
  },

  'groups.answered': async ({ E, me, body }) => {
    const post = (await E.GroupPost.filter({ id: body.postId }))[0];
    if (!post || post.author_id !== me.id) return bad('Not found', 404);
    await E.GroupPost.update(post.id, { answered: !post.answered });
    return { answered: !post.answered };
  },

  'groups.deletePost': async ({ E, me, body }) => {
    const post = (await E.GroupPost.filter({ id: body.postId }))[0];
    if (!post) return bad('Not found', 404);
    const m = await membership(E, post.group_id, me.id);
    if (!m || (post.author_id !== me.id && m.role !== 'owner')) return bad('Not allowed', 403);
    await E.GroupPost.delete(post.id);
    return { ok: true };
  },

  'groups.setPlan': async ({ E, me, body }) => {
    const m = await membership(E, body.groupId, me.id);
    if (!m || m.role !== 'owner') return bad('Only the owner can set the plan', 403);
    const selections = (Array.isArray(body.selections) ? body.selections : []).slice(0, 66).map((s: any) => ({
      book: clean(s.book, 40), chapters: (Array.isArray(s.chapters) ? s.chapters : []).map(Number).filter((n: number) => n > 0 && n < 200).slice(0, 200),
    })).filter((s: any) => s.book && s.chapters.length);
    await E.StudyGroup.update(body.groupId, { plan_title: clean(body.title, 60), plan_selections: selections });
    return { ok: true };
  },

  'groups.toggleChapter': async ({ E, me, body }) => {
    const m = await membership(E, body.groupId, me.id);
    if (!m) return bad('Not a member', 403);
    const key = `${clean(body.book, 40)}:${Number(body.chapter)}`;
    const done: string[] = m.completed_chapters || [];
    const next = done.includes(key) ? done.filter((k) => k !== key) : [...done, key];
    await E.GroupMember.update(m.id, { completed_chapters: next });
    return { completed: next };
  },
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return bad('Unauthorized', 401);
    const body = await req.json().catch(() => ({}));
    const handler = ACTIONS[body.action];
    if (!handler) return bad('Unknown action');
    const me = { id: user.id, name: user.full_name || String(user.email).split('@')[0] };
    const out = await handler({ E: base44.asServiceRole.entities, me, body });
    return out instanceof Response ? out : Response.json(out);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}