import { motion } from "framer-motion";
import { getTranslatedBookName, getTranslationLang } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

export default function ChapterHeader({ book, chapter, translation }) {
  const { lang } = useLang();
  // Book name follows the CONTENT translation language (BTX3 → "Juan", KJV → "John")
  const displayBook = getTranslatedBookName(book, translation ? getTranslationLang(translation) : lang);

  return (
    <motion.div
      key={`${book}-${chapter}`}
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="text-center pt-6 pb-6"
    >
      <div className="flex items-center justify-center gap-3" style={{ color: "var(--t-gold)" }}>
        <span className="h-px w-10" style={{ background: "currentColor", opacity: 0.5 }} />
        <p className="font-inter text-xs uppercase tracking-[0.25em] font-medium">
          {lang === "es" ? "Capítulo" : "Chapter"} {chapter}
        </p>
        <span className="h-px w-10" style={{ background: "currentColor", opacity: 0.5 }} />
      </div>
      <h2 className="font-cinzel text-4xl font-semibold mt-3 text-foreground">{displayBook}</h2>
      <div className="flex items-center justify-center gap-2 mt-3" style={{ color: "var(--t-gold)" }}>
        <span className="h-px w-16" style={{ background: "currentColor", opacity: 0.5 }} />
        <span className="w-1.5 h-1.5 rotate-45" style={{ background: "currentColor" }} />
        <span className="h-px w-16" style={{ background: "currentColor", opacity: 0.5 }} />
      </div>
    </motion.div>
  );
}