import { motion } from "framer-motion";
import { getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

const TESTAMENT_IMAGES = {
  OT: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80",
  NT: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=800&q=80",
};

export default function ChapterHeader({ book, chapter, testament }) {
  const { lang } = useLang();
  const imgSrc = TESTAMENT_IMAGES[testament] || TESTAMENT_IMAGES.OT;
  const displayBook = getTranslatedBookName(book, lang);

  return (
    <div className="relative h-36 rounded-2xl overflow-hidden mb-6">
      <img src={imgSrc} alt={book} className="w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(6,10,20,0.9))" }} />
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
        <motion.h2
          key={`${book}-${chapter}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-cinzel text-2xl font-bold text-white"
        >
          {displayBook}
        </motion.h2>
        <p className="font-inter text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          Chapter {chapter}
        </p>
      </div>
    </div>
  );
}