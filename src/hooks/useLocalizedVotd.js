import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DEFAULT_TRANSLATION_BY_LANG, translateVerseRef } from "@/lib/bibleData";

const FALLBACK = {
  verse_ref: "1 Peter 5:7", book: "1 Peter", chapter: 5, verse: 7,
  text: "Cast all your anxiety on him because he cares for you.",
  reflection: "You are carried. Bring today's worries to Him, one by one.",
};
const LANG_NAMES = { es: "Spanish", fr: "French", pt: "Portuguese", de: "German" };

// Verse of the Day in the app language: text from that language's Bible translation,
// localized reference, and a translated reflection (cached per day and language).
async function localize(base, lang) {
  if (lang === "en" || !LANG_NAMES[lang]) return base;
  const key = `veritas_votd_${base.date || "x"}_${base.verse_ref}_${lang}`;
  try { const c = JSON.parse(localStorage.getItem(key)); if (c?.text) return c; } catch { /* no cache */ }

  const translation = DEFAULT_TRANSLATION_BY_LANG[lang];
  let text = null;
  if (base.book && base.chapter && base.verse) {
    const res = await base44.functions.invoke("getChapter", { translation, book: base.book, chapter: base.chapter });
    text = res.data?.verses?.find((v) => Number(v.verse) === Number(base.verse))?.text || null;
  }
  let reflection = base.reflection;
  if (reflection) {
    const out = await base44.integrations.Core.InvokeLLM({
      prompt: `Translate into ${LANG_NAMES[lang]}, keeping the warm tone. Return only the translation.\n\n${reflection}`
        + (text ? "" : `\n\nAlso translate this Bible verse using a standard ${LANG_NAMES[lang]} Bible wording:\n${base.text}`),
      response_json_schema: { type: "object", properties: { reflection: { type: "string" }, verse_text: { type: "string" } } },
    });
    reflection = out?.reflection || reflection;
    text = text || out?.verse_text || null;
  }
  const result = { ...base, text: text || base.text, reflection, verse_ref: translateVerseRef(base.verse_ref, lang) };
  if (text) localStorage.setItem(key, JSON.stringify(result));
  return result;
}

export default function useLocalizedVotd(lang) {
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
    localize(base, lang)
      .catch(() => base)
      .then((v) => { if (!cancelled) { setVerse(v); setLoading(false); } });
    return () => { cancelled = true; };
  }, [base, lang]);

  return { verse, loading, base };
}