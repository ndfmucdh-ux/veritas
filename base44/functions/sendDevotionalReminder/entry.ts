import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";
const APP  = "https://veritas.base44.app";
const HERO = "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80";

function buildDevotionalReminderEmail({ name, planName }) {
  const firstName = name?.split(" ")[0] || "Beloved";
  const planDisplay = (planName || "Tu Plan de Lectura").toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Veritas · Continúa tu Jornada</title>
</head>
<body style="margin:0;padding:0;background:#1a1510;font-family:Georgia,serif;">
<div style="max-width:480px;margin:0 auto;background:#1a1510;">

  <!-- HERO IMAGE -->
  <div style="position:relative;width:100%;line-height:0;">
    <img src="${HERO}" alt="Veritas" width="480" style="width:100%;max-width:480px;display:block;border-radius:0 0 28px 28px;"/>
    <div style="text-align:center;margin-top:-44px;position:relative;z-index:2;">
      <img src="${LOGO}" alt="Veritas" width="72" height="72"
        style="border-radius:50%;border:3px solid #c9a84c;box-shadow:0 4px 20px rgba(0,0,0,0.6);display:inline-block;"/>
    </div>
  </div>

  <!-- LABEL -->
  <div style="text-align:center;padding:18px 24px 4px;">
    <span style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;">&#128214; PLAN DEVOCIONAL</span>
  </div>

  <!-- CARD -->
  <div style="margin:16px 20px 20px;background:#2a2015;border-radius:20px;padding:32px 24px 28px;text-align:center;border:1px solid rgba(201,168,76,0.15);">
    <p style="font-family:Georgia,serif;font-size:20px;font-style:italic;color:#f0e6d0;line-height:1.75;margin:0 0 20px;">
      "${firstName}, continúa tu jornada en la Palabra hoy."
    </p>
    <p style="font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.18em;color:#c9a84c;margin:0 0 16px;">
      — ${planDisplay} —
    </p>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.6;margin:0;">
      "Toda palabra de Dios es limpia." — Proverbios 30:5
    </p>
  </div>

  <!-- CTA BUTTON -->
  <div style="text-align:center;padding:4px 24px 28px;">
    <a href="${APP}/plans" style="display:inline-block;background:#c9a84c;color:#1a1205;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.04em;padding:16px 48px;border-radius:50px;text-decoration:none;">
      Continuar Mi Plan →
    </a>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;padding:16px 24px 28px;border-top:1px solid rgba(255,255,255,0.07);">
    <img src="${LOGO}" alt="Veritas" width="36" height="36"
      style="border-radius:50%;border:2px solid rgba(201,168,76,0.4);display:inline-block;margin-bottom:8px;"/>
    <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.45);margin:0 0 2px;">Veritas — Plan Devocional</p>
    <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.2);margin:8px 0 0;">Enviado automáticamente · © 2026 Veritas</p>
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const progress = await base44.entities.ReadingProgress.filter({ plan_id: { $exists: true } });
    const todayProgress = (progress || []).filter(p => {
      const d = new Date(p.created_date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (todayProgress.length > 0) {
      return Response.json({ skipped: true, reason: 'User already made progress today' });
    }

    const lastPlan = (progress || []).sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
    const planName = lastPlan?.plan_id || 'Tu Plan de Lectura';

    const html = buildDevotionalReminderEmail({ name: user.full_name, planName });

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: "Veritas · The Word",
      to: user.email,
      subject: `📖 Continúa "${planName}" — El día aún no termina`,
      body: html,
    });

    return Response.json({ sent: true, plan: planName });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});