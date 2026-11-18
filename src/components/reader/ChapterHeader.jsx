import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { getTranslatedBookName, getTranslationLang, TRANSLATIONS } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

export default function ChapterHeader({ book, chapter, translation }) {
  const { lang, t } = useLang();
  // Book name follows the CONTENT translation language (BTX3 → "Juan", KJV → "John")
  const displayBook = getTranslatedBookName(book, translation ? getTranslationLang(translation) : lang);
  const version = TRANSLATIONS.find((x) => x.code === translation)?.name || translation;

  return (
    <motion.div
      key={`${book}-${chapter}`}
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="text-center pt-5 pb-5"
    >
      <Leaf className="w-6 h-6 mx-auto mb-1 text-primary" strokeWidth={1.2} />
      <h2 className="font-cinzel text-4xl font-semibold text-foreground">{displayBook} {chapter}</h2>
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mt-1.5 truncate">{t.s6Chapter} {chapter}{version ? ` · ${version}` : ""}</p>
      <div className="flex items-center justify-center gap-2 mt-3 text-primary">
        <span className="h-px w-16 bg-current opacity-50" />
        <span className="w-1.5 h-1.5 rotate-45 bg-current" />
        <span className="h-px w-16 bg-current opacity-50" />
      </div>
    </motion.div>
  );
}