import { useState } from "react";
import { Plus, Leaf } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import NoteCard from "@/components/notes/NoteCard";
import NoteEditorSheet from "@/components/notes/NoteEditorSheet";
import { EmptyState } from "@/components/ui/states";

// Notes list with an always-visible "Add note" button.
export default function NotesView({ notes, loading, tagBar, onCreate, onDelete, onTag, onShare }) {
  const { t } = useLang();
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-3 pb-40">
      <div className="relative pb-3 border-b border-border">
        <Leaf aria-hidden="true" className="absolute right-0 -top-1 w-12 h-12 text-primary opacity-30" strokeWidth={1} />
        <h2 className="font-cinzel text-3xl font-semibold text-foreground">{t.s6Notes}</h2>
        <p className="text-sm text-muted-foreground">{t.s6NotesSub}</p>
      </div>

      {tagBar}

      {notes.length === 0 && !loading && <EmptyState icon="" title={t.s6NoNotes} description={t.s6NoNotesD} />}
      {notes.map((note, i) => (
        <NoteCard key={note.id} note={note} index={i}
          onTag={() => onTag(note)} onShare={() => onShare(note)} onDelete={() => onDelete(note.id)} />
      ))}

      <div className="fixed inset-x-4 bottom-[4.75rem] md:bottom-6 md:left-64 z-30 pointer-events-none">
        <button type="button" onClick={() => setEditing(true)}
          className="pointer-events-auto mx-auto flex w-full max-w-md items-center gap-3 rounded-full bg-primary text-primary-foreground pl-2 pr-6 min-h-14 shadow-lg">
          <span className="w-10 h-10 rounded-full bg-card text-primary flex items-center justify-center flex-shrink-0"><Plus className="w-5 h-5" /></span>
          <span className="flex-1 text-center font-cinzel text-lg font-semibold">{t.s6AddNote}</span>
        </button>
      </div>

      {editing && (
        <NoteEditorSheet onClose={() => setEditing(false)} onSave={async (data) => { await onCreate(data); setEditing(false); }} />
      )}
    </div>
  );
}