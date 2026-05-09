// Offline Bible storage using IndexedDB (much larger quota than localStorage)
// Falls back to localStorage for metadata only.

const DB_NAME = "veritas_offline_bible";
const DB_VERSION = 1;
const STORE = "translations";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "code" });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

export const DOWNLOADABLE_TRANSLATIONS = [
  // English (most popular)
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
  { code: "YLT",    name: "Young's Literal Translation",  lang: "en", flag: "🇬🇧" },
  { code: "DARBY",  name: "Darby Translation",            lang: "en", flag: "🇬🇧" },
  { code: "WNT",    name: "Weymouth New Testament",       lang: "en", flag: "🇬🇧" },
  // Spanish
  { code: "RVR1960",name: "Reina-Valera 1960",            lang: "es", flag: "🇲🇽" },
  { code: "NVI",    name: "Nueva Versión Internacional",  lang: "es", flag: "🇲🇽" },
  { code: "PDDPT",  name: "Palabra de Dios para Ti",      lang: "es", flag: "🇲🇽" },
  { code: "BTX3",   name: "Biblia Textual",               lang: "es", flag: "🇲🇽" },
  { code: "RVA2015",name: "Reina Valera Actualizada 2015",lang: "es", flag: "🇲🇽" },
  { code: "LBLA",   name: "Biblia de las Américas",       lang: "es", flag: "🇲🇽" },
  { code: "NTV",    name: "Nueva Traducción Viviente",    lang: "es", flag: "🇲🇽" },
  // Portuguese
  { code: "ARA",    name: "Almeida Revisada Atualizada",  lang: "pt", flag: "🇧🇷" },
  { code: "ARC",    name: "Almeida Revisada Clássica",    lang: "pt", flag: "🇧🇷" },
  { code: "NVT",    name: "Nova Versão Transformadora",   lang: "pt", flag: "🇧🇷" },
  // French
  { code: "LSG",    name: "Louis Segond 1910",            lang: "fr", flag: "🇫🇷" },
  { code: "NEG1979",name: "Nouvelle Edition Genève 1979", lang: "fr", flag: "🇫🇷" },
  { code: "BDS",    name: "Bible du Semeur",              lang: "fr", flag: "🇫🇷" },
  // Italian
  { code: "DIOD",   name: "Bibbia Diodati",               lang: "it", flag: "🇮🇹" },
  { code: "NRV",    name: "Nuova Riveduta 2006",          lang: "it", flag: "🇮🇹" },
];

// ── Async IndexedDB operations ────────────────────────────────────────────

export async function saveTranslationAsync(code, payload) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({
        code: code.toUpperCase(),
        ...payload,
        downloadedAt: new Date().toISOString(),
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (e) {
    console.warn("IndexedDB save failed:", e);
    return false;
  }
}

export async function removeTranslationAsync(code) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(code.toUpperCase());
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

export async function getOfflineVerseAsync(code, book, chapter) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(code.toUpperCase());
      req.onsuccess = () => {
        const record = req.result;
        resolve(record?.data?.[book]?.[chapter] || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function isTranslationDownloadedAsync(code) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getKey(code.toUpperCase());
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function getTranslationMetaAsync(code) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(code.toUpperCase());
      req.onsuccess = () => {
        const r = req.result;
        if (!r) return resolve(null);
        resolve({ name: r.name, lang: r.lang, totalChapters: r.totalChapters, downloadedAt: r.downloadedAt });
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function getAllDownloadedCodesAsync() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAllKeys();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

// ── Sync shims for backward compatibility (used in Read.jsx) ──────────────
// These are kept synchronous but delegate to a cached in-memory map seeded at startup.

const _memCache = {}; // code → { data, name, lang, totalChapters, downloadedAt }

// Call once on app boot to warm the memory cache from IDB
export async function warmOfflineCache() {
  try {
    const db = await openDB();
    const all = await new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
    all.forEach(r => { _memCache[r.code] = r; });
  } catch {}
}

export function getOfflineVerse(code, book, chapter) {
  const r = _memCache[code?.toUpperCase()];
  return r?.data?.[book]?.[chapter] || null;
}

export function isTranslationDownloaded(code) {
  return !!_memCache[code?.toUpperCase()];
}

export function getTranslationMeta(code) {
  const r = _memCache[code?.toUpperCase()];
  if (!r) return null;
  return { name: r.name, lang: r.lang, totalChapters: r.totalChapters, downloadedAt: r.downloadedAt };
}

// Alias for components that still import the old sync save
export function saveTranslation(code, payload) {
  // Fire-and-forget async save; also update mem cache immediately
  const record = { code: code.toUpperCase(), ...payload, downloadedAt: new Date().toISOString() };
  _memCache[code.toUpperCase()] = record;
  saveTranslationAsync(code, payload);
  return true; // always optimistic
}

export function removeTranslation(code) {
  delete _memCache[code?.toUpperCase()];
  removeTranslationAsync(code);
}