import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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

const todayKey = () => new Date().toISOString().slice(0, 10);
const verseKey = (translation, book, chapter, verse) => `${translation || 'KJV'}|${book}|${chapter}|${verse}`;
const sessionKey = (userId, translation, book, chapter, completedAt) => {
  const date = completedAt ? String(completedAt).slice(0, 10) : todayKey();
  return `${userId}|${date}|${translation || 'KJV'}|${book}|${chapter}`;
};

async function getExistingInteractionMap(base44) {
  const records = await base44.entities.UserVerseInteraction.list('-updated_date', 1000);
  const map = new Map();
  for (const record of records || []) map.set(record.verse_key, record);
  return map;
}

async function getExistingSessionMap(base44) {
  const records = await base44.entities.ReadingSession.list('-updated_date', 1000);
  const map = new Map();
  for (const record of records || []) map.set(record.session_key, record);
  return map;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const dryRun = payload?.dryRun === true;
    const migrationKey = `user-data-architecture-v1-${user.id}-${new Date().toISOString()}`;
    const startedAt = new Date().toISOString();

    let migrationRecord = null;
    if (!dryRun) {
      migrationRecord = await base44.asServiceRole.entities.DataMigrationRecord.create({
        migration_key: migrationKey,
        status: 'running',
        started_at: startedAt,
        details: { user_id: user.id, scope: 'current_user' },
      });
    }

    const [highlights, bookmarks, notes, progress] = await Promise.all([
      base44.entities.UserHighlight.list('-updated_date', 1000),
      base44.entities.Bookmark.list('-updated_date', 1000),
      base44.entities.UserNote.list('-updated_date', 1000),
      base44.entities.ReadingProgress.list('-completed_at', 1000),
    ]);

    const interactionMap = await getExistingInteractionMap(base44);
    const sessionMap = await getExistingSessionMap(base44);
    const mergedInteractions = new Map();

    for (const highlight of highlights || []) {
      const key = verseKey(highlight.translation, highlight.book, highlight.chapter, highlight.verse);
      mergedInteractions.set(key, {
        ...(mergedInteractions.get(key) || {}),
        verse_key: key,
        verse_ref: highlight.verse_ref,
        book: highlight.book,
        chapter: highlight.chapter,
        verse: highlight.verse,
        translation: highlight.translation || 'KJV',
        highlight_color: highlight.color || 'yellow',
        last_interacted_at: highlight.updated_date || highlight.created_date || startedAt,
      });
    }

    for (const bookmark of bookmarks || []) {
      const key = verseKey(bookmark.translation, bookmark.book, bookmark.chapter, bookmark.verse);
      mergedInteractions.set(key, {
        ...(mergedInteractions.get(key) || {}),
        verse_key: key,
        verse_ref: bookmark.verse_ref,
        book: bookmark.book,
        chapter: bookmark.chapter,
        verse: bookmark.verse,
        translation: bookmark.translation || 'KJV',
        is_bookmarked: true,
        tags: bookmark.tags || [],
        last_interacted_at: bookmark.updated_date || bookmark.created_date || startedAt,
      });
    }

    for (const note of notes || []) {
      const key = verseKey(note.translation, note.book, note.chapter, note.verse);
      mergedInteractions.set(key, {
        ...(mergedInteractions.get(key) || {}),
        verse_key: key,
        verse_ref: note.verse_ref,
        book: note.book,
        chapter: note.chapter,
        verse: note.verse,
        translation: note.translation || 'KJV',
        note_text: note.note_text,
        tags: note.tags || [],
        last_interacted_at: note.updated_date || note.created_date || startedAt,
      });
    }

    let recordsWritten = 0;

    if (!dryRun) {
      for (const interaction of mergedInteractions.values()) {
        const existing = interactionMap.get(interaction.verse_key);
        const data = {
          is_bookmarked: false,
          highlight_color: 'none',
          tags: [],
          ...interaction,
        };

        if (existing) {
          await base44.entities.UserVerseInteraction.update(existing.id, data);
        } else {
          await base44.entities.UserVerseInteraction.create(data);
        }
        recordsWritten += 1;
      }

      for (const item of progress || []) {
        const key = sessionKey(user.id, item.translation, item.book, item.chapter, item.completed_at);
        if (sessionMap.has(key)) continue;

        await base44.entities.ReadingSession.create({
          session_key: key,
          plan_id: item.plan_id,
          book: item.book,
          book_order: BOOK_ORDER[item.book] || 0,
          chapter: item.chapter,
          translation: item.translation || 'KJV',
          started_at: item.created_date,
          completed_at: item.completed_at || item.created_date || startedAt,
          reading_time_seconds: item.reading_time_seconds || 0,
          completion_source: 'reader',
        });
        recordsWritten += 1;
      }
    }

    const recordsRead = (highlights?.length || 0) + (bookmarks?.length || 0) + (notes?.length || 0) + (progress?.length || 0);
    const result = {
      success: true,
      dryRun,
      records_read: recordsRead,
      merged_interactions: mergedInteractions.size,
      reading_sessions: progress?.length || 0,
      records_written: recordsWritten,
    };

    if (migrationRecord) {
      await base44.asServiceRole.entities.DataMigrationRecord.update(migrationRecord.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        records_read: recordsRead,
        records_written: recordsWritten,
        details: result,
      });
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});