import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Called by entity automation on UserHighlight or Bookmark create/update.
// Ensures ReadingProgress is up-to-date for the relevant book+chapter.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { data, event } = body;

    if (!data) return Response.json({ skipped: true });

    const { book, chapter, created_by, translation } = data;
    if (!book || !chapter || !created_by) {
      return Response.json({ skipped: "missing fields" });
    }

    // Upsert a ReadingProgress record for this book+chapter
    const existing = await base44.asServiceRole.entities.ReadingProgress.filter({
      book,
      chapter,
      created_by,
    });

    if (existing.length === 0) {
      await base44.asServiceRole.entities.ReadingProgress.create({
        book,
        chapter,
        translation: translation || "KJV",
        completed: true,
        created_by,
      });
    } else {
      await base44.asServiceRole.entities.ReadingProgress.update(existing[0].id, {
        completed: true,
      });
    }

    return Response.json({ success: true, book, chapter, action: event?.type });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});