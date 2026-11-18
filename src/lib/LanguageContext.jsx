import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { detectLanguage, getDictionary, isSupported, translate } from "@/lib/i18n";

const fallbackDict = getDictionary("en");
const LangCtx = createContext({ lang: "en", t: fallbackDict, tr: (key, vars) => translate(fallbackDict, key, vars), setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage);

  const setLang = useCallback((code) => {
    if (!isSupported(code)) return;
    localStorage.setItem("veritas_lang", code);
    setLangState(code);
  }, []);

  // Keep <html lang> in sync for accessibility and correct hyphenation.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const dict = getDictionary(lang);
    return { lang, t: dict, tr: (key, vars) => translate(dict, key, vars), setLang };
  }, [lang, setLang]);

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);