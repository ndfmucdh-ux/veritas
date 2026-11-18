import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { detectLanguage, getDictionary, isSupported, translate } from "@/lib/i18n";
import { EXTRA } from "@/lib/i18nExtra";
import { PAGES } from "@/lib/i18nPages";
import { COMMUNITY } from "@/lib/i18nCommunity";
import { STAGE1 } from "@/lib/i18nStage1";
import { STAGE2 } from "@/lib/i18nStage2";
import { STAGE3 } from "@/lib/i18nStage3";
import { STAGE4 } from "@/lib/i18nStage4";
import { STAGE5 } from "@/lib/i18nStage5";
import { STAGE6 } from "@/lib/i18nStage6";
import { STAGE7 } from "@/lib/i18nStage7";
import { STAGE8 } from "@/lib/i18nStage8";
import { hydratePrefs } from "@/lib/preferencesSync";
import { getTranslationLang, DEFAULT_TRANSLATION_BY_LANG } from "@/lib/bibleData";

// Locale dictionaries (en/es/fr/pt/de) plus extra UI strings; missing keys fall back to English.
const buildDict = (lang) => ({ ...getDictionary(lang), ...EXTRA.en, ...(EXTRA[lang] || {}), ...PAGES.en, ...(PAGES[lang] || {}), ...COMMUNITY.en, ...(COMMUNITY[lang] || {}), ...STAGE1.en, ...(STAGE1[lang] || {}), ...STAGE2.en, ...(STAGE2[lang] || {}), ...STAGE3.en, ...(STAGE3[lang] || {}), ...STAGE4.en, ...(STAGE4[lang] || {}), ...STAGE5.en, ...(STAGE5[lang] || {}), ...STAGE6.en, ...(STAGE6[lang] || {}), ...STAGE7.en, ...(STAGE7[lang] || {}), ...STAGE8.en, ...(STAGE8[lang] || {}) });

const fallbackDict = buildDict("en");
const LangCtx = createContext({ lang: "en", t: fallbackDict, tr: (key, vars) => translate(fallbackDict, key, vars), setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage);

  const setLang = useCallback((code) => {
    if (!isSupported(code)) return;
    localStorage.setItem("veritas_lang", code);
    // Bible text follows the app language: switch translation if the saved one is in another language.
    const stored = localStorage.getItem("veritas_translation") || "KJV";
    if (getTranslationLang(stored) !== code) {
      const next = DEFAULT_TRANSLATION_BY_LANG[code] || "KJV";
      localStorage.setItem("veritas_translation", next);
      window.dispatchEvent(new CustomEvent("veritas:translation", { detail: next }));
    }
    setLangState(code);
    // Best-effort sync to saved preferences (signed-out visitors simply skip).
    base44.auth.isAuthenticated().then(async (ok) => {
      if (!ok) return;
      const prefs = await base44.entities.UserPreferences.list("-updated_date", 1);
      const data = { language: code, default_translation: localStorage.getItem("veritas_translation") || "KJV" };
      if (prefs?.[0]) await base44.entities.UserPreferences.update(prefs[0].id, data);
      else await base44.entities.UserPreferences.create(data);
    }).catch(() => {});
  }, []);

  // Restore saved language + Bible version + reading settings for signed-in users.
  useEffect(() => {
    hydratePrefs().then((prefs) => {
      if (!prefs) return;
      if (prefs.language && isSupported(prefs.language)) {
        localStorage.setItem("veritas_lang", prefs.language);
        setLangState(prefs.language);
      }
      if (prefs.default_translation) {
        window.dispatchEvent(new CustomEvent("veritas:translation", { detail: prefs.default_translation }));
      }
    });
  }, []);

  // Keep <html lang> in sync for accessibility and correct hyphenation.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Keep language across tabs.
  useEffect(() => {
    const onStorage = (e) => { if (e.key === "veritas_lang" && isSupported(e.newValue)) setLangState(e.newValue); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(() => {
    const dict = buildDict(lang);
    return { lang, t: dict, tr: (key, vars) => translate(dict, key, vars), setLang };
  }, [lang, setLang]);

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);