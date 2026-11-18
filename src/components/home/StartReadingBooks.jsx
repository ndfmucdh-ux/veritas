import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "@/lib/LanguageContext";
import { getTranslatedBookName, DEFAULT_TRANSLATION_BY_LANG } from "@/lib/bibleData";

const START_BOOKS = ["John", "Psalms", "Proverbs", "Romans", "Genesis", "Matthew", "Isaiah"];

export default function StartReadingBooks() {
  const { lang } = useLang();
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {START_BOOKS.map((name, i) => (
        <Link key={name} to={`/read?book=${encodeURIComponent(name)}&chapter=1&translation=${DEFAULT_TRANSLATION_BY_LANG[lang] || "KJV"}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 + i * 0.04 }}
            whileTap={{ scale: 0.93 }}
            className="flex-shrink-0 px-5 py-3.5 rounded-xl font-cinzel text-sm whitespace-nowrap"
            style={{ background: "var(--fill-2)", border: "1px solid rgb(var(--ink) / 0.07)", color: "rgb(var(--ink) / 0.5)" }}
          >
            {getTranslatedBookName(name, lang)}
          </motion.div>
        </Link>
      ))}
    </div>
  );
}