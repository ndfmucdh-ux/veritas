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
  // English (20 versions)
  { code: "KJV",    name: "King James Version",           lang: "en", flag: "🇬🇧" },
  { code: "NKJV",   name: "New King James Version",       lang: "en", flag: "🇬🇧" },
  { code: "NIV",    name: "New International Version",    lang: "en", flag: "🇬🇧" },
  { code: "ESV",    name: "English Standard Version",     lang: "en", flag: "🇬🇧" },
  { code: "NLT",    name: "New Living Translation",       lang: "en", flag: "🇬🇧" },
  { code: "NASB",   name: "New American Standard Bible",  lang: "en", flag: "🇬🇧" },
  { code: "AMP",    name: "Amplified Bible",              lang: "en", flag: "🇬🇧" },
  { code: "CSB",    name: "Christian Standard Bible",     lang: "en", flag: "🇬🇧" },
  { code: "MSG",    name: "The Message",                  lang: "en", flag: "🇬🇧" },
  { code: "NRSV",   name: "New Revised Standard Version", lang: "en", flag: "🇬🇧" },
  { code: "ASV",    name: "American Standard Version",    lang: "en", flag: "🇬🇧" },
  { code: "WEB",    name: "World English Bible",          lang: "en", flag: "🇬🇧" },
  { code: "BSB",    name: "Berean Standard Bible",        lang: "en", flag: "🇬🇧" },
  { code: "YLT",    name: "Young's Literal Translation",  lang: "en", flag: "🇬🇧" },
  { code: "ERV",    name: "English Revised Version",      lang: "en", flag: "🇬🇧" },
  { code: "GNV",    name: "Geneva Bible",                 lang: "en", flag: "🇬🇧" },
  { code: "AKJV",   name: "American King James Version",  lang: "en", flag: "🇬🇧" },
  { code: "HCSB",   name: "Holman CSB",                   lang: "en", flag: "🇬🇧" },
  { code: "ICB",    name: "Interlinear Code Bible",       lang: "en", flag: "🇬🇧" },
  { code: "OEB",    name: "Open English Bible",           lang: "en", flag: "🇬🇧" },
  
  // Spanish (11 versions)
  { code: "RVR1960",name: "Reina-Valera 1960",            lang: "es", flag: "🇪🇸" },
  { code: "NVI",    name: "Nueva Versión Internacional",  lang: "es", flag: "🇪🇸" },
  { code: "LBLA",   name: "Biblia de las Américas",       lang: "es", flag: "🇪🇸" },
  { code: "BTX3",   name: "Biblia Textual",               lang: "es", flag: "🇪🇸" },
  { code: "TLA",    name: "Traducción en Lenguaje Actual",lang: "es", flag: "🇪🇸" },
  { code: "DHH",    name: "Dios Habla Hoy",               lang: "es", flag: "🇪🇸" },
  { code: "NTV",    name: "Nueva Traducción Viviente",    lang: "es", flag: "🇪🇸" },
  { code: "BLS",    name: "Biblia en Lenguaje Sencillo",  lang: "es", flag: "🇪🇸" },
  { code: "RVR2020",name: "Reina-Valera 2020",            lang: "es", flag: "🇪🇸" },
  { code: "PDT",    name: "Palabra de Dios para Ti",      lang: "es", flag: "🇪🇸" },
  { code: "PDDPT",  name: "Palabra de Dios para Todos",   lang: "es", flag: "🇪🇸" },
  
  // Portuguese (5 versions)
  { code: "ARA",    name: "Almeida Revisada Atualizada",  lang: "pt", flag: "🇧🇷" },
  { code: "ARC",    name: "Almeida Revisada Clássica",    lang: "pt", flag: "🇧🇷" },
  { code: "NVT",    name: "Nova Versão Transformadora",   lang: "pt", flag: "🇧🇷" },
  { code: "BPT",    name: "Bíblia Português",             lang: "pt", flag: "🇧🇷" },
  { code: "BRA",    name: "Biblia Reina-Valera Atualizada", lang: "pt", flag: "🇧🇷" },
  
  // French (6 versions)
  { code: "LSG",    name: "Louis Segond 1910",            lang: "fr", flag: "🇫🇷" },
  { code: "NEG1979",name: "Nouvelle Edition Genève 1979",  lang: "fr", flag: "🇫🇷" },
  { code: "BDS",    name: "Bible du Semeur",              lang: "fr", flag: "🇫🇷" },
  { code: "SG21",   name: "Segond 21",                    lang: "fr", flag: "🇫🇷" },
  { code: "FC97",   name: "Français Courant 1997",        lang: "fr", flag: "🇫🇷" },
  { code: "PdV",    name: "Parole de Vie",                lang: "fr", flag: "🇫🇷" },
  
  // Italian (4 versions)
  { code: "DIOD",   name: "Bibbia Diodati",               lang: "it", flag: "🇮🇹" },
  { code: "NRV",    name: "Nuova Riveduta 2006",          lang: "it", flag: "🇮🇹" },
  { code: "CEI",    name: "CEI Conferenza Episcopale",    lang: "it", flag: "🇮🇹" },
  { code: "NBDC",   name: "Nuova Bibbia dei Commentari",  lang: "it", flag: "🇮🇹" },
  
  // German (5 versions)
  { code: "LUT",    name: "Lutherbibel 2017",             lang: "de", flag: "🇩🇪" },
  { code: "ELB",    name: "Elberfelder Bibel",            lang: "de", flag: "🇩🇪" },
  { code: "ZB",     name: "Zürcher Bibel",                lang: "de", flag: "🇩🇪" },
  { code: "HFA",    name: "Hoffnung für Alle",            lang: "de", flag: "🇩🇪" },
  { code: "SCH2000",name: "Schlachter 2000",              lang: "de", flag: "🇩🇪" },
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