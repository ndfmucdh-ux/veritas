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

// Map English book names to translated names
const BOOK_NAMES_ES = {
  "Genesis": "Génesis", "Exodus": "Éxodo", "Leviticus": "Levítico", "Numbers": "Números", "Deuteronomy": "Deuteronomio",
  "Joshua": "Josué", "Judges": "Jueces", "Ruth": "Rut", "1 Samuel": "1 Samuel", "2 Samuel": "2 Samuel",
  "1 Kings": "1 Reyes", "2 Kings": "2 Reyes", "1 Chronicles": "1 Crónicas", "2 Chronicles": "2 Crónicas",
  "Ezra": "Esdras", "Nehemiah": "Nehemías", "Esther": "Ester", "Job": "Job", "Psalms": "Salmos", "Proverbs": "Proverbios",
  "Ecclesiastes": "Eclesiastés", "Song of Solomon": "Cantares", "Isaiah": "Isaías", "Jeremiah": "Jeremías",
  "Lamentations": "Lamentaciones", "Ezekiel": "Ezequiel", "Daniel": "Daniel", "Hosea": "Oseas", "Joel": "Joel",
  "Amos": "Amós", "Obadiah": "Abdías", "Jonah": "Jonás", "Micah": "Miqueas", "Nahum": "Nahúm",
  "Habakkuk": "Habacuc", "Zephaniah": "Sofonías", "Haggai": "Hageo", "Zechariah": "Zacarías", "Malachi": "Malaquías",
  "Matthew": "Mateo", "Mark": "Marcos", "Luke": "Lucas", "John": "Juan", "Acts": "Hechos", "Romans": "Romanos",
  "1 Corinthians": "1 Corintios", "2 Corinthians": "2 Corintios", "Galatians": "Gálatas", "Ephesians": "Efesios",
  "Philippians": "Filipenses", "Colossians": "Colosenses", "1 Thessalonians": "1 Tesalonicenses", "2 Thessalonians": "2 Tesalonicenses",
  "1 Timothy": "1 Timoteo", "2 Timothy": "2 Timoteo", "Titus": "Tito", "Philemon": "Filemón", "Hebrews": "Hebreos",
  "James": "Santiago", "1 Peter": "1 Pedro", "2 Peter": "2 Pedro", "1 John": "1 Juan", "2 John": "2 Juan",
  "3 John": "3 Juan", "Jude": "Judas", "Revelation": "Apocalipsis",
};

const BOOK_NAMES_PT = {
  "Genesis": "Gênesis", "Exodus": "Êxodo", "Leviticus": "Levítico", "Numbers": "Números", "Deuteronomy": "Deuteronômio",
  "Joshua": "Josué", "Judges": "Juízes", "Ruth": "Rute", "1 Samuel": "1 Samuel", "2 Samuel": "2 Samuel",
  "1 Kings": "1 Reis", "2 Kings": "2 Reis", "1 Chronicles": "1 Crônicas", "2 Chronicles": "2 Crônicas",
  "Ezra": "Esdras", "Nehemiah": "Neemias", "Esther": "Ester", "Job": "Jó", "Psalms": "Salmos", "Proverbs": "Provérbios",
  "Ecclesiastes": "Eclesiastes", "Song of Solomon": "Cântico dos Cânticos", "Isaiah": "Isaías", "Jeremiah": "Jeremias",
  "Lamentations": "Lamentações", "Ezekiel": "Ezequiel", "Daniel": "Daniel", "Hosea": "Oséias", "Joel": "Joel",
  "Amos": "Amós", "Obadiah": "Obadias", "Jonah": "Jonas", "Micah": "Miquéias", "Nahum": "Naum",
  "Habakkuk": "Habacuque", "Zephaniah": "Sofonias", "Haggai": "Ageu", "Zechariah": "Zacarias", "Malachi": "Malaquias",
  "Matthew": "Mateus", "Mark": "Marcos", "Luke": "Lucas", "John": "João", "Acts": "Atos", "Romans": "Romanos",
  "1 Corinthians": "1 Coríntios", "2 Corinthians": "2 Coríntios", "Galatians": "Gálatas", "Ephesians": "Efésios",
  "Philippians": "Filipenses", "Colossians": "Colossenses", "1 Thessalonians": "1 Tessalonicenses", "2 Thessalonians": "2 Tessalonicenses",
  "1 Timothy": "1 Timóteo", "2 Timothy": "2 Timóteo", "Titus": "Tito", "Philemon": "Filemom", "Hebrews": "Hebreus",
  "James": "Tiago", "1 Peter": "1 Pedro", "2 Peter": "2 Pedro", "1 John": "1 João", "2 John": "2 João",
  "3 John": "3 João", "Jude": "Judas", "Revelation": "Apocalipse",
};

const BOOK_NAMES_FR = {
  "Genesis": "Genèse", "Exodus": "Exode", "Leviticus": "Lévitique", "Numbers": "Nombres", "Deuteronomy": "Deutéronome",
  "Joshua": "Josué", "Judges": "Juges", "Ruth": "Ruth", "1 Samuel": "1 Samuel", "2 Samuel": "2 Samuel",
  "1 Kings": "1 Rois", "2 Kings": "2 Rois", "1 Chronicles": "1 Chroniques", "2 Chronicles": "2 Chroniques",
  "Ezra": "Esdras", "Nehemiah": "Néhémie", "Esther": "Esther", "Job": "Job", "Psalms": "Psaumes", "Proverbs": "Proverbes",
  "Ecclesiastes": "Ecclésiaste", "Song of Solomon": "Cantique des Cantiques", "Isaiah": "Ésaïe", "Jeremiah": "Jérémie",
  "Lamentations": "Lamentations", "Ezekiel": "Ézéchiel", "Daniel": "Daniel", "Hosea": "Osée", "Joel": "Joël",
  "Amos": "Amos", "Obadiah": "Abdias", "Jonah": "Jonas", "Micah": "Michée", "Nahum": "Nahum",
  "Habakkuk": "Habacuc", "Zephaniah": "Sophonie", "Haggai": "Aggée", "Zechariah": "Zacharie", "Malachi": "Malachie",
  "Matthew": "Matthieu", "Mark": "Marc", "Luke": "Luc", "John": "Jean", "Acts": "Actes", "Romans": "Romains",
  "1 Corinthians": "1 Corinthiens", "2 Corinthians": "2 Corinthiens", "Galatians": "Galates", "Ephesians": "Éphésiens",
  "Philippians": "Philippiens", "Colossians": "Colossiens", "1 Thessalonians": "1 Thessaloniciens", "2 Thessalonians": "2 Thessaloniciens",
  "1 Timothy": "1 Timothée", "2 Timothy": "2 Timothée", "Titus": "Tite", "Philemon": "Philémon", "Hebrews": "Hébreux",
  "James": "Jacques", "1 Peter": "1 Pierre", "2 Peter": "2 Pierre", "1 John": "1 Jean", "2 John": "2 Jean",
  "3 John": "3 Jean", "Jude": "Jude", "Revelation": "Apocalypse",
};

const BOOK_NAMES_IT = {
  "Genesis": "Genesi", "Exodus": "Esodo", "Leviticus": "Levitico", "Numbers": "Numeri", "Deuteronomy": "Deuteronomio",
  "Joshua": "Giosuè", "Judges": "Giudici", "Ruth": "Rut", "1 Samuel": "1 Samuele", "2 Samuel": "2 Samuele",
  "1 Kings": "1 Re", "2 Kings": "2 Re", "1 Chronicles": "1 Cronache", "2 Chronicles": "2 Cronache",
  "Ezra": "Esdra", "Nehemiah": "Neemia", "Esther": "Ester", "Job": "Giobbe", "Psalms": "Salmi", "Proverbs": "Proverbi",
  "Ecclesiastes": "Ecclesiaste", "Song of Solomon": "Cantico dei Cantici", "Isaiah": "Isaia", "Jeremiah": "Geremia",
  "Lamentations": "Lamentazioni", "Ezekiel": "Ezechiele", "Daniel": "Daniele", "Hosea": "Osea", "Joel": "Gioele",
  "Amos": "Amos", "Obadiah": "Abdia", "Jonah": "Giona", "Micah": "Michea", "Nahum": "Naum",
  "Habakkuk": "Abacuc", "Zephaniah": "Sofonia", "Haggai": "Aggeo", "Zechariah": "Zaccaria", "Malachi": "Malachia",
  "Matthew": "Matteo", "Mark": "Marco", "Luke": "Luca", "John": "Giovanni", "Acts": "Atti", "Romans": "Romani",
  "1 Corinthians": "1 Corinzi", "2 Corinthians": "2 Corinzi", "Galatians": "Galati", "Ephesians": "Efesini",
  "Philippians": "Filippesi", "Colossians": "Colossesi", "1 Thessalonians": "1 Tessalonicesi", "2 Thessalonians": "2 Tessalonicesi",
  "1 Timothy": "1 Timoteo", "2 Timothy": "2 Timoteo", "Titus": "Tito", "Philemon": "Filemone", "Hebrews": "Ebrei",
  "James": "Giacomo", "1 Peter": "1 Pietro", "2 Peter": "2 Pietro", "1 John": "1 Giovanni", "2 John": "2 Giovanni",
  "3 John": "3 Giovanni", "Jude": "Giuda", "Revelation": "Apocalisse",
};

export const getTranslatedBookName = (englishName, lang) => {
  if (lang === "es") return BOOK_NAMES_ES[englishName] || englishName;
  if (lang === "pt") return BOOK_NAMES_PT[englishName] || englishName;
  if (lang === "fr") return BOOK_NAMES_FR[englishName] || englishName;
  if (lang === "it") return BOOK_NAMES_IT[englishName] || englishName;
  return englishName;
};

export const TRANSLATIONS = [
  // English (YouVersion API IDs + CDN fallbacks)
  { code: "KJV",    name: "King James Version",           lang: "en", youVersionId: 1,    source: "youversion" },
  { code: "NKJV",   name: "New King James Version",       lang: "en", youVersionId: 114,  source: "youversion" },
  { code: "NIV",    name: "New International Version",    lang: "en", youVersionId: 111,  source: "youversion" },
  { code: "ESV",    name: "English Standard Version",     lang: "en", youVersionId: 59,   source: "youversion" },
  { code: "NLT",    name: "New Living Translation",       lang: "en", youVersionId: 89,   source: "youversion" },
  { code: "NASB",   name: "New American Standard Bible",  lang: "en", youVersionId: 12,   source: "youversion" },
  { code: "AMP",    name: "Amplified Bible",              lang: "en", youVersionId: 23,   source: "youversion" },
  { code: "CSB",    name: "Christian Standard Bible",     lang: "en", youVersionId: 206,  source: "youversion" },
  { code: "MSG",    name: "The Message",                  lang: "en", youVersionId: 67,   source: "youversion" },
  { code: "NRSV",   name: "New Revised Standard Version", lang: "en", youVersionId: 76,   source: "youversion" },
  { code: "ASV",    name: "American Standard Version",    lang: "en", youVersionId: 10,   source: "youversion" },
  { code: "WEB",    name: "World English Bible",          lang: "en", youVersionId: 206,  source: "youversion" },
  { code: "BSB",    name: "Berean Standard Bible",        lang: "en", youVersionId: 3034, source: "youversion" },
  { code: "YLT",    name: "Young's Literal Translation",  lang: "en", youVersionId: 157,  source: "youversion" },
  { code: "ERV",    name: "English Revised Version",      lang: "en", youVersionId: 20,   source: "youversion" },
  { code: "GNV",    name: "Geneva Bible",                 lang: "en", youVersionId: 22,   source: "youversion" },
  { code: "AKJV",   name: "American King James Version",  lang: "en", youVersionId: 8,    source: "youversion" },
  { code: "HCSB",   name: "Holman CSB",                   lang: "en", youVersionId: 39,   source: "youversion" },
  { code: "ICB",    name: "Interlinear Code Bible",       lang: "en", youVersionId: 24,   source: "youversion" },
  { code: "OEB",    name: "Open English Bible",           lang: "en", youVersionId: 300,  source: "youversion" },
  
  // Spanish (YouVersion)
  { code: "RVR1960",name: "Reina-Valera 1960",            lang: "es", youVersionId: 149,  source: "youversion" },
  { code: "NVI",    name: "Nueva Versión Internacional",  lang: "es", youVersionId: 199,  source: "youversion" },
  { code: "LBLA",   name: "Biblia de las Américas",       lang: "es", youVersionId: 143,  source: "youversion" },
  { code: "BTX3",   name: "Biblia Textual",               lang: "es", youVersionId: 168,  source: "youversion" },
  { code: "TLA",    name: "Traducción en Lenguaje Actual", lang: "es", youVersionId: 193,  source: "youversion" },
  { code: "DHH",    name: "Dios Habla Hoy",               lang: "es", youVersionId: 173,  source: "youversion" },
  { code: "NTV",    name: "Nueva Traducción Viviente",    lang: "es", youVersionId: 167,  source: "youversion" },
  { code: "BLS",    name: "Biblia en Lenguaje Sencillo",  lang: "es", youVersionId: 156,  source: "youversion" },
  { code: "RVR2020",name: "Reina-Valera 2020",            lang: "es", youVersionId: 3624, source: "youversion" },
  { code: "PDT",    name: "Palabra de Dios para Ti",      lang: "es", youVersionId: 182,  source: "youversion" },
  { code: "PDDPT",  name: "Palabra de Dios para Todos",   lang: "es", youVersionId: 187,  source: "youversion" },
  
  // Portuguese (YouVersion)
  { code: "ARA",    name: "Almeida Revisada Atualizada",  lang: "pt", youVersionId: 15,   source: "youversion" },
  { code: "ARC",    name: "Almeida Revisada Clássica",    lang: "pt", youVersionId: 5,    source: "youversion" },
  { code: "NVT",    name: "Nova Versão Transformadora",   lang: "pt", youVersionId: 230,  source: "youversion" },
  { code: "BPT",    name: "Bíblia Português",             lang: "pt", youVersionId: 54,   source: "youversion" },
  { code: "BRA",    name: "Biblia Reina-Valera Atualizada", lang: "pt", youVersionId: 52,  source: "youversion" },
  
  // French (YouVersion)
  { code: "LSG",    name: "Louis Segond 1910",            lang: "fr", youVersionId: 14,   source: "youversion" },
  { code: "NEG1979",name: "Nouvelle Edition Genève 1979",  lang: "fr", youVersionId: 63,   source: "youversion" },
  { code: "BDS",    name: "Bible du Semeur",              lang: "fr", youVersionId: 179,  source: "youversion" },
  { code: "SG21",   name: "Segond 21",                    lang: "fr", youVersionId: 212,  source: "youversion" },
  { code: "FC97",   name: "Français Courant 1997",        lang: "fr", youVersionId: 27,   source: "youversion" },
  { code: "PdV",    name: "Parole de Vie",                lang: "fr", youVersionId: 35,   source: "youversion" },
  
  // Italian (YouVersion)
  { code: "DIOD",   name: "Bibbia Diodati",               lang: "it", youVersionId: 65,   source: "youversion" },
  { code: "NRV",    name: "Nuova Riveduta 2006",          lang: "it", youVersionId: 73,   source: "youversion" },
  { code: "CEI",    name: "CEI Conferenza Episcopale",    lang: "it", youVersionId: 7,    source: "youversion" },
  { code: "NBDC",   name: "Nuova Bibbia dei Commentari",  lang: "it", youVersionId: 68,   source: "youversion" },
  
  // German (YouVersion)
  { code: "LUT",    name: "Lutherbibel 2017",             lang: "de", youVersionId: 131,  source: "youversion" },
  { code: "ELB",    name: "Elberfelder Bibel",            lang: "de", youVersionId: 18,   source: "youversion" },
  { code: "ZB",     name: "Zürcher Bibel",                lang: "de", youVersionId: 185,  source: "youversion" },
  { code: "HFA",    name: "Hoffnung für Alle",            lang: "de", youVersionId: 154,  source: "youversion" },
  { code: "SCH2000",name: "Schlachter 2000",              lang: "de", youVersionId: 69,   source: "youversion" },
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