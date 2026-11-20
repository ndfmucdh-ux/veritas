import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { denyUnlessAdmin } from '../../shared/guard.ts';
import { renderEmail, sendBrandedEmail, appLink, heroFor, firstNameOf } from '../../shared/emailBrand.ts';
import { readerLang } from '../../shared/bibleLocale.ts';
import { loadPrefsMap, pick } from '../../shared/people.ts';

const toBase64 = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};

// Sunday workflow: emails each person a CSV backup of their own notes, attached as a file.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const denied = await denyUnlessAdmin(base44);
    if (denied) return denied;

    const db = base44.asServiceRole.entities;
    const [allNotes, users, prefs] = await Promise.all([
      db.UserNote.list('-created_date', 1000),
      db.User.list('-created_date', 1000),
      loadPrefsMap(base44),
    ]);
    const byUser = new Map<string, any[]>();
    for (const n of allNotes || []) {
      const k = String(n.created_by || '').toLowerCase();
      if (k) byUser.set(k, [...(byUser.get(k) || []), n]);
    }
    const nameBy = new Map<string, any>((users || []).map((u: any) => [String(u.email).toLowerCase(), u]));

    const date = new Date().toISOString().slice(0, 10);
    let exported = 0;
    for (const [email, notes] of byUser) {
      const pref = prefs.get(email);
      if (pref?.reminders?.channels?.email === false) continue;
      const lang = readerLang(pref);
      const rows = ['Verse Reference,Book,Chapter,Verse,Translation,Note,Date Created'];
      for (const n of notes) {
        const note = String(n.note_text || '').replace(/"/g, '""').replace(/\n/g, ' ');
        rows.push(`"${n.verse_ref || ''}","${n.book || ''}","${n.chapter || ''}","${n.verse || ''}","${n.translation || ''}","${note}","${String(n.created_date || '').slice(0, 10)}"`);
      }
      const u = nameBy.get(email);
      const first = firstNameOf(u?.display_name || u?.full_name, pick(lang, { en: 'Beloved', es: 'Amado' }));
      const res = await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        from_name: 'Veritas',
        subject: pick(lang, { en: `Your Veritas notes backup (${date})`, es: `Tu respaldo de notas de Veritas (${date})` }),
        html: renderEmail({
          lang, chip: pick(lang, { en: '📝 NOTES BACKUP', es: '📝 RESPALDO DE NOTAS' }), hero: heroFor('wisdom'),
          title: pick(lang, { en: `${first}, your notes are safe`, es: `${first}, tus notas están a salvo` }),
          paragraphs: [pick(lang, {
            en: `Your weekly backup of ${notes.length} notes is attached as a spreadsheet (CSV).`,
            es: `Tu respaldo semanal de ${notes.length} notas va adjunto como hoja de cálculo (CSV).`,
          })],
          cta: { label: pick(lang, { en: 'Open my notes', es: 'Abrir mis notas' }), url: appLink('/library') },
          footerTag: pick(lang, { en: 'Notes Backup', es: 'Respaldo de Notas' }),
          sentLine: pick(lang, { en: 'Sent automatically each Sunday', es: 'Enviado automáticamente cada domingo' }),
        }),
        category: 'transactional',
        attachments: [{ filename: `veritas-notes-${date}.csv`, content: toBase64(rows.join('\n')) }],
      });
      if (res?.success !== false) exported++;
    }
    return Response.json({ success: true, users_exported: exported });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}