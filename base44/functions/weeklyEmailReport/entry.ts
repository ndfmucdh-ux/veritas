import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";
const APP  = "https://veritas.base44.app";
const HERO = "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=600&q=80";

function buildWeeklyReportEmail({ name, chaptersRead, highlightsCount, progressRows, highlightRows, weekStart }) {
  const firstName = name?.split(" ")[0] || "Beloved";
  const weekLabel = new Date(weekStart || new Date()).toLocaleDateString("es-ES", { month: "long", day: "numeric" });

  const chaptersHtml = progressRows?.length ? progressRows.slice(0, 8).map(r => r).join("") : "";
  const highlightsHtml = highlightRows?.length ? highlightRows.slice(0, 8).map(r => r).join("") : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Veritas · Reporte Semanal</title>
</head>
<body style="margin:0;padding:0;background:#1a1510;font-family:Georgia,serif;">
<div style="max-width:480px;margin:0 auto;background:#1a1510;">

  <!-- HERO IMAGE -->
  <div style="width:100%;line-height:0;">
    <img src="${HERO}" alt="Veritas" width="480" style="width:100%;max-width:480px;display:block;height:220px;object-fit:cover;object-position:center center;"/>
  </div>

  <!-- LOGO — overlapping hero/body boundary -->
  <div style="background:#1a1510;text-align:center;padding:0 24px 4px;margin-top:-44px;position:relative;z-index:2;">
    <img src="${LOGO}" alt="Veritas" width="80" height="80"
      style="border-radius:50%;border:3px solid #c9a84c;box-shadow:0 0 28px rgba(201,168,76,0.4);display:inline-block;background:#1a1510;"/>
    <p style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.28);margin:10px 0 0;">VERITAS · THE WORD</p>
  </div>

  <!-- LABEL -->
  <div style="text-align:center;padding:12px 24px 4px;">
    <span style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;">RESUMEN SEMANAL</span>
  </div>

  <!-- GREETING CARD -->
  <div style="margin:16px 20px 16px;background:#2a2015;border-radius:20px;padding:28px 24px;text-align:center;border:1px solid rgba(201,168,76,0.15);">
    <p style="font-family:Georgia,serif;font-size:20px;font-style:italic;color:#f0e6d0;line-height:1.7;margin:0 0 8px;">
      "Tu semana en la Palabra, ${firstName}"
    </p>
    <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.4);margin:0;">Semana del ${weekLabel}</p>
  </div>

  <!-- STATS ROW -->
  <div style="margin:0 20px 16px;display:table;width:calc(100% - 40px);">
    <div style="display:table-cell;width:50%;padding-right:6px;">
      <div style="background:#2a2015;border:1px solid rgba(201,168,76,0.2);border-radius:16px;padding:18px;text-align:center;">
        <div style="font-family:Arial,sans-serif;font-size:32px;font-weight:bold;color:#c9a84c;line-height:1;">${chaptersRead || 0}</div>
        <div style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.35);margin-top:5px;letter-spacing:0.08em;text-transform:uppercase;">Capítulos</div>
      </div>
    </div>
    <div style="display:table-cell;width:50%;padding-left:6px;">
      <div style="background:#2a2015;border:1px solid rgba(167,139,250,0.2);border-radius:16px;padding:18px;text-align:center;">
        <div style="font-family:Arial,sans-serif;font-size:32px;font-weight:bold;color:#a78bfa;line-height:1;">${highlightsCount || 0}</div>
        <div style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.35);margin-top:5px;letter-spacing:0.08em;text-transform:uppercase;">Destacados</div>
      </div>
    </div>
  </div>

  <!-- CHAPTERS READ -->
  ${chaptersHtml ? `
  <div style="margin:0 20px 16px;">
    <p style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin:0 0 8px;">Capítulos leídos</p>
    ${chaptersHtml}
  </div>` : ''}

  <!-- HIGHLIGHTS -->
  ${highlightsHtml ? `
  <div style="margin:0 20px 20px;">
    <p style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin:0 0 8px;">Versículos destacados</p>
    ${highlightsHtml}
  </div>` : ''}

  ${!chaptersHtml && !highlightsHtml ? `
  <div style="margin:0 20px 20px;background:#2a2015;border-radius:16px;padding:24px;text-align:center;border:1px solid rgba(201,168,76,0.1);">
    <p style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:rgba(255,255,255,0.4);margin:0;">"Comienza a leer cada día para ver tu resumen semanal aquí."</p>
  </div>` : ''}

  <!-- CTA BUTTON -->
  <div style="text-align:center;padding:4px 24px 28px;">
    <a href="${APP}/#/" style="display:inline-block;background:#c9a84c;color:#1a1205;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.04em;padding:16px 48px;border-radius:50px;text-decoration:none;">
      Abrir Veritas →
    </a>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;padding:16px 24px 28px;border-top:1px solid rgba(255,255,255,0.07);">
    <img src="${LOGO}" alt="Veritas" width="36" height="36"
      style="border-radius:50%;border:2px solid rgba(201,168,76,0.4);display:inline-block;margin-bottom:8px;"/>
    <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.45);margin:0 0 2px;">Veritas — Reporte Semanal</p>
    <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.2);margin:8px 0 0;">Enviado automáticamente cada semana · © 2026 Veritas</p>
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

    const [progress, highlights] = await Promise.all([
      base44.entities.ReadingProgress.list('-created_date', 50),
      base44.entities.UserHighlight.list('-created_date', 30),
    ]);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentProgress  = (progress   || []).filter(p => new Date(p.created_date) >= weekAgo);
    const recentHighlights = (highlights || []).filter(h => new Date(h.created_date) >= weekAgo);

    const COLOR_NAMES = { yellow: "🟡", cyan: "🔵", purple: "🟣", green: "🟢", red: "🔴" };

    const progressRows = recentProgress.slice(0, 8).map(p =>
      `<div style="border-left:3px solid rgba(201,168,76,0.4);padding:10px 14px;margin-bottom:8px;background:rgba(201,168,76,0.04);border-radius:0 10px 10px 0;">
         <span style="font-family:Arial,sans-serif;font-size:13px;color:#e8d5b0;">${p.book} ${p.chapter}</span>
         <span style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.3);margin-left:10px;">${p.translation || "KJV"}</span>
       </div>`
    );

    const highlightRows = recentHighlights.slice(0, 8).map(h =>
      `<div style="border-left:3px solid rgba(167,139,250,0.4);padding:10px 14px;margin-bottom:8px;background:rgba(167,139,250,0.04);border-radius:0 10px 10px 0;">
         <span style="font-family:Arial,sans-serif;font-size:13px;color:#e8d5b0;">${h.verse_ref}</span>
         <span style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.3);margin-left:10px;">${COLOR_NAMES[h.color] || "⭐"} ${h.color}</span>
       </div>`
    );

    const weekStart = weekAgo.toISOString().split("T")[0];

    const html = buildWeeklyReportEmail({
      name: user.full_name,
      chaptersRead: recentProgress.length,
      highlightsCount: recentHighlights.length,
      progressRows,
      highlightRows,
      weekStart,
    });

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: "Veritas · The Word",
      to: user.email,
      subject: `✦ Tu Reporte Semanal Veritas — ${recentProgress.length} capítulo${recentProgress.length !== 1 ? "s" : ""} leído${recentProgress.length !== 1 ? "s" : ""}`,
      body: html,
    });

    return Response.json({ sent: true, chapters: recentProgress.length, highlights: recentHighlights.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});