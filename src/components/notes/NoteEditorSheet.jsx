import { useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { BIBLE_BOOKS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

const field = "w-full px-3 min-h-11 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const lbl = "block text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1";

// Bottom sheet to write a brand-new note for any verse.
export default function NoteEditorSheet({ onClose, onSave }) {
  const { t, lang } = useLang();
  const [title, setTitle] = useState("");
  const [book, setBook] = useState("John");
  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState(1);
  const [text, setText] = useState("");
  const [tag, setTag] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const max = BIBLE_BOOKS.find((b) => b.name === book)?.chapters || 1;
  const num = (v, hi) => Math.min(hi, Math.max(1, parseInt(v) || 1));

  const submit = async () => {
    if (!text.trim()) return setError(t.s6NeedText);
    setSaving(true);
    await onSave({ title: title.trim(), book, chapter: num(chapter, max), verse: num(verse, 176), text: text.trim(), tag: tag.trim() });
    setSaving(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl bg-card border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-cinzel text-2xl font-semibold text-foreground">{t.s6NewNote}</h2>
          <button type="button" onClick={onClose} aria-label={t.s6Cancel} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-6 gap-2">
          <label className="col-span-6"><span className={lbl}>{t.s6Book}</span>
            <select value={book} onChange={(e) => { setBook(e.target.value); setChapter(1); }} className={field} style={{ fontSize: 16 }}>
              {BIBLE_BOOKS.map((b) => <option key={b.name} value={b.name}>{getTranslatedBookName(b.name, lang)}</option>)}
            </select>
          </label>
          <label className="col-span-3 min-w-0"><span className={lbl}>{t.s6Chapter}</span>
            <input type="number" min={1} max={max} value={chapter} onChange={(e) => setChapter(e.target.value)} className={field} style={{ fontSize: 16 }} /></label>
          <label className="col-span-3 min-w-0"><span className={lbl}>{t.s6Verse}</span>
            <input type="number" min={1} value={verse} onChange={(e) => setVerse(e.target.value)} className={field} style={{ fontSize: 16 }} /></label>
        </div>

        <label className="block"><span className={lbl}>{t.s6NoteTitle}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} style={{ fontSize: 16 }} /></label>
        <label className="block"><span className={lbl}>{t.s6NoteText}</span>
          <textarea value={text} onChange={(e) => { setText(e.target.value); setError(""); }} rows={5} className={`${field} py-2 resize-none`} style={{ fontSize: 16 }} />
          {error && <span className="block text-xs mt-1 text-destructive">{error}</span>}</label>
        <label className="block"><span className={lbl}>{t.s6Tag}</span>
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder={t.s6NoteTag} className={field} style={{ fontSize: 16 }} /></label>

        <button type="button" onClick={submit} disabled={saving}
          className="w-full min-h-12 rounded-full bg-primary text-primary-foreground font-cinzel font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} {t.s6SaveNote}
        </button>
      </div>
    </div>,
    document.body
  );
}