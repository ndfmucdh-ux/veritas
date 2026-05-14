import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";
const APP  = "https://veritas.base44.app";

// buildVeritasEmail — inlined (Deno deploy: no local imports)
function buildVeritasEmail({ heroImageUrl, chipLabel="VERITAS · THE WORD", heading, verseRef, bodyLines=[], ctaUrl, ctaLabel="Open →", footerLine="Veritas", previewBlock, date }) {
  const heroImg = heroImageUrl || "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&q=80";
  const formattedDate = date ? new Date(date).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}) : new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const bodyHtml = bodyLines.map(l=>`<p style="font-family:Georgia,serif;font-size:14px;font-style:italic;color:rgba(255,255,255,0.62);line-height:1.78;margin:0 0 10px;">${l}</p>`).join("");
  const previewHtml = previewBlock ? `<div style="margin:0 18px 16px;padding:16px 18px;background:#1a1510;border-radius:13px;border-left:3px solid rgba(201,168,76,0.45);"><p style="font-family:Arial,sans-serif;font-size:8.5px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(201,168,76,0.55);margin:0 0 6px;">${previewBlock.label||"✦ Reflection"}</p><p style="font-family:Georgia,serif;font-size:14px;font-style:italic;color:rgba(255,255,255,0.6);line-height:1.75;margin:0;">"${previewBlock.text}"</p></div>` : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${chipLabel}</title></head><body style="margin:0;padding:0;background:#0a0805;"><div style="max-width:480px;margin:0 auto;background:#0a0805;font-family:Georgia,serif;"><div style="width:100%;height:4px;background:linear-gradient(90deg,#7b4f1e,#c9a84c,#7b4f1e);"></div><div style="line-height:0;position:relative;"><img src="${heroImg}" alt="" width="480" style="width:100%;max-width:480px;display:block;height:230px;object-fit:cover;object-position:center 40%;"/><div style="position:absolute;bottom:0;left:0;right:0;height:110px;background:linear-gradient(to bottom,transparent,#0a0805);"></div></div><div style="background:#0a0805;text-align:center;padding:0 24px 6px;margin-top:-52px;position:relative;z-index:2;"><div style="display:inline-block;background:#0a0805;padding:4px;border-radius:50%;border:2px solid #c9a84c;box-shadow:0 0 30px rgba(201,168,76,0.35);"><img src="${LOGO}" alt="Veritas" width="72" height="72" style="border-radius:50%;display:block;background:#0a0805;"/></div><p style="font-family:Arial,sans-serif;font-size:8.5px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.22);margin:8px 0 0;">VERITAS · THE WORD</p></div><div style="text-align:center;padding:12px 24px 4px;"><div style="display:inline-block;background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.25);border-radius:999px;padding:5px 18px;"><span style="font-family:Arial,sans-serif;font-size:8.5px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;">${chipLabel}</span></div><p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.2);margin:8px 0 0;">${formattedDate}</p></div><div style="margin:14px 18px 6px;background:#14100a;border-radius:18px;padding:28px 22px 24px;text-align:center;border:1px solid rgba(201,168,76,0.14);box-shadow:0 8px 40px rgba(0,0,0,0.5);">${heading?`<p style="font-family:Georgia,serif;font-size:19px;font-style:italic;font-weight:bold;color:#f0e6d0;line-height:1.75;margin:0 0 16px;">"${heading}"</p>`:""} ${verseRef?`<div style="width:32px;height:1px;background:#c9a84c;opacity:0.35;margin:0 auto 12px;"></div><p style="font-family:Arial,sans-serif;font-size:9.5px;font-weight:bold;letter-spacing:0.2em;color:#c9a84c;margin:0 0 16px;">— ${verseRef.toUpperCase()} —</p>`:""} ${bodyHtml}</div>${previewHtml}<div style="text-align:center;padding:18px 24px 24px;"><a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#b8862e,#c9a84c,#b8862e);color:#0a0805;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:0.06em;padding:15px 52px;border-radius:50px;text-decoration:none;box-shadow:0 4px 20px rgba(201,168,76,0.3);">${ctaLabel}</a></div><div style="margin:0 24px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.18),transparent);"></div><div style="text-align:center;padding:20px 24px 28px;"><img src="${LOGO}" alt="Veritas" width="28" height="28" style="border-radius:50%;border:1.5px solid rgba(201,168,76,0.3);display:inline-block;margin-bottom:8px;"/><p style="font-family:Arial,sans-serif;font-size:10.5px;color:rgba(255,255,255,0.35);margin:0 0 2px;">${footerLine}</p><p style="font-family:Arial,sans-serif;font-size:9.5px;color:rgba(255,255,255,0.15);margin:4px 0 0;">veritas.base44.app · © 2026 Veritas</p></div><div style="width:100%;height:3px;background:linear-gradient(90deg,#7b4f1e,#c9a84c,#7b4f1e);"></div></div></body></html>`;
}

function buildReadingReminderEmail({ name, lastBook, lastChapter, devotionalPreview }) {
  const firstName = name?.split(" ")[0] || "Beloved";
  const readLink = `${APP}/#/read?book=${encodeURIComponent(lastBook || "John")}&chapter=${lastChapter || 1}`;
  const refUpper = `${(lastBook || "John").toUpperCase()} ${lastChapter || 1}`;
  return buildVeritasEmail({
    heroImageUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&q=80",
    chipLabel: "📖 RECORDATORIO DE LECTURA",
    heading: `${firstName}, tu Palabra de hoy te espera.`,
    verseRef: `CONTINÚA EN ${refUpper}`,
    bodyLines: [`"Lámpara es a mis pies tu palabra, y lumbrera a mi camino." — Salmos 119:105`],
    ctaUrl: readLink,
    ctaLabel: "Continuar Leyendo →",
    footerLine: "Veritas — Recordatorio de Lectura",
    previewBlock: devotionalPreview ? { label: "✦ Today's Devotional Preview", text: devotionalPreview } : undefined,
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date().toISOString().split('T')[0];
    const todayProgress = await base44.entities.ReadingProgress.filter({
      created_by: user.email,
      completed_at: { $regex: `^${today}` }
    }).catch(() => []);

    if (todayProgress && todayProgress.length > 0) {
      return Response.json({ message: 'User already read today', skipped: true });
    }

    const lastSession = await base44.entities.ReadingProgress.list('-completed_at', 1).catch(() => []);
    const lastBook    = lastSession?.[0]?.book || 'John';
    const lastChapter = lastSession?.[0]?.chapter || 1;

    // Get today's devotional for preview text
    const todayVerse = await base44.asServiceRole.entities.DailyVerse.filter({ date: today }).catch(() => []);
    const verse = todayVerse?.[0];
    let devotionalPreview = null;
    if (verse?.reflection) {
      devotionalPreview = verse.reflection.split(". ")[0] + ".";
    }

    const html = buildReadingReminderEmail({ name: user.full_name, lastBook, lastChapter, devotionalPreview });

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: "Veritas · The Word",
      to: user.email,
      subject: `📖 Continúa en ${lastBook} ${lastChapter} — Tu lectura de hoy te espera`,
      body: html,
    });

    return Response.json({ success: true, reminded: user.email, context: { lastBook, lastChapter } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});