import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";
const APP  = "https://veritas.base44.app";
const HERO = "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&q=80";

function buildReadingReminderEmail({ name, lastBook, lastChapter, devotionalPreview }) {
  const firstName = name?.split(" ")[0] || "Beloved";
  const readLink = `${APP}/#/read?book=${encodeURIComponent(lastBook || "John")}&chapter=${lastChapter || 1}`;
  const refUpper = `${(lastBook || "John").toUpperCase()} ${lastChapter || 1}`;

  const previewSection = devotionalPreview ? `
  <div style="margin:0 20px 20px;padding:18px 22px;background:#1a1510;border-radius:16px;border-left:3px solid rgba(201,168,76,0.5);">
    <p style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(201,168,76,0.6);margin:0 0 8px;">✦ Today's Devotional Preview</p>
    <p style="font-family:Georgia,serif;font-size:14px;font-style:italic;color:rgba(255,255,255,0.62);line-height:1.75;margin:0;">
      "${devotionalPreview}"
    </p>
  </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Veritas · Reading Reminder</title>
</head>
<body style="margin:0;padding:0;background:#0f0d0a;font-family:Georgia,serif;">
<div style="max-width:480px;margin:0 auto;background:#0f0d0a;">

  <div style="width:100%;line-height:0;">
    <img src="${HERO}" alt="Veritas" width="480"
      style="width:100%;max-width:480px;display:block;height:220px;object-fit:cover;object-position:center center;"/>
  </div>

  <div style="background:#0f0d0a;text-align:center;padding:0 24px 4px;margin-top:-44px;position:relative;z-index:2;">
    <img src="${LOGO}" alt="Veritas" width="80" height="80"
      style="border-radius:50%;border:3px solid #c9a84c;box-shadow:0 0 28px rgba(201,168,76,0.4);display:inline-block;background:#0f0d0a;"/>
    <p style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.28);margin:10px 0 0;">VERITAS · THE WORD</p>
  </div>

  <div style="text-align:center;padding:12px 24px 4px;">
    <div style="display:inline-block;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.28);border-radius:999px;padding:5px 20px;">
      <span style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;">📖 RECORDATORIO DE LECTURA</span>
    </div>
  </div>

  <div style="margin:16px 20px 8px;background:#1e1a12;border-radius:20px;padding:30px 24px 26px;text-align:center;border:1px solid rgba(201,168,76,0.18);">
    <p style="font-family:Georgia,serif;font-size:20px;font-style:italic;color:#f0e6d0;line-height:1.80;margin:0 0 18px;">
      "${firstName}, tu Palabra de hoy te espera."
    </p>
    <div style="width:36px;height:1px;background:#c9a84c;opacity:0.4;margin:0 auto 14px;"></div>
    <p style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;letter-spacing:0.2em;color:#c9a84c;margin:0 0 14px;">
      — CONTINÚA EN ${refUpper} —
    </p>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.4);margin:0;line-height:1.6;">
      "Lámpara es a mis pies tu palabra, y lumbrera a mi camino." — Salmos 119:105
    </p>
  </div>

  ${previewSection}

  <div style="text-align:center;padding:16px 24px 28px;">
    <a href="${readLink}" style="display:inline-block;background:#c9a84c;color:#0f0d0a;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.05em;padding:16px 52px;border-radius:50px;text-decoration:none;">
      Continuar Leyendo →
    </a>
  </div>

  <div style="text-align:center;padding:16px 24px 28px;border-top:1px solid rgba(255,255,255,0.06);">
    <img src="${LOGO}" alt="Veritas" width="32" height="32"
      style="border-radius:50%;border:1.5px solid rgba(201,168,76,0.35);display:inline-block;margin-bottom:8px;"/>
    <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.4);margin:0 0 2px;">Veritas — Recordatorio de Lectura</p>
    <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.2);margin:4px 0 0;">veritas.base44.app · © 2026 Veritas</p>
  </div>

</div>
</body>
</html>`;
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