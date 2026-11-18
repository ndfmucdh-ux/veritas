import { BookOpen, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";

/** One saved note: reference, text excerpt, date and actions. */
export default function NoteRow({ note, t, locale, onDelete, onRemove }) {
  const date = note.created_date
    ? new Date(note.created_date).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })
    : "";
  return (
    <div className="flex items-start gap-3 rounded-xl p-3.5 bg-card border border-border border-l-2 border-l-accent">
      <div className="flex-1 min-w-0">
        <p className="font-cinzel text-base font-semibold text-accent mb-1">{note.verse_ref || t.noteFallback}</p>
        <p className="text-sm leading-relaxed text-foreground/85 line-clamp-3">{note.note_text}</p>
        {date && <p className="text-xs text-muted-foreground mt-1.5">{date}</p>}
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        {note.book && (
          <Link to={`/read?book=${encodeURIComponent(note.book)}&chapter=${note.chapter}`} aria-label="Open" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
            <BookOpen className="w-4 h-4" />
          </Link>
        )}
        {onRemove && (
          <button type="button" onClick={onRemove} aria-label="Remove" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} aria-label="Delete" className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
        )}
      </div>
    </div>
  );
}