import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Pencil, Check, Square, CheckSquare, BookOpen } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { community } from "@/lib/communityApi";
import { BIBLE_BOOKS, getTranslatedBookName } from "@/lib/bibleData";

const field = "w-full px-3 min-h-11 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

// Shared study plan: the owner sets it, every member ticks off chapters.
export default function GroupPlan({ data, reload }) {
  const { t, lang } = useLang();
  const { group } = data;
  const owner = data.role === "owner";
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(group.plan_title || "");
  const [selections, setSelections] = useState(group.plan_selections || []);
  const [book, setBook] = useState("John");
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [done, setDone] = useState(data.myChapters);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const info = BIBLE_BOOKS.find((b) => b.name === book);
  const nameOf = (b) => getTranslatedBookName(b, lang);
  const chapterList = info ? Array.from({ length: info.chapters }, (_, i) => i + 1) : [];

  const addRange = () => {
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    const chapters = [];
    for (let c = lo; c <= hi; c++) chapters.push(c);
    setSelections((s) => [...s.filter((x) => x.book !== book), { book, chapters }]);
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await community("groups.setPlan", { groupId: group.id, title, selections });
      await reload();
      setEditing(false);
    } catch { setError(t.cmErr); } finally { setBusy(false); }
  };

  const tick = async (b, c) => {
    const key = `${b}:${c}`;
    setDone((d) => (d.includes(key) ? d.filter((k) => k !== key) : [...d, key]));
    try { await community("groups.toggleChapter", { groupId: group.id, book: b, chapter: c }); reload(); } catch { setError(t.cmErr); }
  };

  const chaptersFlat = group.plan_selections.flatMap((s) => s.chapters.map((c) => [s.book, c]));
  const doneCount = chaptersFlat.filter(([b, c]) => done.includes(`${b}:${c}`)).length;
  const next = chaptersFlat.find(([b, c]) => !done.includes(`${b}:${c}`));

  if (editing) {
    return (
      <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.cmPlanName} maxLength={60} className={field} style={{ fontSize: 16 }} />
        <div className="grid grid-cols-3 gap-2">
          <select value={book} onChange={(e) => { setBook(e.target.value); setFrom(1); setTo(1); }} aria-label={t.cmBook} className={`${field} col-span-3`} style={{ fontSize: 16 }}>
            {BIBLE_BOOKS.map((b) => <option key={b.name} value={b.name}>{nameOf(b.name)}</option>)}
          </select>
          <select value={from} onChange={(e) => setFrom(Number(e.target.value))} aria-label={t.cmFromCh} className={field} style={{ fontSize: 16 }}>{chapterList.map((c) => <option key={c} value={c}>{t.cmFromCh} {c}</option>)}</select>
          <select value={to} onChange={(e) => setTo(Number(e.target.value))} aria-label={t.cmToCh} className={field} style={{ fontSize: 16 }}>{chapterList.map((c) => <option key={c} value={c}>{t.cmToCh} {c}</option>)}</select>
          <button type="button" onClick={addRange} className="min-h-11 rounded-xl bg-secondary border border-primary text-primary text-xs font-cinzel font-semibold">{t.cmAddRange}</button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {selections.map((s) => (
            <button key={s.book} type="button" onClick={() => setSelections((x) => x.filter((y) => y.book !== s.book))}
              className="px-3 min-h-8 rounded-full text-xs bg-primary/15 text-primary border border-primary/40">{nameOf(s.book)} {s.chapters[0]}-{s.chapters[s.chapters.length - 1]} ×</button>
          ))}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditing(false)} className="flex-1 min-h-11 rounded-full bg-secondary text-foreground text-sm">{t.cancel}</button>
          <button type="button" onClick={save} disabled={busy || selections.length === 0} className="flex-1 min-h-11 rounded-full bg-primary text-primary-foreground text-sm font-cinzel font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}{t.cmSavePlan}
          </button>
        </div>
      </div>
    );
  }

  if (chaptersFlat.length === 0) {
    return (
      <div className="rounded-2xl p-6 bg-card border border-border text-center space-y-3">
        <BookOpen className="w-8 h-8 mx-auto text-muted-foreground" strokeWidth={1.2} />
        <p className="text-sm text-muted-foreground">{t.cmNoPlan}</p>
        {owner && <button type="button" onClick={() => setEditing(true)} className="px-5 min-h-10 rounded-full bg-primary text-primary-foreground text-sm font-cinzel font-semibold">{t.cmSetPlan}</button>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4 bg-card border border-border space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-cinzel text-lg font-semibold text-foreground break-words">{group.plan_title || t.cmPlanTab}</p>
          {owner && <button type="button" onClick={() => setEditing(true)} aria-label={t.cmEditPlan} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-foreground flex-shrink-0"><Pencil className="w-4 h-4" /></button>}
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(doneCount / chaptersFlat.length) * 100}%` }} /></div>
        <p className="text-xs text-muted-foreground">{t.cmYourProgress}: {t.cmChaptersDone.replace("{done}", doneCount).replace("{total}", chaptersFlat.length)}</p>
        {next ? (
          <Link to={`/read?book=${encodeURIComponent(next[0])}&chapter=${next[1]}`} className="inline-flex items-center gap-1.5 px-4 min-h-10 rounded-full bg-primary text-primary-foreground text-xs font-cinzel font-semibold">
            <BookOpen className="w-3.5 h-3.5" />{t.cmReadNext.replace("{ref}", `${nameOf(next[0])} ${next[1]}`)}
          </Link>
        ) : <p className="text-sm text-primary flex items-center gap-1.5"><Check className="w-4 h-4" />{t.cmPlanDone}</p>}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {group.plan_selections.map((s) => (
        <div key={s.book} className="rounded-2xl p-3 bg-card border border-border">
          <p className="font-cinzel text-sm font-semibold text-foreground mb-2">{nameOf(s.book)}</p>
          <div className="flex flex-wrap gap-1.5">
            {s.chapters.map((c) => {
              const on = done.includes(`${s.book}:${c}`);
              return (
                <button key={c} type="button" onClick={() => tick(s.book, c)} aria-pressed={on}
                  className={`flex items-center gap-1 px-2.5 min-h-9 rounded-full text-xs border ${on ? "bg-primary/15 text-primary border-primary/40" : "bg-secondary text-foreground/80 border-border"}`}>
                  {on ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}{c}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}