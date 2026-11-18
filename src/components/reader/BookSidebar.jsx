import { useEffect } from "react";
import { BookOpen } from "lucide-react";
import { BIBLE_BOOKS, getTranslatedBookName, getTranslationLang } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";
import { useResizableWidth } from "@/hooks/useSideNavWidth";
import ResizeHandle from "@/components/layout/ResizeHandle";

// Wide-screen book list with chapter counts, beside the reading page. Drag its right edge to resize.
export default function BookSidebar({ book, translation, onNavigate }) {
  const { t } = useLang();
  const lang = getTranslationLang(translation);
  const { width, setWidth, reset } = useResizableWidth("veritas_booksidebar_width", 176, 130, 360);

  // The reading area reserves exactly this much room (see .reader-offset).
  useEffect(() => {
    document.documentElement.style.setProperty("--booksb-w", `${width}px`);
  }, [width]);

  return (
    <>
      <aside
        className="book-side flex-col fixed top-[57px] bottom-0 border-r border-border bg-background/80 backdrop-blur z-20"
        style={{ left: "var(--sidenav-w, 224px)", width }}
      >
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
      <BookHandle width={width} onResize={setWidth} onReset={reset} />
    </>
  );
}

// Handle follows the sidebar's right edge: side menu width + book list width.
function BookHandle({ width, onResize, onReset }) {
  const navNow = () => parseInt(window.getComputedStyle(document.documentElement).getPropertyValue("--sidenav-w")) || 224;
  return <ResizeHandle className="book-side" left={`calc(var(--sidenav-w, 224px) + ${width}px)`} onResize={(x) => onResize(x - navNow())} onReset={onReset} label="Resize book list" />;
}