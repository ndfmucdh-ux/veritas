import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const BOOK_MAP = { Psalm: "Psalms" };

function VersePreviewCard({ verse }) {
  const lastSpace = verse.ref.lastIndexOf(" ");
  const rawBook = verse.ref.substring(0, lastSpace);
  const chapterVerse = verse.ref.substring(lastSpace + 1);
  const chapter = chapterVerse.split(":")[0];
  const verseNum = chapterVerse.split(":")[1]?.split("-")[0];
  const book = BOOK_MAP[rawBook] || rawBook;
  const readUrl = `/read?book=${encodeURIComponent(book)}&chapter=${chapter}${verseNum ? `&verse=${verseNum}` : ""}`;

  return (
    <Link to={readUrl}>
      <motion.div
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        className="rounded-2xl p-4 cursor-pointer"
        style={{ background: "var(--fill-1)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="font-playfair italic leading-relaxed mb-2.5" style={{ fontSize: "15px", color: "rgba(255,255,255,0.82)" }}>
          "{verse.text.length > 130 ? verse.text.slice(0, 130) + "…" : verse.text}"
        </p>
        <div className="flex items-center justify-between">
          <span className="font-cinzel text-xs" style={{ color: "#FFD700" }}>{verse.ref}</span>
          <span className="text-[10px] font-inter px-2 py-0.5 rounded-full capitalize" style={{ background: "var(--fill-2)", color: "rgba(255,255,255,0.3)" }}>{verse.theme}</span>
        </div>
      </motion.div>
    </Link>
  );
}

export default memo(VersePreviewCard);