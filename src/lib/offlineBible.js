// Offline Bible storage using localStorage
// Keys: "offline_bible_{TRANSLATION}" → { name, lang, data, downloadedAt }

const KEY = (t) => `offline_bible_${t.toUpperCase()}`;

export const DOWNLOADABLE_TRANSLATIONS = [
  // English — via bolls.life CDN
  { code: "KJV",    name: "King James Version",           lang: "en", flag: "🇬🇧" },
  { code: "NKJV",   name: "New King James Version",       lang: "en", flag: "🇬🇧" },
  { code: "NIV",    name: "New International Version",    lang: "en", flag: "🇬🇧" },
  { code: "ESV",    name: "English Standard Version",     lang: "en", flag: "🇬🇧" },
  { code: "NLT",    name: "New Living Translation",       lang: "en", flag: "🇬🇧" },
  { code: "NASB",   name: "New American Standard Bible",  lang: "en", flag: "🇬🇧" },
  { code: "AMP",    name: "Amplified Bible",              lang: "en", flag: "🇬🇧" },
  { code: "CSB",    name: "Christian Standard Bible",     lang: "en", flag: "🇬🇧" },
  { code: "MSG",    name: "The Message",                  lang: "en", flag: "🇬🇧" },
  { code: "ASV",    name: "American Standard Version",    lang: "en", flag: "🇺🇸" },
  { code: "BBE",    name: "Bible in Basic English",       lang: "en", flag: "🇦🇺" },
  { code: "WEB",    name: "World English Bible",          lang: "en", flag: "🇺🇸" },
  { code: "BSB",    name: "Berean Standard Bible",        lang: "en", flag: "🇬🇧" },
  // Spanish — via bolls.life CDN
  { code: "RVR1960",name: "Reina-Valera 1960",            lang: "es", flag: "🇲🇽" },
  { code: "NVI",    name: "Nueva Versión Internacional",  lang: "es", flag: "🇲🇽" },
  { code: "PDDPT",  name: "Palabra de Dios para Ti",      lang: "es", flag: "🇲🇽" },
  { code: "BTX3",   name: "Biblia Textual",               lang: "es", flag: "🇲🇽" },
  { code: "RVA2015",name: "Reina Valera Actualizada 2015",lang: "es", flag: "🇲🇽" },
];

export function getDownloadedTranslations() {
  return DOWNLOADABLE_TRANSLATIONS.filter(t => {
    try {
      return !!localStorage.getItem(KEY(t.code));
    } catch {
      return false;
    }
  });
}

export function isTranslationDownloaded(code) {
  try {
    return !!localStorage.getItem(KEY(code));
  } catch {
    return false;
  }
}

export function saveTranslation(code, payload) {
  try {
    localStorage.setItem(KEY(code), JSON.stringify({
      ...payload,
      downloadedAt: new Date().toISOString(),
    }));
    return true;
  } catch (e) {
    // localStorage quota exceeded
    console.warn("Could not save offline Bible:", e.message);
    return false;
  }
}

export function removeTranslation(code) {
  try {
    localStorage.removeItem(KEY(code));
  } catch {}
}

export function getOfflineVerse(code, book, chapter) {
  try {
    const raw = localStorage.getItem(KEY(code));
    if (!raw) return null;
    const { data } = JSON.parse(raw);
    return data?.[book]?.[chapter] || null;
  } catch {
    return null;
  }
}

export function getTranslationMeta(code) {
  try {
    const raw = localStorage.getItem(KEY(code));
    if (!raw) return null;
    const { name, lang, totalChapters, downloadedAt } = JSON.parse(raw);
    return { name, lang, totalChapters, downloadedAt };
  } catch {
    return null;
  }
}