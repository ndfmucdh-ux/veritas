import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
    const recentProgress = (progress || []).filter(p => new Date(p.created_date) >= weekAgo);
    const recentHighlights = (highlights || []).filter(h => new Date(h.created_date) >= weekAgo);

    const COLOR_NAMES = { yellow: '🟡', cyan: '🔵', purple: '🟣', green: '🟢', red: '🔴' };
    const highlightRows = recentHighlights.slice(0, 10).map(h =>
      `<tr><td style="padding:6px 12px;color:#e2e8f0;">${h.verse_ref}</td><td style="padding:6px 12px;color:#94a3b8;">${COLOR_NAMES[h.color] || '⭐'} ${h.color}</td></tr>`
    ).join('');

    const progressRows = recentProgress.slice(0, 10).map(p =>
      `<tr><td style="padding:6px 12px;color:#e2e8f0;">${p.book} ${p.chapter}</td><td style="padding:6px 12px;color:#94a3b8;">${p.translation || 'KJV'}</td></tr>`
    ).join('');

    const body = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0a0f1e;font-family:Georgia,serif;color:#e2e8f0;max-width:600px;margin:0 auto;padding:24px;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-family:'Cinzel',serif;color:#00f5ff;font-size:24px;margin-bottom:4px;">✝ Veritas Weekly Report</h1>
    <p style="color:#64748b;font-size:14px;">Your scripture journey this week · ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div style="display:flex;gap:16px;margin-bottom:24px;">
    <div style="flex:1;background:rgba(0,245,255,0.06);border:1px solid rgba(0,245,255,0.2);border-radius:12px;padding:16px;text-align:center;">
      <p style="font-size:32px;font-weight:bold;color:#00f5ff;margin:0;">${recentProgress.length}</p>
      <p style="color:#64748b;font-size:12px;margin:4px 0 0;">Chapters Read</p>
    </div>
    <div style="flex:1;background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.2);border-radius:12px;padding:16px;text-align:center;">
      <p style="font-size:32px;font-weight:bold;color:#a78bfa;margin:0;">${recentHighlights.length}</p>
      <p style="color:#64748b;font-size:12px;margin:4px 0 0;">Verses Highlighted</p>
    </div>
  </div>

  ${recentProgress.length > 0 ? `
  <div style="margin-bottom:24px;">
    <h2 style="color:#fbbf24;font-size:14px;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">📖 Chapters Read This Week</h2>
    <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.02);border-radius:8px;overflow:hidden;">
      <thead><tr style="background:rgba(255,255,255,0.04);">
        <th style="padding:8px 12px;text-align:left;color:#64748b;font-size:12px;">Reference</th>
        <th style="padding:8px 12px;text-align:left;color:#64748b;font-size:12px;">Translation</th>
      </tr></thead>
      <tbody>${progressRows}</tbody>
    </table>
  </div>` : ''}

  ${recentHighlights.length > 0 ? `
  <div style="margin-bottom:24px;">
    <h2 style="color:#00f5ff;font-size:14px;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">✨ Highlighted Verses This Week</h2>
    <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.02);border-radius:8px;overflow:hidden;">
      <thead><tr style="background:rgba(255,255,255,0.04);">
        <th style="padding:8px 12px;text-align:left;color:#64748b;font-size:12px;">Verse</th>
        <th style="padding:8px 12px;text-align:left;color:#64748b;font-size:12px;">Color</th>
      </tr></thead>
      <tbody>${highlightRows}</tbody>
    </table>
  </div>` : ''}

  <div style="text-align:center;padding-top:24px;border-top:1px solid rgba(255,255,255,0.07);">
    <p style="color:#475569;font-size:12px;">Keep going — every chapter brings you closer to Him. 🙏</p>
    <a href="${Deno.env.get('APP_URL') || '#'}/read" style="display:inline-block;margin-top:12px;padding:10px 24px;background:rgba(0,245,255,0.12);border:1px solid rgba(0,245,255,0.3);border-radius:8px;color:#00f5ff;text-decoration:none;font-size:14px;">Continue Reading →</a>
  </div>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: `✝ Your Veritas Weekly Scripture Report — ${recentProgress.length} chapters read`,
      body,
    });

    return Response.json({ sent: true, chapters: recentProgress.length, highlights: recentHighlights.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});