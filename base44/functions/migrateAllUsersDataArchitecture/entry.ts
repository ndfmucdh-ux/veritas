import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only, idempotent, ADDITIVE migration that backfills every user's legacy
// Bookmark / UserHighlight / UserNote / ReadingProgress rows into the
// consolidated UserVerseInteraction + ReadingSession entities.
// Legacy rows are NEVER deleted. Re-runs update keyed rows (no duplicates).

const BOOK_ORDER = {
  Genesis: 1, Exodus: 2, Leviticus: 3, Numbers: 4, Deuteronomy: 5, Joshua: 6, Judges: 7, Ruth: 8,
  '1 Samuel': 9, '2 Samuel': 10, '1 Kings': 11, '2 Kings': 12, '1 Chronicles': 13, '2 Chronicles': 14,
  Ezra: 15, Nehemiah: 16, Esther: 17, Job: 18, Psalms: 19, Proverbs: 20, Ecclesiastes: 21,
  'Song of Solomon': 22, Isaiah: 23, Jeremiah: 24, Lamentations: 25, Ezekiel: 26, Daniel: 27,
  Hosea: 28, Joel: 29, Amos: 30, Obadiah: 31, Jonah: 32, Micah: 33, Nahum: 34, Habakkuk: 35,
  Zephaniah: 36, Haggai: 37, Zechariah: 38, Malachi: 39, Matthew: 40, Mark: 41, Luke: 42,
  John: 43, Acts: 44, Romans: 45, '1 Corinthians': 46, '2 Corinthians': 47, Galatians: 48,
  Ephesians: 49, Philippians: 50, Colossians: 51, '1 Thessalonians': 52, '2 Thessalonians': 53,
  '1 Timothy': 54, '2 Timothy': 55, Titus: 56, Philemon: 57, Hebrews: 58, James: 59,
  '1 Peter': 60, '2 Peter': 61, '1 John': 62, '2 John': 63, '3 John': 64, Jude: 65, Revelation: 66,
};

const verseKey = (t, b, c, v) => `${t || 'KJV'}|${b}|${c}|${v}`;
const sessionKey = (email, t, b, c, completedAt) =>
  `${email}|${(completedAt ? String(completedAt) : new Date().toISOString()).slice(0, 10)}|${t || 'KJV'}|${b}|${c}`;

async function migrateOneUser(base44, email, startedAt) {
  const svc = base44.asServiceRole;
  const [highlights, bookmarks, notes, progress, interactions, sessions] = await Promise.all([
    svc.entities.UserHighlight.filter({ created_by: email }, '-updated_date', 2000).catch(() => []),
    svc.entities.Bookmark.filter({ created_by: email }, '-updated_date', 2000).catch(() => []),
    svc.entities.UserNote.filter({ created_by: email }, '-updated_date', 2000).catch(() => []),
    svc.entities.ReadingProgress.filter({ created_by: email }, '-completed_at', 2000).catch(() => []),
    svc.entities.UserVerseInteraction.filter({ created_by: email }, '-updated_date', 4000).catch(() => []),
    svc.entities.ReadingSession.filter({ created_by: email }, '-updated_date', 4000).catch(() => []),
  ]);

  const interactionMap = new Map((interactions || []).map(r => [r.verse_key, r]));
  const sessionSet = new Set((sessions || []).map(r => r.session_key));
  const merged = new Map();

  const seed = (k, src) => ({ ...(merged.get(k) || {}), verse_key: k, verse_ref: src.verse_ref, book: src.book, book_order: BOOK_ORDER[src.book] || 0, chapter: src.chapter, verse: src.verse, translation: src.translation || 'KJV', last_interacted_at: src.updated_date || src.created_date || startedAt });

  for (const h of highlights || []) { const k = verseKey(h.translation, h.book, h.chapter, h.verse); merged.set(k, { ...seed(k, h), highlight_color: h.color || 'yellow' }); }
  for (const b of bookmarks || []) { const k = verseKey(b.translation, b.book, b.chapter, b.verse); merged.set(k, { ...seed(k, b), is_bookmarked: true, tags: b.tags || [] }); }
  for (const n of notes || []) { const k = verseKey(n.translation, n.book, n.chapter, n.verse); merged.set(k, { ...seed(k, n), note_text: n.note_text, has_note: !!n.note_text, tags: n.tags || (merged.get(k)?.tags) || [] }); }

  let written = 0;
  for (const interaction of merged.values()) {
    const data = { is_bookmarked: false, highlight_color: 'none', has_note: false, tags: [], ...interaction };
    const existing = interactionMap.get(interaction.verse_key);
    if (existing) await svc.entities.UserVerseInteraction.update(existing.id, data);
    else await svc.entities.UserVerseInteraction.create(data);
    written += 1;
  }

  for (const p of progress || []) {
    const k = sessionKey(email, p.translation, p.book, p.chapter, p.completed_at);
    if (sessionSet.has(k)) continue;
    await svc.entities.ReadingSession.create({
      session_key: k, plan_id: p.plan_id, book: p.book, book_order: BOOK_ORDER[p.book] || 0,
      chapter: p.chapter, translation: p.translation || 'KJV', started_at: p.created_date,
      completed_at: p.completed_at || p.created_date || startedAt, reading_time_seconds: p.reading_time_seconds || 0,
      completion_source: 'reader',
    });
    written += 1;
  }

  const read = (highlights?.length || 0) + (bookmarks?.length || 0) + (notes?.length || 0) + (progress?.length || 0);
  return { email, read, written, merged: merged.size };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const payload = await req.json().catch(() => ({}));
    const dryRun = payload?.dryRun === true;
    const startedAt = new Date().toISOString();

    let migrationRecord = null;
    if (!dryRun) {
      migrationRecord = await base44.asServiceRole.entities.DataMigrationRecord.create({
        migration_key: `all-users-data-architecture-v1-${startedAt}`,
        status: 'running', started_at: startedAt, details: { scope: 'all_users' },
      });
    }

    // Paginate users
    const pageSize = 100;
    let skip = 0;
    const perUser = [];
    let totalRead = 0;
    let totalWritten = 0;

    while (true) {
      const users = await base44.asServiceRole.entities.User.list('-created_date', pageSize, skip).catch(() => []);
      if (!users || users.length === 0) break;
      for (const u of users) {
        if (!u.email) continue;
        if (dryRun) {
          // count-only: read legacy volumes without writing
          const [h, b, n, p] = await Promise.all([
            base44.asServiceRole.entities.UserHighlight.filter({ created_by: u.email }, '-updated_date', 2000).catch(() => []),
            base44.asServiceRole.entities.Bookmark.filter({ created_by: u.email }, '-updated_date', 2000).catch(() => []),
            base44.asServiceRole.entities.UserNote.filter({ created_by: u.email }, '-updated_date', 2000).catch(() => []),
            base44.asServiceRole.entities.ReadingProgress.filter({ created_by: u.email }, '-completed_at', 2000).catch(() => []),
          ]);
          const read = (h?.length || 0) + (b?.length || 0) + (n?.length || 0) + (p?.length || 0);
          totalRead += read;
          perUser.push({ email: u.email, read });
        } else {
          const r = await migrateOneUser(base44, u.email, startedAt);
          totalRead += r.read;
          totalWritten += r.written;
          perUser.push(r);
        }
      }
      if (users.length < pageSize) break;
      skip += pageSize;
    }

    const result = { success: true, dryRun, users: perUser.length, records_read: totalRead, records_written: totalWritten };

    if (migrationRecord) {
      await base44.asServiceRole.entities.DataMigrationRecord.update(migrationRecord.id, {
        status: 'completed', completed_at: new Date().toISOString(),
        records_read: totalRead, records_written: totalWritten, details: { ...result, per_user: perUser.slice(0, 200) },
      });
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});