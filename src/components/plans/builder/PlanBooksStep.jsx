import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { BIBLE_BOOKS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

const GROUPS = [
  { id: "law", key: "bgLaw", books: [1, 2, 3, 4, 5] },
  { id: "history", key: "bgHistory", books: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] },
  { id: "wisdom", key: "bgWisdom", books: [18, 19, 20, 21, 22] },
  { id: "major", key: "bgMajor", books: [23, 24, 25, 26, 27] },
  { id: "minor", key: "bgMinor", books: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39] },
  { id: "gospels", key: "bgGospels", books: [40, 41, 42, 43] },
  { id: "acts", key: "bgActs", books: Array.from({ length: 22 }, (_, i) => 44 + i) },
  { id: "revelation", key: "bgRev", books: [66] },
];

export default function PlanBooksStep({ selections, toggleChapter, toggleAll, totalChapters, chaptersPerDay }) {
  const { t, lang } = useLang();
  const [group, setGroup] = useState(null);
  const [openBook, setOpenBook] = useState(null);

  return (
    <div className="space-y-2 pt-2">
      {totalChapters > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2 bg-primary/10 border border-primary/25">
          <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-xs font-cinzel text-primary">{t.bpChapters.replace("{n}", totalChapters)}</span>
          {chaptersPerDay && <span className="text-xs ml-auto text-muted-foreground">{t.bpPerDay.replace("{n}", chaptersPerDay)}</span>}
        </div>
      )}
      {GROUPS.map((g) => {
        const books = BIBLE_BOOKS.filter((b) => g.books.includes(b.num));
        const open = group === g.id;
        const count = books.reduce((s, b) => s + (selections[b.name]?.size || 0), 0);
        return (
          <div key={g.id}>
            <button type="button" onClick={() => setGroup(open ? null : g.id)} aria-expanded={open}
              className={`w-full flex items-center justify-between px-3 min-h-11 rounded-xl border bg-card ${count ? "border-primary/40" : "border-border"}`}>
              <span className={`font-cinzel text-sm font-semibold ${count ? "text-primary" : "text-foreground"}`}>{t[g.key]}</span>
              <span className="flex items-center gap-2">
                {count > 0 && <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-primary/15 text-primary">{t.bpChShort.replace("{n}", count)}</span>}
                {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </span>
            </button>
            <AnimatePresence>
              {open && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pl-2 pt-1 pb-2 space-y-1">
                    {books.map((b) => {
                      const sel = selections[b.name];
                      const n = sel?.size || 0;
                      const expanded = openBook === b.name;
                      return (
                        <div key={b.name}>
                          <div className="flex items-center gap-2 px-2 min-h-10">
                            <button type="button" onClick={() => setOpenBook(expanded ? null : b.name)} className="flex-1 min-w-0 flex items-center gap-2 text-left">
                              <span className={`text-sm truncate ${n ? "text-primary font-semibold" : "text-foreground"}`}>{getTranslatedBookName(b.name, lang)}</span>
                              <span className="text-[11px] text-muted-foreground flex-shrink-0">{t.bpChShort.replace("{n}", b.chapters)}</span>
                              {n > 0 && <span className="text-[11px] text-primary flex-shrink-0">({t.bpSel.replace("{n}", n)})</span>}
                            </button>
                            <button type="button" onClick={() => toggleAll(b.name)}
                              className={`text-xs px-2.5 min-h-8 rounded-lg border flex-shrink-0 ${n === b.chapters ? "bg-primary/15 text-primary border-primary/40" : "bg-secondary text-muted-foreground border-border"}`}>{t.bpAll}</button>
                            <button type="button" aria-label="toggle" onClick={() => setOpenBook(expanded ? null : b.name)} className="text-muted-foreground w-8 h-8 flex items-center justify-center">
                              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                          {expanded && (
                            <div className="grid grid-cols-8 gap-1 px-2 pb-2">
                              {Array.from({ length: b.chapters }, (_, i) => i + 1).map((ch) => {
                                const on = sel?.has(ch);
                                return (
                                  <button key={ch} type="button" onClick={() => toggleChapter(b.name, ch)} aria-pressed={!!on}
                                    className={`aspect-square rounded-lg text-[11px] font-cinzel font-semibold border ${on ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground/80 border-border"}`}>{ch}</button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}