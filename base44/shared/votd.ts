// Verse of the Day: pick a verse that has not been used recently, and email it to opted-in users.
// AI and email calls go through the app's integrations, so they use integration credits.

const APP_URL = "https://veritas-hub.base44.app";

const LABELS: Record<string, Record<string, string>> = {
  en: { title: "Verse of the Day", greeting: "Good morning", cta: "Read today's verse", unsub: "Unsubscribe" },
  es: { title: "Versículo del Día", greeting: "Buenos días", cta: "Leer el versículo de hoy", unsub: "Cancelar suscripción" },
  fr: { title: "Verset du jour", greeting: "Bonjour", cta: "Lire le verset du jour", unsub: "Se désabonner" },
  pt: { title: "Versículo do Dia", greeting: "Bom dia", cta: "Ler o versículo de hoje", unsub: "Cancelar inscrição" },
  de: { title: "Vers des Tages", greeting: "Guten Morgen", cta: "Heutigen Vers lesen", unsub: "Abmelden" },
};

const todayKey = () => new Date().toISOString().split("T")[0];

const esc = (s: string) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Email-safe HTML in the app's brand (header band, serif verse card, one button).
function buildEmailHtml(v: Record<string, string>) {
  const font = "'Playfair Display', Georgia, 'Times New Roman', serif";
  const head = "Cinzel, Georgia, 'Times New Roman', serif";
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(v.title_label)}: ${esc(v.verse_ref)}</title></head>
<body style="margin:0;padding:0;background:#080c16;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080c16;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;font-family:${font};">
<tr><td align="center" style="background:#fbbf24;padding:22px 36px;"><img src="https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/fd35789be_IMG_1831.jpeg" alt="Veritas" width="36" style="display:block;margin:0 auto 10px;"><div style="font-family:${head};font-size:12px;letter-spacing:4px;font-weight:700;text-transform:uppercase;color:#000000;">Veritas</div></td></tr>
<tr><td style="background:#fbbf24;padding:34px 36px;"><div style="font-family:${head};font-size:32px;line-height:1.1;font-weight:700;color:#000000;">${esc(v.greeting)}, ${esc(v.first_name)}</div><div style="font-size:14px;color:#000000;margin-top:10px;">${esc(v.title_label)} · ${esc(v.date_label)}</div></td></tr>
<tr><td style="padding:32px 36px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1b1a17;"><tr><td style="padding:26px 24px 8px;font-size:21px;line-height:1.5;font-style:italic;color:#ffffff;">"${esc(v.verse_text)}"</td></tr><tr><td style="padding:0 24px 26px;font-family:${head};font-size:14px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:#fbbf24;">${esc(v.verse_ref)}</td></tr></table></td></tr>
<tr><td style="padding:12px 36px 8px;font-size:16px;line-height:1.65;color:#a78bfa;">${esc(v.reflection)}</td></tr>
<tr><td style="padding:20px 36px 36px;"><a href="${v.cta_url}" style="display:inline-block;background:#fbbf24;color:#000000;font-family:${font};font-size:15px;font-weight:700;padding:14px 28px;text-decoration:none;">${esc(v.cta_label)}</a></td></tr>
<tr><td align="center" style="background:#fbbf24;padding:24px 36px;"><div style="font-family:${head};font-size:18px;font-weight:700;color:#000000;margin-bottom:8px;">Veritas</div><a href="${APP_URL}/profile" style="font-size:12px;color:#000000;text-decoration:underline;">${esc(v.unsubscribe_label)}</a></td></tr>
</table></td></tr></table></body></html>`;
}

export async function ensureTodayVerse(base44: any) {
  const today = todayKey();
  const existing = await base44.asServiceRole.entities.DailyVerse.filter({ date: today });
  if (existing?.length) return existing[0];

  const recent = await base44.asServiceRole.entities.DailyVerse.list("-date", 150);
  const used = new Set<string>((recent || []).map((v: any) => String(v.verse_ref || "").toLowerCase()));
  const themes = ["faith", "hope", "love", "strength", "peace", "wisdom", "courage", "grace", "purpose", "joy", "forgiveness", "trust"];
  const theme = themes[Math.floor(Date.now() / 86400000) % themes.length];

  let picked: any = null;
  for (let attempt = 0; attempt < 3 && !picked; attempt++) {
    const avoid = [...used].slice(0, 150).join("; ");
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Today is ${today}. Choose one encouraging Bible verse for "Verse of the Day" from the King James Version, on the theme "${theme}".
Do NOT use any of these recently used references: ${avoid || "none"}.
Return the exact KJV text. The reflection is 2-3 warm sentences. In the reflection always say "Father" instead of "God" and "Sacred Scriptures" instead of "Bible" (never change the verse text itself).`,
      response_json_schema: {
        type: "object",
        properties: {
          ref: { type: "string" }, book: { type: "string" }, chapter: { type: "number" }, verse: { type: "number" },
          text: { type: "string" }, reflection: { type: "string" }, theme: { type: "string" },
        },
      },
    });
    const ref = String(result?.ref || "").toLowerCase();
    if (ref && result?.text && !used.has(ref)) picked = result;
    else if (ref) used.add(ref);
  }
  if (!picked) throw new Error("Could not pick a new verse for today");

  await base44.asServiceRole.entities.DailyVerse.create({
    date: today, verse_ref: picked.ref, book: picked.book, chapter: Number(picked.chapter), verse: Number(picked.verse),
    translation: "KJV", text: picked.text, reflection: picked.reflection, theme: picked.theme || theme,
  });

  // Two visitors can race to create the same day: keep the first, remove the rest.
  const all = await base44.asServiceRole.entities.DailyVerse.filter({ date: today }, "created_date");
  for (const extra of all.slice(1)) await base44.asServiceRole.entities.DailyVerse.delete(extra.id);
  return all[0];
}

export async function sendVerseEmails(base44: any, verse: any, maxPerRun = 150) {
  const today = todayKey();
  const [users, prefs, logs] = await Promise.all([
    base44.asServiceRole.entities.User.list("-created_date", 1000),
    base44.asServiceRole.entities.UserPreferences.list("-updated_date", 1000),
    base44.asServiceRole.entities.VerseEmailLog.filter({ date: today }, "-created_date", 1000),
  ]);
  const prefByEmail = new Map<string, any>((prefs || []).map((p: any) => [String(p.created_by || "").toLowerCase(), p]));
  const sent = new Set<string>((logs || []).map((l: any) => String(l.email).toLowerCase()));

  const queue = (users || []).filter((u: any) => {
    const email = String(u.email || "").toLowerCase();
    return email && !sent.has(email) && prefByEmail.get(email)?.votd_email_enabled !== false;
  }).slice(0, maxPerRun);

  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const ctaUrl = `${APP_URL}/read?book=${encodeURIComponent(verse.book || "John")}&chapter=${verse.chapter || 1}`;
  let ok = 0, failed = 0;

  for (let i = 0; i < queue.length; i += 5) {
    const batch = queue.slice(i, i + 5);
    const results = await Promise.allSettled(batch.map(async (u: any) => {
      const lang = prefByEmail.get(String(u.email).toLowerCase())?.language;
      const L = LABELS[lang] || LABELS.en;
      const html = buildEmailHtml({
        first_name: String(u.full_name || "").split(" ")[0] || "friend",
        greeting: L.greeting, title_label: L.title, date_label: dateLabel,
        verse_ref: verse.verse_ref, verse_text: verse.text, reflection: verse.reflection || "",
        cta_label: L.cta, cta_url: ctaUrl, unsubscribe_label: L.unsub,
      });
      const res = await base44.asServiceRole.integrations.Core.SendEmail({
        to: u.email, from_name: "Veritas", subject: `${L.title}: ${verse.verse_ref}`, html, category: "marketing",
      });
      if (res?.success === false) throw new Error(res.reason || "not sent");
      await base44.asServiceRole.entities.VerseEmailLog.create({ date: today, email: u.email });
    }));
    results.forEach((r) => (r.status === "fulfilled" ? ok++ : failed++));
  }
  return { date: today, recipients: queue.length, sent: ok, failed };
}