import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { denyUnlessAdmin } from '../../shared/guard.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const denied = await denyUnlessAdmin(base44);
    if (denied) return denied;

    // Scheduled job — runs every Sunday at midnight
    // Export all user notes grouped by user
    const allNotes = await base44.asServiceRole.entities.UserNote.list('-created_date', 1000);
    
    // Group by user
    const byUser = {};
    for (const note of allNotes) {
      const email = note.created_by;
      if (!email) continue;
      if (!byUser[email]) byUser[email] = [];
      byUser[email].push(note);
    }

    let exported = 0;
    for (const [email, notes] of Object.entries(byUser)) {
      if (notes.length === 0) continue;

      const date = new Date().toISOString().slice(0, 10);
      const csvRows = ['Verse Reference,Book,Chapter,Verse,Translation,Note,Date Created'];
      
      for (const n of notes) {
        const safeNote = (n.note_text || '').replace(/"/g, '""').replace(/\n/g, ' ');
        csvRows.push(`"${n.verse_ref || ''}","${n.book || ''}","${n.chapter || ''}","${n.verse || ''}","${n.translation || ''}","${safeNote}","${n.created_date?.slice(0, 10) || ''}"`);
      }

      const csvContent = csvRows.join('\n');

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `📝 Your Veritas Notes Backup — ${date}`,
        body: `<div style="font-family: Georgia, serif; max-width: 600px; margin: auto; background: #0a0f1e; color: #e8e8e8; padding: 32px; border-radius: 16px;">
          <h2 style="color: #a78bfa;">Your Weekly Notes Backup</h2>
          <p style="color: rgba(255,255,255,0.75); line-height: 1.7;">Beloved, here is your weekly backup of all ${notes.length} notes you've written in Veritas. Your reflections are precious — keep them safe.</p>
          <p style="color: rgba(255,255,255,0.5); font-style: italic;">"Write the vision; make it plain on tablets." — Habakkuk 2:2</p>
          <pre style="background: rgba(255,255,255,0.06); padding: 16px; border-radius: 8px; font-size: 11px; color: rgba(255,255,255,0.6); overflow-x: auto; max-height: 400px;">${csvContent}</pre>
          <p style="color: rgba(255,255,255,0.35); font-size: 12px; margin-top: 16px;">This backup was generated automatically every Sunday at midnight.</p>
        </div>`
      });
      exported++;
    }

    return Response.json({ success: true, users_exported: exported });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});