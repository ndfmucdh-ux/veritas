import { useEffect, useState } from "react";
import { DEFAULT_TRANSLATION_BY_LANG } from "@/lib/bibleData";

const read = (lang) => localStorage.getItem("veritas_translation") || DEFAULT_TRANSLATION_BY_LANG[lang] || "KJV";

// The user's default Bible; updates live when they change it or when saved preferences load.
export default function useDefaultTranslation(lang) {
  const [translation, setTranslation] = useState(() => read(lang));

  useEffect(() => {
    setTranslation(read(lang));
    const onChange = (e) => setTranslation(e.detail || read(lang));
    window.addEventListener("veritas:translation", onChange);
    return () => window.removeEventListener("veritas:translation", onChange);
  }, [lang]);

  return translation;
}