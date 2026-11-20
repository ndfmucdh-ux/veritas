import { savePrefs } from "@/lib/preferencesSync";

// The user explicitly picks their default Bible (any language). It is kept on their account, drives the
// reader, Verse of the Day, Morning Inspiration and emails, and is never overridden by changing the app language.
export function chooseTranslation(code) {
  if (!code) return;
  localStorage.setItem("veritas_translation", code);
  localStorage.setItem("veritas_translation_chosen", "1");
  window.dispatchEvent(new CustomEvent("veritas:translation", { detail: code }));
  savePrefs({ default_translation: code, translation_chosen: true });
}