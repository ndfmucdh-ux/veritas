import { BookOpen } from "lucide-react";
import { BIBLE_BOOKS, getTranslatedBookName, getTranslationLang } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

// Wide-screen book list with chapter counts, beside the reading page.
export default function BookSidebar({ book, translation, onNavigate }) {
  const { t } = useLang();
  const lang = getTranslationLang(translation);
  return (
    <aside className="hidden xl:flex flex-col fixed left-56 top-[57px] bottom-0 w-64 border-r border-border bg-background/80 backdrop-blur z-20">
      <p className="px-4 pt-4 pb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t.s6ReaderBooks}</p>
      <nav className="flex-1 overflow-y-auto px-2 pb-6">
        {BIBLE_BOOKS.map((b) => {
          const active = b.name === book;
          return (
            <button key={b.name} type="button" onClick={() => onNavigate(b.name, 1)} aria-current={active ? "page" : undefined}
              className={`w-full flex items-center gap-2 px-3 min-h-10 rounded-xl text-sm text-left ${active ? "bg-secondary text-foreground font-semibold" : "text-foreground/80"}`}>
              {active && <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />}
              <span className="flex-1 truncate">{getTranslatedBookName(b.name, lang)}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">{b.chapters}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}