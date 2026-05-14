// Shared Veritas email template engine — matches Nacion de Fe "Main Campus" premium brand style
// Used by: sendVOTDNotification, sendReadingReminder, sendDevotionalReminder, etc.

const LOGO = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";
const APP  = "https://veritas.base44.app";

// ── Hero images by theme ──────────────────────────────────────────
export const THEME_IMAGES = {
  hope:     "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&q=80",
  faith:    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
  love:     "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80",
  peace:    "https://images.unsplash.com/photo-1439405328-88d5d2a8f36d?w=600&q=80",
  strength: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
  wisdom:   "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  grace:    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  courage:  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
  joy:      "https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=600&q=80",
  prayer:   "https://images.unsplash.com/photo-1545730344-26c5815483f2?w=600&q=80",
  default:  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
};

export function getThemeImage(theme) {
  return THEME_IMAGES[theme?.toLowerCase()] || THEME_IMAGES.default;
}

// ── Core layout builder (matches Nacion de Fe "Main Campus" card style) ──
// Sections: hero band → logo pill → chip label → verse card → optional preview → CTA → footer
export function buildVeritasEmail({
  heroImageUrl,
  chipLabel = "VERITAS · THE WORD",
  heading,           // bold italic line inside the card
  verseRef,          // gold small-caps line
  bodyLines = [],    // array of strings rendered as paragraphs
  ctaUrl = APP,
  ctaLabel = "Open in Veritas →",
  footerLine = "Veritas — La Palabra del Día",
  previewBlock,      // optional { label, text }
  date,
}) {
  const heroImg = heroImageUrl || THEME_IMAGES.default;
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const bodyHtml = bodyLines.map(line =>
    `<p style="font-family:Georgia,serif;font-size:14px;font-style:italic;color:rgba(255,255,255,0.62);line-height:1.78;margin:0 0 10px;">${line}</p>`
  ).join("");

  const previewHtml = previewBlock ? `
  <div style="margin:0 20px 20px;padding:18px 20px;background:#1a1510;border-radius:14px;border-left:3px solid rgba(201,168,76,0.45);">
    <p style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(201,168,76,0.55);margin:0 0 7px;">${previewBlock.label || "✦ Reflection"}</p>
    <p style="font-family:Georgia,serif;font-size:14px;font-style:italic;color:rgba(255,255,255,0.6);line-height:1.75;margin:0;">"${previewBlock.text}"</p>
  </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${chipLabel}</title>
</head>
<body style="margin:0;padding:0;background:#0a0805;">

<!--[if mso]><center><table width="480"><tr><td><![endif]-->
<div style="max-width:480px;margin:0 auto;background:#0a0805;font-family:Georgia,serif;">

  <!-- ══ TOP ACCENT BAND ══ -->
  <div style="width:100%;height:4px;background:linear-gradient(90deg,#7b4f1e,#c9a84c,#7b4f1e);"></div>

  <!-- ══ HERO IMAGE ══ -->
  <div style="line-height:0;position:relative;">
    <img src="${heroImg}" alt="" width="480"
      style="width:100%;max-width:480px;display:block;height:230px;object-fit:cover;object-position:center 40%;"/>
    <!-- Dark overlay gradient -->
    <div style="position:absolute;bottom:0;left:0;right:0;height:110px;background:linear-gradient(to bottom,transparent,#0a0805);"></div>
  </div>

  <!-- ══ LOGO PILL ══ -->
  <div style="background:#0a0805;text-align:center;padding:0 24px 6px;margin-top:-52px;position:relative;z-index:2;">
    <div style="display:inline-block;background:#0a0805;padding:4px;border-radius:50%;border:2px solid #c9a84c;box-shadow:0 0 30px rgba(201,168,76,0.35);">
      <img src="${LOGO}" alt="Veritas" width="72" height="72"
        style="border-radius:50%;display:block;background:#0a0805;"/>
    </div>
    <p style="font-family:Arial,sans-serif;font-size:8.5px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.22);margin:8px 0 0;">VERITAS · THE WORD</p>
  </div>

  <!-- ══ CHIP LABEL + DATE ══ -->
  <div style="text-align:center;padding:12px 24px 4px;">
    <div style="display:inline-block;background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.25);border-radius:999px;padding:5px 18px 5px;">
      <span style="font-family:Arial,sans-serif;font-size:8.5px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;">${chipLabel}</span>
    </div>
    <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.2);margin:8px 0 0;">${formattedDate}</p>
  </div>

  <!-- ══ MAIN CARD ══ -->
  <div style="margin:14px 18px 6px;background:#14100a;border-radius:18px;padding:28px 22px 24px;text-align:center;border:1px solid rgba(201,168,76,0.14);box-shadow:0 8px 40px rgba(0,0,0,0.5);">
    ${heading ? `<p style="font-family:Georgia,serif;font-size:19px;font-style:italic;font-weight:bold;color:#f0e6d0;line-height:1.75;margin:0 0 16px;">"${heading}"</p>` : ""}
    ${verseRef ? `
    <div style="width:32px;height:1px;background:#c9a84c;opacity:0.35;margin:0 auto 12px;"></div>
    <p style="font-family:Arial,sans-serif;font-size:9.5px;font-weight:bold;letter-spacing:0.2em;color:#c9a84c;margin:0 0 16px;">— ${verseRef.toUpperCase()} —</p>
    ` : ""}
    ${bodyHtml}
  </div>

  <!-- ══ OPTIONAL PREVIEW BLOCK ══ -->
  ${previewHtml}

  <!-- ══ CTA BUTTON ══ -->
  <div style="text-align:center;padding:18px 24px 24px;">
    <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#b8862e,#c9a84c,#b8862e);color:#0a0805;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:0.06em;padding:15px 52px;border-radius:50px;text-decoration:none;box-shadow:0 4px 20px rgba(201,168,76,0.3);">
      ${ctaLabel}
    </a>
  </div>

  <!-- ══ DIVIDER ══ -->
  <div style="margin:0 24px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.18),transparent);"></div>

  <!-- ══ FOOTER ══ -->
  <div style="text-align:center;padding:20px 24px 28px;">
    <img src="${LOGO}" alt="Veritas" width="28" height="28"
      style="border-radius:50%;border:1.5px solid rgba(201,168,76,0.3);display:inline-block;margin-bottom:8px;"/>
    <p style="font-family:Arial,sans-serif;font-size:10.5px;color:rgba(255,255,255,0.35);margin:0 0 2px;">${footerLine}</p>
    <p style="font-family:Arial,sans-serif;font-size:9.5px;color:rgba(255,255,255,0.15);margin:4px 0 0;">veritas.base44.app · © 2026 Veritas</p>
  </div>

  <!-- ══ BOTTOM ACCENT BAND ══ -->
  <div style="width:100%;height:3px;background:linear-gradient(90deg,#7b4f1e,#c9a84c,#7b4f1e);"></div>

</div>
<!--[if mso]></td></tr></table></center><![endif]-->

</body>
</html>`;
}

// ── Weekly digest variant ────────────────────────────────────────
export function buildWeeklyDigestEmail({ name, verses = [], weekStart }) {
  const firstName = name?.split(" ")[0] || "Beloved";
  const weekLabel = new Date(weekStart || new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const versesHtml = verses.slice(0, 7).map((v, i) => `
    <div style="border-left:2px solid #c9a84c;padding:12px 14px;margin-bottom:8px;background:rgba(201,168,76,0.04);border-radius:0 10px 10px 0;">
      <div style="font-family:Arial,sans-serif;font-size:8.5px;letter-spacing:0.18em;text-transform:uppercase;color:#c9a84c;margin-bottom:5px;">Día ${i+1}${v.theme ? ` · ${v.theme}` : ""}</div>
      <div style="font-family:Georgia,serif;font-style:italic;font-size:13.5px;color:#e8d5b0;line-height:1.62;margin-bottom:4px;">"${(v.text||"").slice(0,110)}${(v.text||"").length > 110 ? "…" : ""}"</div>
      <div style="font-family:Arial,sans-serif;font-size:9.5px;color:rgba(255,255,255,0.3);">— ${(v.verse_ref||"").toUpperCase()}</div>
    </div>`).join("");

  return buildVeritasEmail({
    heroImageUrl: THEME_IMAGES.grace,
    chipLabel: "📖 RESUMEN SEMANAL",
    heading: `${firstName}, tu semana en la Palabra`,
    verseRef: `Semana del ${weekLabel}`,
    bodyLines: verses.length ? [] : ["Comienza a leer cada día para ver tu resumen semanal aquí."],
    ctaUrl: APP,
    ctaLabel: "Abrir Veritas →",
    footerLine: "Veritas — Resumen Semanal",
  }).replace(
    // inject the verses list right before the CTA
    '<div style="text-align:center;padding:18px 24px 24px;">',
    `<div style="margin:0 18px 16px;">${versesHtml}</div><div style="text-align:center;padding:18px 24px 24px;">`
  );
}

// Deno HTTP handler (needed so this file can be deployed as a backend function)
Deno.serve(() => Response.json({ ok: true, info: "Email template engine — not a public endpoint." }));