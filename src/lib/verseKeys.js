// Canonical key + ordering helpers shared across the consolidated data layer.
// Keeping these in one place guarantees the frontend and backend produce
// identical keys (no silent dedup misses).

export const BOOK_ORDER = {
  Genesis: 1, Exodus: 2, Leviticus: 3, Numbers: 4, Deuteronomy: 5, Joshua: 6, Judges: 7, Ruth: 8,
  "1 Samuel": 9, "2 Samuel": 10, "1 Kings": 11, "2 Kings": 12, "1 Chronicles": 13, "2 Chronicles": 14,
  Ezra: 15, Nehemiah: 16, Esther: 17, Job: 18, Psalms: 19, Proverbs: 20, Ecclesiastes: 21,
  "Song of Solomon": 22, Isaiah: 23, Jeremiah: 24, Lamentations: 25, Ezekiel: 26, Daniel: 27,
  Hosea: 28, Joel: 29, Amos: 30, Obadiah: 31, Jonah: 32, Micah: 33, Nahum: 34, Habakkuk: 35,
  Zephaniah: 36, Haggai: 37, Zechariah: 38, Malachi: 39, Matthew: 40, Mark: 41, Luke: 42,
  John: 43, Acts: 44, Romans: 45, "1 Corinthians": 46, "2 Corinthians": 47, Galatians: 48,
  Ephesians: 49, Philippians: 50, Colossians: 51, "1 Thessalonians": 52, "2 Thessalonians": 53,
  "1 Timothy": 54, "2 Timothy": 55, Titus: 56, Philemon: 57, Hebrews: 58, James: 59,
  "1 Peter": 60, "2 Peter": 61, "1 John": 62, "2 John": 63, "3 John": 64, Jude: 65, Revelation: 66,
};

export const bookOrder = (book) => BOOK_ORDER[book] || 0;

// Canonical verse key: TRANSLATION|Book|Chapter|Verse
export const verseKey = (translation, book, chapter, verse) =>
  `${translation || "KJV"}|${book}|${chapter}|${verse}`;

// Build the full consolidated interaction payload from a verse descriptor.
export const buildInteractionBase = ({ translation, book, chapter, verse, verse_ref }) => ({
  verse_key: verseKey(translation, book, chapter, verse),
  verse_ref: verse_ref || `${book} ${chapter}:${verse}`,
  book,
  book_order: bookOrder(book),
  chapter,
  verse,
  translation: translation || "KJV",
});