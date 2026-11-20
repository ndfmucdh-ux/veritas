// Verse of the Day: pick a verse that has not been used recently, and email it to opted-in users
// in THEIR default Bible and language. AI and email calls go through the app's integrations (integration credits).

import { renderEmail, sendBrandedEmail, readLink, heroFor, firstNameOf, appLink } from "./emailBrand.ts";
import { parseRef, readerLang, readerTranslation, translationLang } from "./bibleLocale.ts";
import { bookNameIn, fetchVerseText, textIn } from "./scripture.ts";
import type { Memo } from "./scripture.ts";

const LABELS: Record<string, Record<string, string>> = {
  en: { chip: "📖 VERSE OF THE DAY", title: "Verse of the Day", greeting: "Good morning", cta: "Open the Interactive Bible", reflection: "Today's reflection", foot: "Verse of the Day", sent: "Sent automatically each morning", locale: "en-US" },
  es: { chip: "📖 VERSÍCULO DEL DÍA", title: "Versículo del Día", greeting: "Buenos días", cta: "Abrir Biblia Interactiva", reflection: "Reflexión de hoy", foot: "Versículo del Día", sent: "Enviado automáticamente cada mañana", locale: "es-US" },
  fr: { chip: "📖 VERSET DU JOUR", title: "Verset du jour", greeting: "Bonjour", cta: "Ouvrir la Bible interactive", reflection: "Réflexion du jour", foot: "Verset du jour", sent: "Envoyé automatiquement chaque matin", locale: "fr-FR" },
  pt: { chip: "📖 VERSÍCULO DO DIA", title: "Versículo do Dia", greeting: "Bom dia", cta: "Abrir Bíblia Interativa", reflection: "Reflexão de hoje", foot: "Versículo do Dia", sent: "Enviado automaticamente toda manhã", locale: "pt-BR" },
  de: { chip: "📖 VERS DES TAGES", title: "Vers des Tages", greeting: "Guten Morgen", cta: "Interaktive Bibel öffnen", reflection: "Besinnung für heute", foot: "Vers des Tages", sent: "Jeden Morgen automatisch gesendet", locale: "de-DE" },
};

const todayKey = () => new Date().toISOString().split("T")[0];

export type { Memo };

// One finished email for one reader: their Bible's text, their language, branded layout.
export async function buildVerseEmail(base44: any, verse: any, reader: { name?: string; prefs?: any }, memo: Memo) {
  const translation = readerTranslation(reader.prefs);
  const lang = readerLang(reader.prefs);
  const L = LABELS[lang] || LABELS.en;
  const verseLang = translationLang(translation);
  const { chapter, from, to } = parseRef(verse.verse_ref, verse);

  const [text, book, reflection] = await Promise.all([
    fetchVerseText(base44, { translation, book: verse.book, chapter, from, to, baseText: verse.text, baseTranslation: verse.translation }, memo),
    bookNameIn(base44, verse.book, verseLang, translation, memo),
    textIn(base44, verse.reflection || "", lang, memo),
  ]);
  const ref = `${book} ${chapter}:${from}${to ? `-${to}` : ""}`;
  const first = firstNameOf(reader.name);
  const date = new Date().toLocaleDateString(L.locale, { weekday: "long", month: "long", day: "numeric" });

  const html = renderEmail({
    lang,
    chip: L.chip,
    hero: heroFor(verse.theme),
    title: `${L.greeting}${first ? `, ${first}` : ""}`,
    quote: text,
    quoteRef: `${ref} (${translation})`,
    paragraphs: [date],
    note: reflection ? { label: L.reflection, text: reflection } : undefined,
    cta: { label: L.cta, url: readLink(verse.book, chapter, from, translation) },
    footerTag: L.foot,
    sentLine: L.sent,
  });
  return { subject: `${L.title}: ${ref}`, html, translation, lang };
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
  // Several records can exist per person: keep the newest one (list is newest first).
  const prefByEmail = new Map<string, any>();
  for (const p of prefs || []) {
    const k = String(p.created_by || "").toLowerCase();
    if (k && !prefByEmail.has(k)) prefByEmail.set(k, p);
  }
  const sent = new Set<string>((logs || []).map((l: any) => String(l.email).toLowerCase()));

  const queue = (users || []).filter((u: any) => {
    const email = String(u.email || "").toLowerCase();
    return email && !sent.has(email) && prefByEmail.get(email)?.votd_email_enabled !== false;
  }).slice(0, maxPerRun);

  const memo: Memo = new Map();
  let ok = 0, failed = 0;
  for (let i = 0; i < queue.length; i += 5) {
    const batch = queue.slice(i, i + 5);
    const results = await Promise.allSettled(batch.map(async (u: any) => {
      const reader = { name: u.display_name || u.full_name, prefs: prefByEmail.get(String(u.email).toLowerCase()) };
      const mail = await buildVerseEmail(base44, verse, reader, memo);
      const accepted = await sendBrandedEmail(base44, { to: u.email, subject: mail.subject, html: mail.html, category: "marketing" });
      if (!accepted) throw new Error("not sent");
      await base44.asServiceRole.entities.VerseEmailLog.create({ date: today, email: u.email });
    }));
    results.forEach((r) => (r.status === "fulfilled" ? ok++ : failed++));
  }
  return { date: today, recipients: queue.length, sent: ok, failed, link: appLink("/") };
}