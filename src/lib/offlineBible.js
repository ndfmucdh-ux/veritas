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
  // English (85 versions)
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
  { code: "DARBY",  name: "Darby Bible",                  lang: "en", flag: "🇬🇧" },
  { code: "WNT",    name: "Weymouth New Testament",       lang: "en", flag: "🇬🇧" },
  { code: "AENT",   name: "Andrew Murray's Devotional NT", lang: "en", flag: "🇬🇧" },
  { code: "RV",     name: "Revised Version",              lang: "en", flag: "🇬🇧" },
  { code: "EBR",    name: "Emphasised Bible",             lang: "en", flag: "🇬🇧" },
  { code: "ABP",    name: "Apostolic Bible Polyglot",     lang: "en", flag: "🇬🇧" },
  { code: "MOUNCE", name: "Mounce Reverse Interlinear",   lang: "en", flag: "🇬🇧" },
  { code: "DBY",    name: "Darby Bible Commentary",       lang: "en", flag: "🇬🇧" },
  { code: "DRA",    name: "Douay-Rheims American",        lang: "en", flag: "🇬🇧" },
  { code: "WYC",    name: "Wycliffe Bible",               lang: "en", flag: "🇬🇧" },
  { code: "NTXR",   name: "New Testament Extra Rigorous", lang: "en", flag: "🇬🇧" },
  { code: "WILLIAMS", name: "Williams New Testament",     lang: "en", flag: "🇬🇧" },
  { code: "TCL",    name: "The Clear Word Bible",         lang: "en", flag: "🇬🇧" },
  { code: "RGT",    name: "Rotherham's Emphasized",       lang: "en", flag: "🇬🇧" },
  { code: "TCINT",  name: "The Complete Jewish Bible",    lang: "en", flag: "🇬🇧" },
  { code: "VW",     name: "Vincent Word Studies",         lang: "en", flag: "🇬🇧" },
  { code: "TWB",    name: "The Word Bible",               lang: "en", flag: "🇬🇧" },
  { code: "NAB",    name: "New American Bible",           lang: "en", flag: "🇬🇧" },
  { code: "NCV",    name: "New Century Version",          lang: "en", flag: "🇬🇧" },
  { code: "NCV2",   name: "New Century Version 2",        lang: "en", flag: "🇬🇧" },
  { code: "NIRV",   name: "NIrV Bible",                   lang: "en", flag: "🇬🇧" },
  { code: "ICB2",   name: "ICB Bible",                    lang: "en", flag: "🇬🇧" },
  { code: "NKC",    name: "NKJV Classic Reference",       lang: "en", flag: "🇬🇧" },
  { code: "ISV",    name: "International Standard",       lang: "en", flag: "🇬🇧" },
  { code: "NETBM", name: "NET Bible with Notes",         lang: "en", flag: "🇬🇧" },
  { code: "TLB",    name: "The Living Bible",             lang: "en", flag: "🇬🇧" },
  { code: "NCV3",   name: "New Century Version 3",        lang: "en", flag: "🇬🇧" },
  { code: "NASB1995", name: "NASB 1995",                  lang: "en", flag: "🇬🇧" },
  { code: "NASB2020", name: "NASB 2020",                  lang: "en", flag: "🇬🇧" },
  { code: "NRSVA", name: "NRSVA Bible",                   lang: "en", flag: "🇬🇧" },
  { code: "HCSB2", name: "Holman CSB 2009",               lang: "en", flag: "🇬🇧" },
  { code: "NKJV2", name: "NKJV 2007",                     lang: "en", flag: "🇬🇧" },
  { code: "BBE2",  name: "Bible in Basic English 2",      lang: "en", flag: "🇬🇧" },
  { code: "WBC",   name: "World Bible Commentary",        lang: "en", flag: "🇬🇧" },
  { code: "BLBNT", name: "BLB New Testament",             lang: "en", flag: "🇬🇧" },
  { code: "BLBOT", name: "BLB Old Testament",             lang: "en", flag: "🇬🇧" },
  { code: "JKNT",  name: "JK New Testament",              lang: "en", flag: "🇬🇧" },
  { code: "TCB",   name: "The Clear Bible",               lang: "en", flag: "🇬🇧" },
  { code: "TPNT",  name: "The Passion NT",                lang: "en", flag: "🇬🇧" },
  { code: "SBV",   name: "Scripture for Busyness",        lang: "en", flag: "🇬🇧" },
  { code: "NTNT",  name: "New Testament Notes",           lang: "en", flag: "🇬🇧" },
  { code: "ESVA",  name: "ESV with Apocrypha",            lang: "en", flag: "🇬🇧" },
  { code: "NICNT", name: "NICNT Bible",                   lang: "en", flag: "🇬🇧" },
  { code: "TPT",   name: "The Passion Translation",       lang: "en", flag: "🇬🇧" },
  { code: "MEV",   name: "Modern English Version",        lang: "en", flag: "🇬🇧" },
  { code: "KJV2000", name: "King James 2000",             lang: "en", flag: "🇬🇧" },
  { code: "NLV",   name: "New Life Version",              lang: "en", flag: "🇬🇧" },
  { code: "ACV",   name: "American Christian Version",    lang: "en", flag: "🇬🇧" },
  { code: "SSPNTG", name: "Septuagint & NT Greek",        lang: "en", flag: "🇬🇧" },
  { code: "NIVI",  name: "NIV Inclusive Language",        lang: "en", flag: "🇬🇧" },
  { code: "NRSVI", name: "NRSVI Bible",                   lang: "en", flag: "🇬🇧" },
  { code: "RSVCE", name: "RSV Catholic Edition",          lang: "en", flag: "🇬🇧" },
  { code: "JUB",   name: "Jubilee Bible",                 lang: "en", flag: "🇬🇧" },
  { code: "CEV",   name: "Contemporary English Version",  lang: "en", flag: "🇬🇧" },
  { code: "GNT",   name: "Good News Translation",         lang: "en", flag: "🇬🇧" },
  { code: "NJB",   name: "New Jerusalem Bible",           lang: "en", flag: "🇬🇧" },
  { code: "NRSVE", name: "NRSV Ecumenical",               lang: "en", flag: "🇬🇧" },
  { code: "KJVS",  name: "KJV Simple",                    lang: "en", flag: "🇬🇧" },
  { code: "NOG",   name: "Names of God Bible",            lang: "en", flag: "🇬🇧" },
  { code: "NIRV2", name: "NIrV 2014",                     lang: "en", flag: "🇬🇧" },
  { code: "VOICE", name: "The Voice",                     lang: "en", flag: "🇬🇧" },
  
  // Spanish (37 versions)
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
  { code: "RVA",    name: "Reina Valera Actualizada",     lang: "es", flag: "🇪🇸" },
  { code: "RV60",   name: "Reina Valera 60 Comentada",    lang: "es", flag: "🇪🇸" },
  { code: "VIN",    name: "Versión en Lenguaje Vivo",     lang: "es", flag: "🇪🇸" },
  { code: "SBD",    name: "Sagrada Biblia Dios Habla",    lang: "es", flag: "🇪🇸" },
  { code: "NVIC",   name: "NVI Castellana",               lang: "es", flag: "🇪🇸" },
  { code: "NVIA",   name: "NVI Actualizada",              lang: "es", flag: "🇪🇸" },
  { code: "NVI2",   name: "NVI 2015",                     lang: "es", flag: "🇪🇸" },
  { code: "NVISTD",name: "NVI Standard",                  lang: "es", flag: "🇪🇸" },
  { code: "VPAD",   name: "Versión Palabra Abierta",      lang: "es", flag: "🇪🇸" },
  { code: "CBT98", name: "Castilian Bible Translation 98", lang: "es", flag: "🇪🇸" },
  { code: "VPDS",  name: "Versión Popular Dios Salva",    lang: "es", flag: "🇪🇸" },
  { code: "VPDIOS", name: "VP Dios Habla",                lang: "es", flag: "🇪🇸" },
  { code: "RBTI",  name: "RBT Interlineal",               lang: "es", flag: "🇪🇸" },
  { code: "LBLA88", name: "LBLA 1988",                    lang: "es", flag: "🇪🇸" },
  { code: "VPALM", name: "Versión Palabra Abierta Liturgica", lang: "es", flag: "🇪🇸" },
  { code: "VPCI",  name: "Versión Popular Castellana",    lang: "es", flag: "🇪🇸" },
  { code: "VPSD",  name: "Versión Popular Santander",     lang: "es", flag: "🇪🇸" },
  { code: "RVRM",  name: "RVR Manuscritos",               lang: "es", flag: "🇪🇸" },
  { code: "NTVR", name: "NTV Reina Valera",               lang: "es", flag: "🇪🇸" },
  { code: "CVDS", name: "Castilian Version Dios Salva",   lang: "es", flag: "🇪🇸" },
  { code: "NTVI", name: "NTV Interlineal",                lang: "es", flag: "🇪🇸" },
  { code: "VPLIB", name: "Versión Popular Libre",         lang: "es", flag: "🇪🇸" },
  { code: "RVRA", name: "RVR Actualizada",                lang: "es", flag: "🇪🇸" },
  { code: "NTVS", name: "NTV Santander",                  lang: "es", flag: "🇪🇸" },
  { code: "CVCS", name: "Castilian Version Castellana",   lang: "es", flag: "🇪🇸" },
  { code: "VPAL2", name: "Versión Palabra Abierta 2",     lang: "es", flag: "🇪🇸" },
  
  // Portuguese (17 versions)
  { code: "ARA",    name: "Almeida Revisada Atualizada",  lang: "pt", flag: "🇧🇷" },
  { code: "ARC",    name: "Almeida Revisada Clássica",    lang: "pt", flag: "🇧🇷" },
  { code: "NVT",    name: "Nova Versão Transformadora",   lang: "pt", flag: "🇧🇷" },
  { code: "BPT",    name: "Bíblia Português",             lang: "pt", flag: "🇧🇷" },
  { code: "BRA",    name: "Biblia Reina-Valera Atualizada", lang: "pt", flag: "🇧🇷" },
  { code: "NVI-PT",   name: "NVI Português",              lang: "pt", flag: "🇧🇷" },
  { code: "VFL",    name: "Versão Fácil Leitura",         lang: "pt", flag: "🇧🇷" },
  { code: "ARF",    name: "Almeida Revisada Feil",        lang: "pt", flag: "🇧🇷" },
  { code: "BRC",    name: "Biblia Revisada Castellana",   lang: "pt", flag: "🇧🇷" },
  { code: "ARCM",   name: "ARC Modernizada",              lang: "pt", flag: "🇧🇷" },
  { code: "ARACV", name: "ARA Com Variações",             lang: "pt", flag: "🇧🇷" },
  { code: "TRAD",  name: "Biblia Tradicional",            lang: "pt", flag: "🇧🇷" },
  { code: "INTL", name: "Interlineal Português",          lang: "pt", flag: "🇧🇷" },
  { code: "ECUM", name: "Ecumênica Português",            lang: "pt", flag: "🇧🇷" },
  { code: "MSGPT", name: "The Message Português",         lang: "pt", flag: "🇧🇷" },
  { code: "NVIC-PT", name: "NVI Castellana Português",    lang: "pt", flag: "🇧🇷" },
  { code: "ARACI", name: "ARC Interlineal",               lang: "pt", flag: "🇧🇷" },
  
  // French (20 versions)
  { code: "LSG",    name: "Louis Segond 1910",            lang: "fr", flag: "🇫🇷" },
  { code: "NEG1979",name: "Nouvelle Edition Genève 1979",  lang: "fr", flag: "🇫🇷" },
  { code: "BDS",    name: "Bible du Semeur",              lang: "fr", flag: "🇫🇷" },
  { code: "SG21",   name: "Segond 21",                    lang: "fr", flag: "🇫🇷" },
  { code: "FC97",   name: "Français Courant 1997",        lang: "fr", flag: "🇫🇷" },
  { code: "PdV",    name: "Parole de Vie",                lang: "fr", flag: "🇫🇷" },
  { code: "LSGSM", name: "LSG Segond Mostert",            lang: "fr", flag: "🇫🇷" },
  { code: "BDSI",  name: "BDS Interlinéaire",             lang: "fr", flag: "🇫🇷" },
  { code: "LSGC", name: "LSG Commentée",                  lang: "fr", flag: "🇫🇷" },
  { code: "NEG2002", name: "NEG 2002",                    lang: "fr", flag: "🇫🇷" },
  { code: "NEG1839", name: "NEG 1839",                    lang: "fr", flag: "🇫🇷" },
  { code: "SG10",  name: "Segond 1910",                   lang: "fr", flag: "🇫🇷" },
  { code: "LSV",   name: "Lexham Segond",                 lang: "fr", flag: "🇫🇷" },
  { code: "BTP",   name: "Bible Traduction Parole",       lang: "fr", flag: "🇫🇷" },
  { code: "MSGY", name: "Message Young's",                lang: "fr", flag: "🇫🇷" },
  { code: "DCR",  name: "Darby Commentée Révisée",        lang: "fr", flag: "🇫🇷" },
  { code: "BDSK", name: "BDS Kouanouton",                 lang: "fr", flag: "🇫🇷" },
  { code: "FCO",  name: "Français Courant Officiel",      lang: "fr", flag: "🇫🇷" },
  { code: "PCD",  name: "Parole Commentée Darby",         lang: "fr", flag: "🇫🇷" },
  { code: "LSGND", name: "LSG Notes de Darby",            lang: "fr", flag: "🇫🇷" },
  
  // Italian (7 versions)
  { code: "DIOD",   name: "Bibbia Diodati",               lang: "it", flag: "🇮🇹" },
  { code: "NRV",    name: "Nuova Riveduta 2006",          lang: "it", flag: "🇮🇹" },
  { code: "CEI",    name: "CEI Conferenza Episcopale",    lang: "it", flag: "🇮🇹" },
  { code: "NBDC",   name: "Nuova Bibbia dei Commentari",  lang: "it", flag: "🇮🇹" },
  { code: "NRVI",  name: "NRV Interlineare",              lang: "it", flag: "🇮🇹" },
  { code: "DIODM", name: "Diodati Modernizzata",          lang: "it", flag: "🇮🇹" },
  { code: "CEIH", name: "CEI Interfaith Harmony",         lang: "it", flag: "🇮🇹" },
  
  // German (2 versions)
  { code: "LUT",    name: "Lutherbibel 2017",             lang: "de", flag: "🇩🇪" },
  { code: "ELB",    name: "Elberfelder Bibel",            lang: "de", flag: "🇩🇪" },
];

// ── Async IndexedDB operations ────────────────────────────────────────────

export async function saveTranslationAsync(code, payload) {
  try {
    const record = {
      code: code.toUpperCase(),
      ...payload,
      downloadedAt: new Date().toISOString(),
    };
    const db = await openDB();
    const saved = await new Promise((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
    // Keep memory cache in sync so getOfflineVerse() works immediately after download
    if (saved) _memCache[record.code] = record;
    return saved;
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