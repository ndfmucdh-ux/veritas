// One reminder email for one person: what it should say right now, and the finished branded email.
import { renderEmail, appLink, readLink, heroFor, firstNameOf } from "./emailBrand.ts";
import { localNow, readerLang, readerTranslation, translationLang } from "./bibleLocale.ts";
import { bookNameIn, fetchVerseText } from "./scripture.ts";
import type { Memo } from "./scripture.ts";
import { REMINDER_VERSE, TEXT } from "./reminderText.ts";
import type { Kind } from "./reminderText.ts";

const STREAK_LABEL: Record<string, string> = { en: "day streak", es: "días de racha", fr: "jours de série", pt: "dias de sequência", de: "Tage in Folge" };

export type Context = { skip?: boolean; url?: string; lines?: string[]; summary?: string; streak?: number };

// What a reminder should say for this person right now, or skip: true when it would be pointless.
export async function reminderContext(base44: any, kind: Kind, email: string, tz: string): Promise<Context> {
  const db = base44.asServiceRole.entities;
  const today = localNow(tz).date;
  const sameDay = (ts?: string) => !!ts && localNow(tz, new Date(ts)).date === today;

  if (kind === "streak" || kind === "scripture") {
    const [last] = await db.ReadingProgress.filter({ created_by: email }, "-completed_at", 1);
    if (sameDay(last?.completed_at || last?.created_date)) return { skip: true };
    const book = last?.book || "John";
    const chapter = Number(last?.chapter) || 1;
    const url = readLink(book, chapter);
    if (kind === "scripture") return { url, lines: [`${book} ${chapter}`] };
    const [xp] = await db.UserXP.filter({ created_by: email }, "-updated_date", 1);
    return { url, streak: Number(xp?.streak_days || 0) };
  }

  if (kind === "prayer") {
    const [last] = await db.PrayerJournal.filter({ created_by: email }, "-created_date", 1);
    if (sameDay(last?.created_date)) return { skip: true };
    return { url: appLink("/prayer-journal") };
  }

  // followup: audio left unfinished, then a reading plan still in progress
  const audio = await db.BibleAudioProgress.filter({ created_by: email, completed: false }, "-updated_date", 1);
  if (audio?.[0]) {
    const a = audio[0];
    return { url: readLink(a.book, a.chapter, undefined, a.translation), lines: [`${a.book} ${a.chapter}`], summary: `${a.book} ${a.chapter}` };
  }
  const plans = await db.CustomPlan.filter({ created_by: email }, "-updated_date", 5);
  const open = (plans || []).find((p: any) => Number(p.total_chapters || 0) > Number(p.completed_count || 0));
  if (open) return { url: appLink("/plans"), lines: [open.title], summary: open.title };
  return { skip: true };
}

export async function buildReminderEmail(base44: any, kind: Kind, user: any, pref: any, ctx: Context, memo: Memo) {
  const lang = readerLang(pref);
  const translation = readerTranslation(pref);
  const T = (TEXT[lang] || TEXT.en)[kind];
  const first = firstNameOf(user.display_name || user.full_name);
  const v = REMINDER_VERSE[kind];
  const [text, book] = await Promise.all([
    fetchVerseText(base44, { translation, book: v.book, chapter: v.chapter, from: v.from, to: v.to }, memo),
    bookNameIn(base44, v.book, translationLang(translation), translation, memo),
  ]);
  const html = renderEmail({
    lang,
    chip: T.chip,
    hero: heroFor(kind === "prayer" ? "prayer" : kind === "streak" ? "strength" : "hope"),
    title: first ? `${T.hello}, ${first}` : T.hello,
    quote: text,
    quoteRef: `${book} ${v.chapter}:${v.from}${v.to ? `-${v.to}` : ""} (${translation})`,
    paragraphs: [T.line, ...(ctx.lines || [])],
    stats: ctx.streak ? [{ label: STREAK_LABEL[lang] || STREAK_LABEL.en, value: ctx.streak }] : undefined,
    cta: { label: T.cta, url: ctx.url || appLink("/") },
    footerTag: T.foot,
  });
  return { subject: T.push, html, pushTitle: first ? `${T.push}, ${first}` : T.push, pushBody: ctx.summary || T.line, url: ctx.url || appLink("/") };
}