import { useState, useEffect } from "react";
import { getVerseCount } from "@/lib/chapterVerses";
import { createPortal } from "react-dom";
import { Loader2, X, ChevronDown, Plus, Check } from "lucide-react";
import { BIBLE_BOOKS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

const field = "w-full px-3 min-h-11 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const lbl = "block text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1";
const range = (n) => Array.from({ length: n }, (_, i) => i + 1);

// Compact native dropdown with a chevron.
function Select({ label, value, onChange, children, className = "" }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className={lbl}>{label}</span>
      <span className="relative block">
        <select value={value} onChange={onChange} className={`${field} appearance-none pr-8 truncate`} style={{ fontSize: 16 }}>{children}</select>
        <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </span>
    </label>
  );
}

// Bottom sheet to write a brand-new note for any verse.
export default function NoteEditorSheet({ onClose, onSave, existingTags = [], note = null }) {
  const { t, lang } = useLang();
  const [title, setTitle] = useState(note?.note_title || "");
  const [book, setBook] = useState(note?.book || "John");
  const [chapter, setChapter] = useState(note?.chapter || 1);
  const [verse, setVerse] = useState(note?.verse || 1);
  const [text, setText] = useState(note?.note_text || "");
  const [tagList, setTagList] = useState([...new Set([...existingTags, ...(note?.tags || [])])]);
  const [picked, setPicked] = useState(note?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const max = BIBLE_BOOKS.find((b) => b.name === book)?.chapters || 1;
  const [verseMax, setVerseMax] = useState(0);
  const [counting, setCounting] = useState(true);

  // Exact verse count of the chosen chapter, so the list matches the real book.
  useEffect(() => {
    if (note) return undefined;
    let live = true;
    setCounting(true);
    const translation = localStorage.getItem("veritas_translation") || "KJV";
    getVerseCount(book, Number(chapter), translation)
      .catch(() => 0)
      .then((n) => {
        if (!live) return;
        setVerseMax(n);
        setVerse((v) => (n && Number(v) > n ? 1 : v));
        setCounting(false);
      });
    return () => { live = false; };
  }, [book, chapter]);

  const toggleTag = (tag) => setPicked((p) => (p.includes(tag) ? p.filter((x) => x !== tag) : [...p, tag]));
  const addTag = () => {
    const v = newTag.trim();
    if (!v) return;
    if (!tagList.includes(v)) setTagList((l) => [...l, v]);
    if (!picked.includes(v)) setPicked((p) => [...p, v]);
    setNewTag("");
  };

  const submit = async () => {
    if (!text.trim()) return setError(t.s6NeedText);
    setSaving(true);
    await onSave({ title: title.trim(), book, chapter: Number(chapter), verse: Number(verse), text: text.trim(), tags: picked });
    setSaving(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl bg-card border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-cinzel text-2xl font-semibold text-foreground">{note ? t.s9EditNote : t.s6NewNote}</h2>
          <button type="button" onClick={onClose} aria-label={t.s6Cancel} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground"><X className="w-4 h-4" /></button>
        </div>

        {note && <p className="font-cinzel text-sm font-semibold text-primary">{note.verse_ref}</p>}
        <div className={`grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] gap-2 ${note ? "hidden" : ""}`}>
          <Select label={t.s6Book} value={book} onChange={(e) => { setBook(e.target.value); setChapter(1); }}>
            {BIBLE_BOOKS.map((b) => <option key={b.name} value={b.name}>{getTranslatedBookName(b.name, lang)}</option>)}
          </Select>
          <Select label={t.s6Chapter} value={chapter} onChange={(e) => setChapter(e.target.value)}>
            {range(max).map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
          {verseMax > 0 || counting ? (
            <Select label={t.s6Verse} value={verse} onChange={(e) => setVerse(e.target.value)}>
              {counting ? <option value={verse}>…</option> : range(verseMax).map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          ) : (
            <label className="block min-w-0"><span className={lbl}>{t.s6Verse}</span>
              <input type="number" min={1} value={verse} onChange={(e) => setVerse(e.target.value)} className={field} style={{ fontSize: 16 }} /></label>
          )}
        </div>

        <label className="block"><span className={lbl}>{t.s6NoteTitle}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} style={{ fontSize: 16 }} /></label>
        <label className="block"><span className={lbl}>{t.s6NoteText}</span>
          <textarea value={text} onChange={(e) => { setText(e.target.value); setError(""); }} rows={5} className={`${field} py-2 resize-none`} style={{ fontSize: 16 }} />
          {error && <span className="block text-xs mt-1 text-destructive">{error}</span>}</label>

        <div>
          <span className={lbl}>{t.s7Tags}</span>
          {tagList.length === 0 && <p className="text-xs text-muted-foreground mb-2">{t.s7NoTags}</p>}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tagList.map((tag) => {
              const on = picked.includes(tag);
              return (
                <button key={tag} type="button" onClick={() => toggleTag(tag)} aria-pressed={on}
                  className={`flex items-center gap-1 px-3 min-h-8 rounded-full text-xs border ${on ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground border-border"}`}>
                  {on && <Check className="w-3 h-3" />}{tag}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              placeholder={t.s7NewTag} className={field} style={{ fontSize: 16 }} />
            <button type="button" onClick={addTag} disabled={!newTag.trim()} aria-label={t.s7AddTag}
              className="px-4 min-h-11 rounded-xl bg-secondary border border-border text-foreground flex items-center gap-1 text-sm disabled:opacity-50 flex-shrink-0">
              <Plus className="w-4 h-4" /> {t.s7AddTag}
            </button>
          </div>
        </div>

        <button type="button" onClick={submit} disabled={saving}
          className="w-full min-h-12 rounded-full bg-primary text-primary-foreground font-cinzel font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} {t.s6SaveNote}
        </button>
      </div>
    </div>,
    document.body
  );
}