import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { getTranslationLang, translateVerseRef } from "@/lib/bibleData";

const FALLBACK = {
  verse_ref: "1 Peter 5:7", book: "1 Peter", chapter: 5, verse: 7,
  text: "Cast all your anxiety on him because he cares for you.",
  reflection: "You are carried. Bring today's worries to Him, one by one.",
};
const LANG_NAMES = { es: "Spanish", fr: "French", pt: "Portuguese", de: "German", it: "Italian" };

// Verse numbers a reference covers, e.g. "Romans 8:38-39" -> [38, 39]
const verseNumbers = (base) => {
  const m = String(base.verse_ref || "").match(/:(\d+)(?:\s*[-–]\s*(\d+))?\s*$/);
  const from = m ? Number(m[1]) : Number(base.verse);
  const to = m?.[2] ? Number(m[2]) : from;
  return { from, to };
};

// Verse of the Day in the user's default Bible: text from that Bible, the reference named in its language,
// and the reflection translated into the app language (cached per day, Bible and language).
async function localize(base, lang, translation) {
  if (translation === "KJV" && lang === "en") return base;
  const key = `veritas_votd_${base.date || "x"}_${base.verse_ref}_${translation}_${lang}`;
  try { const c = JSON.parse(localStorage.getItem(key)); if (c?.text) return c; } catch { /* no cache */ }

  const verseLang = getTranslationLang(translation);
  let text = base.text;
  let found = translation === "KJV";
  if (!found && base.book && base.chapter) {
    const { from, to } = verseNumbers(base);
    const res = await base44.functions.invoke("getChapter", { translation, book: base.book, chapter: base.chapter });
    const rows = (res.data?.verses || []).filter((v) => Number(v.verse) >= from && Number(v.verse) <= to).sort((a, b) => a.verse - b.verse);
    const joined = rows.map((v) => String(v.text).trim()).join(" ").trim();
    if (joined) { text = joined; found = true; }
  }

  let reflection = base.reflection;
  const needLLM = (lang !== "en" && reflection) || (!found && LANG_NAMES[verseLang]);
  if (needLLM) {
    const out = await base44.integrations.Core.InvokeLLM({
      prompt: [
        lang !== "en" && reflection ? `Translate this reflection into ${LANG_NAMES[lang]}, keeping the warm tone:\n${reflection}` : "",
        !found && LANG_NAMES[verseLang] ? `Also give this Bible verse in a standard ${LANG_NAMES[verseLang]} Bible wording:\n${base.text}` : "",
      ].filter(Boolean).join("\n\n"),
      response_json_schema: { type: "object", properties: { reflection: { type: "string" }, verse_text: { type: "string" } } },
    });
    if (lang !== "en") reflection = out?.reflection || reflection;
    if (!found && out?.verse_text) { text = out.verse_text; found = true; }
  }

  const result = { ...base, text, reflection, verse_ref: translateVerseRef(base.verse_ref, verseLang) };
  if (found) localStorage.setItem(key, JSON.stringify(result));
  return result;
}

export default function useLocalizedVotd(lang, translation = "KJV") {
  const [base, setBase] = useState(null);
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke("getVerseOfTheDay", {})
      .then((res) => {
        const d = res.data?.dailyVerse || res.data;
        setBase({ date: d?.date, verse_ref: d?.verse_ref || d?.ref, book: d?.book, chapter: d?.chapter, verse: d?.verse, text: d?.text, reflection: d?.reflection });
      })
      .catch(() => setBase(FALLBACK));
  }, []);

  useEffect(() => {
    if (!base) return;
    let cancelled = false;
    setLoading(true);
    localize(base, lang, translation)
      .catch(() => base)
      .then((v) => { if (!cancelled) { setVerse(v); setLoading(false); } });
    return () => { cancelled = true; };
  }, [base, lang, translation]);

  return { verse, loading, base };
}