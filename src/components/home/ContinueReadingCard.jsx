import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Mountain } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getTranslatedBookName, getTranslationLang } from "@/lib/bibleData";

const DEFAULT_LAST = { book: "Psalms", chapter: 23, translation: "KJV" };

export default function ContinueReadingCard() {
  const [last, setLast] = useState(DEFAULT_LAST);

  useEffect(() => {
    // Most recent chapter this reader finished; anonymous visitors keep the default.
    base44.entities.ReadingSession.list("-created_date", 1)
      .then((res) => {
        const s = (res?.items || res || [])[0];
        if (s?.book) setLast({ book: s.book, chapter: s.chapter, translation: s.translation });
      })
      .catch(() => {});
  }, []);

  const name = getTranslatedBookName(last.book, getTranslationLang(last.translation));
  const href = `/read?book=${encodeURIComponent(last.book)}&chapter=${last.chapter}`;

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid var(--hairline)" }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-cinzel text-2xl font-semibold text-foreground">Recently Read</h2>
        <Link to="/library" className="inline-flex items-center gap-1 font-inter text-base min-h-11" style={{ color: "var(--t-gold)" }}>
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <Link to={href} className="flex items-center gap-4">
        <div className="w-16 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--fill-3)" }}>
          <Mountain className="w-7 h-7" strokeWidth={1.2} style={{ color: "rgb(var(--ink) / 0.7)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-cinzel text-xl font-semibold text-foreground truncate">{name} {last.chapter}</p>
          <p className="font-inter text-sm truncate" style={{ color: "rgb(var(--ink) / 0.7)" }}>{last.translation}</p>
        </div>
        <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: "rgb(var(--ink) / 0.7)" }} />
      </Link>
    </motion.section>
  );
}