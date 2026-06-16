import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Consolidated source first (one row per verse), legacy fallback.
    const [interactions, folders] = await Promise.all([
      base44.entities.UserVerseInteraction.list('-last_interacted_at', 1000).catch(() => []),
      base44.entities.VerseFolder.list('-created_date', 100),
    ]);

    let bookmarks, highlights, notes;
    if (interactions && interactions.length > 0) {
      bookmarks = interactions.filter(i => i.is_bookmarked);
      highlights = interactions.filter(i => i.highlight_color && i.highlight_color !== 'none')
        .map(i => ({ ...i, color: i.highlight_color }));
      notes = interactions.filter(i => i.has_note || i.note_text);
    } else {
      [bookmarks, highlights, notes] = await Promise.all([
        base44.entities.Bookmark.list('-created_date', 500),
        base44.entities.UserHighlight.list('-created_date', 500),
        base44.entities.UserNote.list('-created_date', 500),
      ]);
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const displayName = user.full_name || user.email || 'Believer';

    const lines = [];

    // ── Beautiful Header ──────────────────────────────────────────
    lines.push('');
    lines.push('╔══════════════════════════════════════════════════════════════╗');
    lines.push('║                                                              ║');
    lines.push('║          ✦  V E R I T A S  B I B L E  A P P  ✦              ║');
    lines.push('║                  Personal Library Export                    ║');
    lines.push('║                                                              ║');
    lines.push('╚══════════════════════════════════════════════════════════════╝');
    lines.push('');
    lines.push(`  👤  ${displayName}`);
    lines.push(`  📅  ${dateStr}  ·  ${timeStr}`);
    lines.push(`  📖  ${bookmarks.length} bookmarks  ·  ${highlights.length} highlights  ·  ${notes.length} notes`);
    lines.push('');
    lines.push('━'.repeat(66));
    lines.push('');

    // ── TABLE OF CONTENTS ────────────────────────────────────────
    lines.push('## TABLE OF CONTENTS');
    lines.push('');
    lines.push('  1.  Bookmarks');
    lines.push('  2.  Highlighted Verses');
    lines.push('  3.  Personal Notes & Reflections');
    if (folders.length > 0) lines.push('  4.  Study Folders');
    lines.push('');
    lines.push('━'.repeat(66));
    lines.push('');

    // ── SECTION 1: BOOKMARKS ─────────────────────────────────────
    lines.push('## 1.  BOOKMARKS');
    lines.push('');
    if (bookmarks.length === 0) {
      lines.push('   (No bookmarks saved yet)');
    } else {
      // Group by book
      const byBook = {};
      bookmarks.forEach(bm => {
        const book = bm.book || bm.verse_ref?.split(' ')[0] || 'Unknown';
        if (!byBook[book]) byBook[book] = [];
        byBook[book].push(bm);
      });
      Object.entries(byBook).forEach(([book, bms]) => {
        lines.push(`  📖  ${book}`);
        bms.forEach(bm => {
          const label = bm.label ? `  "${bm.label}"` : '';
          lines.push(`       ▸  ${bm.verse_ref}${label}  [${bm.translation || 'KJV'}]`);
        });
        lines.push('');
      });
    }
    lines.push('━'.repeat(66));
    lines.push('');

    // ── SECTION 2: HIGHLIGHTS ────────────────────────────────────
    lines.push('## 2.  HIGHLIGHTED VERSES');
    lines.push('');
    const colorEmoji = { yellow: '🟡', cyan: '🔵', purple: '🟣', green: '🟢', red: '🔴', orange: '🟠', pink: '🩷' };
    if (highlights.length === 0) {
      lines.push('   (No highlights saved yet)');
    } else {
      const byColor = {};
      highlights.forEach(hl => {
        if (!byColor[hl.color]) byColor[hl.color] = [];
        byColor[hl.color].push(hl);
      });
      Object.entries(byColor).forEach(([color, hls]) => {
        const emoji = colorEmoji[color] || '◆';
        lines.push(`  ${emoji}  ${color.charAt(0).toUpperCase() + color.slice(1)} Highlights`);
        hls.forEach(hl => {
          lines.push(`       ▸  ${hl.verse_ref}  [${hl.translation || 'KJV'}]`);
        });
        lines.push('');
      });
    }
    lines.push('━'.repeat(66));
    lines.push('');

    // ── SECTION 3: NOTES ─────────────────────────────────────────
    lines.push('## 3.  PERSONAL NOTES & REFLECTIONS');
    lines.push('');
    if (notes.length === 0) {
      lines.push('   (No notes written yet)');
    } else {
      notes.forEach((note, i) => {
        const noteDate = note.created_date
          ? new Date(note.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '';
        lines.push(`  ✍️   Note ${i + 1}${noteDate ? '  ·  ' + noteDate : ''}`);
        lines.push(`  ┌─  ${note.verse_ref || ''}  [${note.translation || 'KJV'}]`);
        // Word-wrap the note text at ~60 chars
        const words = (note.note_text || '').split(' ');
        let line = '  │   ';
        words.forEach(word => {
          if ((line + word).length > 64) {
            lines.push(line);
            line = '  │   ' + word + ' ';
          } else {
            line += word + ' ';
          }
        });
        if (line.trim() !== '│') lines.push(line);
        lines.push('  └──────────────────────────────────────────────────');
        lines.push('');
      });
    }

    // ── SECTION 4: FOLDERS ───────────────────────────────────────
    if (folders.length > 0) {
      lines.push('━'.repeat(66));
      lines.push('');
      lines.push('## 4.  STUDY FOLDERS');
      lines.push('');
      folders.forEach(folder => {
        const refs = folder.verse_refs || [];
        lines.push(`  ${folder.icon || '📁'}  ${folder.name}  (${refs.length} verse${refs.length !== 1 ? 's' : ''})`);
        if (refs.length > 0) {
          refs.forEach(ref => lines.push(`       ▸  ${ref}`));
        } else {
          lines.push('       (empty folder)');
        }
        lines.push('');
      });
    }

    // ── Footer ────────────────────────────────────────────────────
    lines.push('━'.repeat(66));
    lines.push('');
    lines.push('         ✦ ✦ ✦   Generated by Veritas Bible App   ✦ ✦ ✦');
    lines.push('');
    lines.push('  "Thy word is a lamp unto my feet, and a light unto my path."');
    lines.push('                                          — Psalm 119:105 KJV');
    lines.push('');
    lines.push('━'.repeat(66));
    lines.push('');

    const content = lines.join('\n');
    const filename = `veritas-library-${now.toISOString().slice(0, 10)}.md`;

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});