// Looking up Bible text and book names in a reader's own Bible version, for emails and reminders.
import { LANG_NAME, translationLang } from "./bibleLocale.ts";

// Pieces looked up during one run are remembered, so each Bible version / language is fetched once, not once per person.
export type Memo = Map<string, any>;

export async function memoized<T>(memo: Memo, key: string, make: () => Promise<T>): Promise<T | null> {
  if (!memo.has(key)) memo.set(key, make().catch(() => null));
  return (await memo.get(key)) as T | null;
}

// Verse text in the reader's Bible. If that Bible has no text for it, an AI rendering in the same language is used.
export async function fetchVerseText(base44: any, o: {
  translation: string; book: string; chapter: number; from: number; to?: number | null;
  baseText?: string; baseTranslation?: string;
}, memo: Memo): Promise<string> {
  const key = `text|${o.translation}|${o.book}|${o.chapter}|${o.from}|${o.to || ""}`;
  const text = await memoized<string>(memo, key, async () => {
    if (o.baseText && o.translation === (o.baseTranslation || "KJV")) return o.baseText;
    const res = await base44.asServiceRole.functions.invoke("getChapter", { translation: o.translation, book: o.book, chapter: o.chapter });
    const rows = res?.data?.verses || res?.verses || [];
    const picked = rows
      .filter((r: any) => Number(r.verse) >= o.from && Number(r.verse) <= (o.to || o.from))
      .sort((a: any, b: any) => a.verse - b.verse);
    const joined = picked.map((r: any) => String(r.text || "").replace(/[°†‡*]/g, "").trim()).join(" ").replace(/\s{2,}/g, " ").trim();
    if (joined) return joined;
    const lang = translationLang(o.translation);
    const out = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Give ${o.book} ${o.chapter}:${o.from}${o.to ? `-${o.to}` : ""} from a standard ${LANG_NAME[lang] || "English"} Bible (${o.translation}). Return only the verse text.`,
      response_json_schema: { type: "object", properties: { text: { type: "string" } } },
    });
    return out?.text || o.baseText || "";
  });
  return text || o.baseText || "";
}

// "2 Corinthians" -> "2 Corintios" (named as in that language's Bible).
export async function bookNameIn(base44: any, book: string, lang: string, translation: string, memo: Memo): Promise<string> {
  if (lang === "en" || !book) return book;
  const name = await memoized<string>(memo, `book|${lang}|${book}`, async () => {
    const out = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `How is the Bible book "${book}" named in the ${LANG_NAME[lang]} Bible ${translation}? Return only the book name, e.g. "2 Corintios".`,
      response_json_schema: { type: "object", properties: { name: { type: "string" } } },
    });
    return out?.name || book;
  });
  return name || book;
}

// A verse given as an English reference ("Psalm 119:105"), returned in the reader's Bible with a localized reference.
export async function verseByRef(base44: any, ref: string, translation: string, memo: Memo) {
  const m = String(ref).trim().match(/^(.+?)\s+(\d+):(\d+)(?:\s*[-–]\s*(\d+))?$/);
  if (!m) return null;
  let book = m[1].toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bOf\b/, "of");
  if (book === "Psalm") book = "Psalms";
  const chapter = Number(m[2]), from = Number(m[3]), to = m[4] ? Number(m[4]) : undefined;
  const [text, name] = await Promise.all([
    fetchVerseText(base44, { translation, book, chapter, from, to }, memo),
    bookNameIn(base44, book, translationLang(translation), translation, memo),
  ]);
  return { text, ref: `${name} ${chapter}:${from}${to ? `-${to}` : ""} (${translation})`, book, chapter, from };
}

export async function textIn(base44: any, text: string, lang: string, memo: Memo): Promise<string> {
  if (!text || lang === "en") return text || "";
  const out = await memoized<string>(memo, `tr|${lang}|${text.slice(0, 60)}`, async () => {
    const r = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Translate into ${LANG_NAME[lang]}, keeping the warm tone. Return only the translation.\n\n${text}`,
      response_json_schema: { type: "object", properties: { text: { type: "string" } } },
    });
    return r?.text || text;
  });
  return out || text;
}