import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [bookmarks, highlights, notes, prayers, studies] = await Promise.all([
      base44.entities.Bookmark.filter({ created_by: user.email }),
      base44.entities.UserHighlight.filter({ created_by: user.email }),
      base44.entities.UserNote.filter({ created_by: user.email }),
      base44.entities.PrayerJournal.filter({ created_by: user.email }),
      base44.entities.StudyNote.filter({ created_by: user.email })
    ]);

    const exportData = {
      user: { email: user.email, full_name: user.full_name },
      exported_at: new Date().toISOString(),
      data: {
        bookmarks: bookmarks || [],
        highlights: highlights || [],
        notes: notes || [],
        prayers: prayers || [],
        studies: studies || []
      },
      summary: {
        total_bookmarks: bookmarks?.length || 0,
        total_highlights: highlights?.length || 0,
        total_notes: notes?.length || 0,
        total_prayers: prayers?.length || 0,
        total_studies: studies?.length || 0
      }
    };

    return Response.json(exportData);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});