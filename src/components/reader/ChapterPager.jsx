import { ChevronLeft, ChevronRight } from "lucide-react";
import { BIBLE_BOOKS, getTranslatedBookName, getTranslationLang } from "@/lib/bibleData";

// Previous / next chapter pills at the foot of the page.
export default function ChapterPager({ book, chapter, translation, onNavigate }) {
  const idx = BIBLE_BOOKS.findIndex((b) => b.name === book);
  const total = BIBLE_BOOKS[idx]?.chapters || 1;
  const lang = getTranslationLang(translation);
  const name = (b) => getTranslatedBookName(b, lang);

  const prev = chapter > 1 ? [book, chapter - 1] : idx > 0 ? [BIBLE_BOOKS[idx - 1].name, BIBLE_BOOKS[idx - 1].chapters] : null;
  const next = chapter < total ? [book, chapter + 1] : idx < BIBLE_BOOKS.length - 1 ? [BIBLE_BOOKS[idx + 1].name, 1] : null;
  const pill = "flex items-center gap-1.5 px-4 min-h-11 rounded-xl bg-secondary border border-border text-sm font-cinzel text-foreground max-w-[48%]";

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      {prev && <button type="button" onClick={() => onNavigate(...prev)} className={pill}><ChevronLeft className="w-4 h-4 flex-shrink-0" /><span className="truncate">{name(prev[0])} {prev[1]}</span></button>}
      {next && <button type="button" onClick={() => onNavigate(...next)} className={pill}><span className="truncate">{name(next[0])} {next[1]}</span><ChevronRight className="w-4 h-4 flex-shrink-0" /></button>}
    </div>
  );
}