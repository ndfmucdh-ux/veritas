import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { toEnglishBookName, DEFAULT_TRANSLATION_BY_LANG } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

function VersePreviewCard({ verse }) {
  const { lang } = useLang();
  const lastSpace = verse.ref.lastIndexOf(" ");
  const rawBook = verse.ref.substring(0, lastSpace);
  const chapterVerse = verse.ref.substring(lastSpace + 1);
  const chapter = chapterVerse.split(":")[0];
  const verseNum = chapterVerse.split(":")[1]?.split("-")[0];
  // Reader routes use canonical English book names; the verse text/ref shown stays localized.
  const book = toEnglishBookName(rawBook);
  const translation = DEFAULT_TRANSLATION_BY_LANG[lang];
  const readUrl = `/read?book=${encodeURIComponent(book)}&chapter=${chapter}${verseNum ? `&verse=${verseNum}` : ""}${translation ? `&translation=${translation}` : ""}`;

  return (
    <Link to={readUrl}>
      <motion.div
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        className="rounded-xl px-3.5 py-2.5 cursor-pointer"
        style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.06)" }}
      >
        <p className="font-playfair italic leading-snug mb-1.5" style={{ fontSize: "14.5px", color: "rgb(var(--ink) / 0.82)" }}>
          "{verse.text.length > 130 ? verse.text.slice(0, 130) + "…" : verse.text}"
        </p>
        <div className="flex items-center justify-between">
          <span className="font-cinzel text-xs" style={{ color: "var(--t-gold)" }}>{verse.ref}</span>
          <span className="text-[10px] font-inter px-2 py-0.5 rounded-full capitalize" style={{ background: "var(--fill-2)", color: "rgb(var(--ink) / 0.3)" }}>{verse.theme}</span>
        </div>
      </motion.div>
    </Link>
  );
}

export default memo(VersePreviewCard);