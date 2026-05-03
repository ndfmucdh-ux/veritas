// Bible book data: canonical order, abbreviations, chapter counts
export const BIBLE_BOOKS = [
  // Old Testament
  { name: "Genesis", abbr: "Gen", chapters: 50, testament: "OT", num: 1 },
  { name: "Exodus", abbr: "Exo", chapters: 40, testament: "OT", num: 2 },
  { name: "Leviticus", abbr: "Lev", chapters: 27, testament: "OT", num: 3 },
  { name: "Numbers", abbr: "Num", chapters: 36, testament: "OT", num: 4 },
  { name: "Deuteronomy", abbr: "Deu", chapters: 34, testament: "OT", num: 5 },
  { name: "Joshua", abbr: "Jos", chapters: 24, testament: "OT", num: 6 },
  { name: "Judges", abbr: "Jdg", chapters: 21, testament: "OT", num: 7 },
  { name: "Ruth", abbr: "Rut", chapters: 4, testament: "OT", num: 8 },
  { name: "1 Samuel", abbr: "1Sa", chapters: 31, testament: "OT", num: 9 },
  { name: "2 Samuel", abbr: "2Sa", chapters: 24, testament: "OT", num: 10 },
  { name: "1 Kings", abbr: "1Ki", chapters: 22, testament: "OT", num: 11 },
  { name: "2 Kings", abbr: "2Ki", chapters: 25, testament: "OT", num: 12 },
  { name: "1 Chronicles", abbr: "1Ch", chapters: 29, testament: "OT", num: 13 },
  { name: "2 Chronicles", abbr: "2Ch", chapters: 36, testament: "OT", num: 14 },
  { name: "Ezra", abbr: "Ezr", chapters: 10, testament: "OT", num: 15 },
  { name: "Nehemiah", abbr: "Neh", chapters: 13, testament: "OT", num: 16 },
  { name: "Esther", abbr: "Est", chapters: 10, testament: "OT", num: 17 },
  { name: "Job", abbr: "Job", chapters: 42, testament: "OT", num: 18 },
  { name: "Psalms", abbr: "Psa", chapters: 150, testament: "OT", num: 19 },
  { name: "Proverbs", abbr: "Pro", chapters: 31, testament: "OT", num: 20 },
  { name: "Ecclesiastes", abbr: "Ecc", chapters: 12, testament: "OT", num: 21 },
  { name: "Song of Solomon", abbr: "Son", chapters: 8, testament: "OT", num: 22 },
  { name: "Isaiah", abbr: "Isa", chapters: 66, testament: "OT", num: 23 },
  { name: "Jeremiah", abbr: "Jer", chapters: 52, testament: "OT", num: 24 },
  { name: "Lamentations", abbr: "Lam", chapters: 5, testament: "OT", num: 25 },
  { name: "Ezekiel", abbr: "Eze", chapters: 48, testament: "OT", num: 26 },
  { name: "Daniel", abbr: "Dan", chapters: 12, testament: "OT", num: 27 },
  { name: "Hosea", abbr: "Hos", chapters: 14, testament: "OT", num: 28 },
  { name: "Joel", abbr: "Joe", chapters: 3, testament: "OT", num: 29 },
  { name: "Amos", abbr: "Amo", chapters: 9, testament: "OT", num: 30 },
  { name: "Obadiah", abbr: "Oba", chapters: 1, testament: "OT", num: 31 },
  { name: "Jonah", abbr: "Jon", chapters: 4, testament: "OT", num: 32 },
  { name: "Micah", abbr: "Mic", chapters: 7, testament: "OT", num: 33 },
  { name: "Nahum", abbr: "Nah", chapters: 3, testament: "OT", num: 34 },
  { name: "Habakkuk", abbr: "Hab", chapters: 3, testament: "OT", num: 35 },
  { name: "Zephaniah", abbr: "Zep", chapters: 3, testament: "OT", num: 36 },
  { name: "Haggai", abbr: "Hag", chapters: 2, testament: "OT", num: 37 },
  { name: "Zechariah", abbr: "Zec", chapters: 14, testament: "OT", num: 38 },
  { name: "Malachi", abbr: "Mal", chapters: 4, testament: "OT", num: 39 },
  // New Testament
  { name: "Matthew", abbr: "Mat", chapters: 28, testament: "NT", num: 40 },
  { name: "Mark", abbr: "Mar", chapters: 16, testament: "NT", num: 41 },
  { name: "Luke", abbr: "Luk", chapters: 24, testament: "NT", num: 42 },
  { name: "John", abbr: "Joh", chapters: 21, testament: "NT", num: 43 },
  { name: "Acts", abbr: "Act", chapters: 28, testament: "NT", num: 44 },
  { name: "Romans", abbr: "Rom", chapters: 16, testament: "NT", num: 45 },
  { name: "1 Corinthians", abbr: "1Co", chapters: 16, testament: "NT", num: 46 },
  { name: "2 Corinthians", abbr: "2Co", chapters: 13, testament: "NT", num: 47 },
  { name: "Galatians", abbr: "Gal", chapters: 6, testament: "NT", num: 48 },
  { name: "Ephesians", abbr: "Eph", chapters: 6, testament: "NT", num: 49 },
  { name: "Philippians", abbr: "Phi", chapters: 4, testament: "NT", num: 50 },
  { name: "Colossians", abbr: "Col", chapters: 4, testament: "NT", num: 51 },
  { name: "1 Thessalonians", abbr: "1Th", chapters: 5, testament: "NT", num: 52 },
  { name: "2 Thessalonians", abbr: "2Th", chapters: 3, testament: "NT", num: 53 },
  { name: "1 Timothy", abbr: "1Ti", chapters: 6, testament: "NT", num: 54 },
  { name: "2 Timothy", abbr: "2Ti", chapters: 4, testament: "NT", num: 55 },
  { name: "Titus", abbr: "Tit", chapters: 3, testament: "NT", num: 56 },
  { name: "Philemon", abbr: "Phm", chapters: 1, testament: "NT", num: 57 },
  { name: "Hebrews", abbr: "Heb", chapters: 13, testament: "NT", num: 58 },
  { name: "James", abbr: "Jam", chapters: 5, testament: "NT", num: 59 },
  { name: "1 Peter", abbr: "1Pe", chapters: 5, testament: "NT", num: 60 },
  { name: "2 Peter", abbr: "2Pe", chapters: 3, testament: "NT", num: 61 },
  { name: "1 John", abbr: "1Jo", chapters: 5, testament: "NT", num: 62 },
  { name: "2 John", abbr: "2Jo", chapters: 1, testament: "NT", num: 63 },
  { name: "3 John", abbr: "3Jo", chapters: 1, testament: "NT", num: 64 },
  { name: "Jude", abbr: "Jud", chapters: 1, testament: "NT", num: 65 },
  { name: "Revelation", abbr: "Rev", chapters: 22, testament: "NT", num: 66 },
];

export const OT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === "OT");
export const NT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === "NT");

export const TRANSLATIONS = [
  // CDN-backed via bolls.life (fast, 100+ translations)
  { code: "KJV",    name: "King James Version",           lang: "en", source: "cdn" },
  { code: "NIV",    name: "New International Version",    lang: "en", source: "cdn" },
  { code: "ESV",    name: "English Standard Version",     lang: "en", source: "cdn" },
  { code: "NLT",    name: "New Living Translation",       lang: "en", source: "cdn" },
  { code: "NKJV",   name: "New King James Version",       lang: "en", source: "cdn" },
  { code: "NASB",   name: "New American Standard Bible",  lang: "en", source: "cdn" },
  { code: "AMP",    name: "Amplified Bible",              lang: "en", source: "cdn" },
  { code: "MSG",    name: "The Message",                  lang: "en", source: "cdn" },
  { code: "CSB",    name: "Christian Standard Bible",     lang: "en", source: "cdn" },
  { code: "ASV",    name: "American Standard Version",    lang: "en", source: "cdn" },
  { code: "BBE",    name: "Bible in Basic English",       lang: "en", source: "cdn" },
  { code: "WEB",    name: "World English Bible",          lang: "en", source: "cdn" },
  // CDN-backed via helloao.org (BSB poetry-aware)
  { code: "BSB",    name: "Berean Standard Bible",        lang: "en", source: "cdn" },
  // Spanish — CDN-backed via bolls.life
  { code: "NVI",    name: "Nueva Versión Internacional",  lang: "es", source: "cdn" },
  { code: "RVR1960",name: "Reina-Valera 1960",            lang: "es", source: "cdn" },
  { code: "PDDPT",  name: "Palabra de Dios para Ti",      lang: "es", source: "cdn" },
  { code: "BTX3",   name: "Biblia Textual",               lang: "es", source: "cdn" },
];

export const LEVELS = [
  { name: "Seeker", minXP: 0, maxXP: 499, color: "#94a3b8", icon: "🌱" },
  { name: "Disciple", minXP: 500, maxXP: 1999, color: "#00e5ff", icon: "✝️" },
  { name: "Scholar", minXP: 2000, maxXP: 4999, color: "#fbbf24", icon: "📖" },
  { name: "Elder", minXP: 5000, maxXP: Infinity, color: "#a78bfa", icon: "👑" },
];

export const getLevelForXP = (xp) => {
  return LEVELS.find(l => xp >= l.minXP && xp <= l.maxXP) || LEVELS[0];
};

export const XP_ACTIONS = {
  READ_CHAPTER: 10,
  ADD_NOTE: 15,
  ADD_HIGHLIGHT: 5,
  ADD_BOOKMARK: 5,
  DAILY_STREAK: 20,
  SHARE_VERSE: 10,
  COMPLETE_PLAN_DAY: 25,
};

export const BADGES = [
  { id: "first_read", name: "First Steps", desc: "Read your first chapter", icon: "📖", xp: 50 },
  { id: "week_streak", name: "Faithful Week", desc: "7-day reading streak", icon: "🔥", xp: 100 },
  { id: "month_streak", name: "Devoted Heart", desc: "30-day reading streak", icon: "❤️", xp: 500 },
  { id: "highlighter", name: "Illuminated", desc: "Highlight 10 verses", icon: "✨", xp: 75 },
  { id: "scribe", name: "The Scribe", desc: "Write 10 notes", icon: "✍️", xp: 100 },
  { id: "nt_complete", name: "New Covenant", desc: "Read all NT books", icon: "✝️", xp: 1000 },
  { id: "ot_complete", name: "Ancient Paths", desc: "Read all OT books", icon: "🏛️", xp: 2000 },
  { id: "plan_finish", name: "Plan Finisher", desc: "Complete a reading plan", icon: "🎯", xp: 300 },
];