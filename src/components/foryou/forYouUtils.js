import { useState, useEffect, useCallback } from "react";
import { getTranslatedBookName } from "@/lib/bibleData";

// "1 Corinthians 13:4-7" -> { book, chapter, verse, cv }
export function parseRef(ref) {
  const i = ref.lastIndexOf(" ");
  const cv = ref.slice(i + 1);
  const [c, v] = cv.split(":");
  return { book: ref.slice(0, i), chapter: Number(c), verse: v ? Number(v.split("-")[0]) : null, cv };
}

export const localRef = (ref, lang) => {
  const { book, cv } = parseRef(ref);
  return `${getTranslatedBookName(book, lang)} ${cv}`;
};

export const readHref = (ref) => {
  const { book, chapter } = parseRef(ref);
  return `/read?book=${encodeURIComponent(book)}&chapter=${chapter}`;
};

export const prayHref = (ref) => `/prayer-journal?new=${encodeURIComponent(ref)}`;

// Themes the reader has practiced, remembered per category on this device.
export function useForYouProgress(category) {
  const storageKey = `veritas_foryou_${category}`;
  const [done, setDone] = useState([]);

  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(storageKey)) || []); } catch { setDone([]); }
  }, [storageKey]);

  const toggle = useCallback((i) => {
    setDone((prev) => {
      const next = prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  return [done, toggle];
}