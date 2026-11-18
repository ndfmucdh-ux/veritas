import { motion } from "framer-motion";
import { getTranslatedBookName, getTranslationLang } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

const TESTAMENT_IMAGES = {
  OT: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80",
  NT: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=800&q=80",
};

export default function ChapterHeader({ book, chapter, testament, translation }) {
  const { lang } = useLang();
  const imgSrc = TESTAMENT_IMAGES[testament] || TESTAMENT_IMAGES.OT;
  // Book name follows the CONTENT translation language (BTX3 → "Juan", KJV → "John")
  const displayBook = getTranslatedBookName(book, translation ? getTranslationLang(translation) : lang);

  return (
    <div className="relative h-36 rounded-2xl overflow-hidden mb-6">
      <img src={imgSrc} alt={book} className="w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(10,14,26,0.88))" }} />
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
        <motion.h2
          key={`${book}-${chapter}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-cinzel text-2xl font-bold text-on-image"
        >
          {displayBook}
        </motion.h2>
        <p className="font-inter text-sm mt-0.5 text-on-image">
          {lang === "es" ? "Capítulo" : "Chapter"} {chapter}
        </p>
      </div>
    </div>
  );
}