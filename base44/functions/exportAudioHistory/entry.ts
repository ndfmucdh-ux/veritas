import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { format = 'csv' } = body;

    const allAudio = await base44.entities.BibleAudioProgress.list('-updated_date', 1000);

    if (format === 'csv') {
      const rows = ['Book,Chapter,Translation,Completed,Timestamp (seconds),Date'];
      for (const a of allAudio) {
        rows.push(`"${a.book}","${a.chapter}","${a.translation}","${a.completed ? 'Yes' : 'No'}","${a.timestamp_seconds || 0}","${(a.updated_date || a.created_date)?.slice(0, 10) || ''}"`);
      }
      const csv = rows.join('\n');
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="audio-history.csv"'
        }
      });
    }

    // PDF format - return structured JSON for jsPDF on frontend
    // Group by book for summary
    const byBook = {};
    for (const a of allAudio) {
      if (!byBook[a.book]) byBook[a.book] = { total: 0, completed: 0, chapters: [] };
      byBook[a.book].total++;
      if (a.completed) byBook[a.book].completed++;
      byBook[a.book].chapters.push({ chapter: a.chapter, completed: a.completed, date: (a.updated_date || a.created_date)?.slice(0, 10) });
    }

    const totalCompleted = allAudio.filter(a => a.completed).length;
    const totalListened = allAudio.length;
    const totalSeconds = allAudio.reduce((sum, a) => sum + (a.timestamp_seconds || 0), 0);

    return Response.json({
      success: true,
      format: 'pdf_data',
      summary: {
        total_chapters_started: totalListened,
        total_completed: totalCompleted,
        total_listening_seconds: totalSeconds,
        total_listening_hours: Math.round(totalSeconds / 3600 * 10) / 10
      },
      by_book: byBook,
      records: allAudio
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});