import en from "./locales/en";
import es from "./locales/es";
import fr from "./locales/fr";
import pt from "./locales/pt";
import de from "./locales/de";

/** Supported app languages. `label` is always written in the language itself. */
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "de", label: "Deutsch" },
];

const DICTS = { en, es, fr, pt, de };
export const isSupported = (code) => Object.prototype.hasOwnProperty.call(DICTS, code);

/** Picks the saved language, then the browser language, then English. */
export function detectLanguage() {
  const saved = localStorage.getItem("veritas_lang");
  if (saved && isSupported(saved)) return saved;
  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  return isSupported(browser) ? browser : "en";
}

/** Dictionary for a language; any missing key falls back to English. */
export const getDictionary = (lang) => ({ ...en, ...(DICTS[lang] || {}) });

/** Looks up a key and fills {placeholders}. Unknown keys return the key itself. */
export function translate(dict, key, vars) {
  const value = dict[key];
  if (typeof value !== "string") return value ?? key;
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, name) => (vars[name] ?? `{${name}}`));
}