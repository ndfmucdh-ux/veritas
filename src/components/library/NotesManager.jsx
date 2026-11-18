import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, FolderPlus, Folder, FolderOpen, Cross, Heart, BookOpen, Star, Leaf, Trash2, ChevronDown, ChevronUp, Check, Plus } from "lucide-react";
import { deleteNoteItem } from "@/lib/dataAccess";
import { EmptyState } from "@/components/ui/states";
import { useLang } from "@/lib/LanguageContext";
import NoteRow from "@/components/library/NoteRow";

const FOLDER_ICONS = { folder: Folder, open: FolderOpen, cross: Cross, heart: Heart, book: BookOpen, star: Star, leaf: Leaf };
const LOCALES = { en: "en-US", es: "es-ES", pt: "pt-BR", fr: "fr-FR", de: "de-DE" };

export default function NotesManager({ notes, onNotesChange }) {
  const { t, lang } = useLang();
  // Folders are device-local (localStorage); they are a personal organizer, not synced.
  const [folders, setFolders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("veritas_note_folders") || "[]"); } catch { return []; }
  });
  const [expandedFolder, setExpandedFolder] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("folder");
  const [sortBy, setSortBy] = useState("date");
  const [addingToFolder, setAddingToFolder] = useState(null);
  const locale = LOCALES[lang] || "en-US";

  const saveFolders = (updated) => {
    setFolders(updated);
    localStorage.setItem("veritas_note_folders", JSON.stringify(updated));
  };

  const createFolder = () => {
    if (!newName.trim()) return;
    const id = typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    saveFolders([{ id, name: newName.trim(), icon: newIcon, noteIds: [], createdAt: new Date().toISOString() }, ...folders]);
    setNewName(""); setNewIcon("folder"); setShowCreate(false);
  };

  const patchFolder = (folderId, fn) => saveFolders(folders.map((f) => (f.id === folderId ? { ...f, noteIds: fn(f.noteIds || []) } : f)));
  const addNoteToFolder = (folderId, noteId) => { patchFolder(folderId, (ids) => [...new Set([...ids, noteId])]); setAddingToFolder(null); };
  const removeNoteFromFolder = (folderId, noteId) => patchFolder(folderId, (ids) => ids.filter((id) => id !== noteId));
  const deleteFolder = (id) => saveFolders(folders.filter((f) => f.id !== id));

  const deleteNote = async (id) => {
    await deleteNoteItem(notes.find((n) => n.id === id) || { id });
    onNotesChange(notes.filter((n) => n.id !== id));
    saveFolders(folders.map((f) => ({ ...f, noteIds: (f.noteIds || []).filter((nid) => nid !== id) })));
  };

  const sortedFolders = [...folders].sort((a, b) => (sortBy === "alpha" ? a.name.localeCompare(b.name) : new Date(b.createdAt) - new Date(a.createdAt)));
  const filedIds = new Set(folders.flatMap((f) => f.noteIds || []));
  const sortedUnfiled = notes.filter((n) => !filedIds.has(n.id)).sort((a, b) =>
    sortBy === "alpha" ? (a.verse_ref || "").localeCompare(b.verse_ref || "") : new Date(b.created_date) - new Date(a.created_date)
  );

  const segment = (id, label) => (
    <button type="button" onClick={() => setSortBy(id)}
      className={`px-3.5 py-1.5 rounded-lg text-sm font-cinzel font-semibold transition-colors ${sortBy === id ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex p-1 rounded-xl bg-secondary border border-border">
          {segment("date", t.sortDate)}
          {segment("alpha", "A–Z")}
        </div>
        <button type="button" onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-cinzel font-semibold bg-primary text-primary-foreground">
          <FolderPlus className="w-4 h-4" /> {t.newFolder}
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl bg-card border border-border">
            <div className="p-4 space-y-3">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t.folderName} autoFocus
                onKeyDown={(e) => e.key === "Enter" && createFolder()}
                className="w-full rounded-xl px-3 py-2.5 bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontSize: "16px" }} />
              <div className="flex gap-2 flex-wrap">
                {Object.entries(FOLDER_ICONS).map(([id, Icon]) => (
                  <button type="button" key={id} onClick={() => setNewIcon(id)} aria-label={id}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${newIcon === id ? "bg-primary/15 border-primary text-primary" : "bg-secondary border-transparent text-muted-foreground"}`}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl text-sm font-cinzel font-semibold bg-secondary text-foreground/80">{t.cancel}</button>
                <button type="button" onClick={createFolder} disabled={!newName.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-cinzel font-semibold flex items-center justify-center gap-2 bg-primary text-primary-foreground disabled:opacity-50">
                  <Check className="w-4 h-4" /> {t.create}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sortedFolders.map((folder) => {
        const folderNotes = notes.filter((n) => (folder.noteIds || []).includes(n.id));
        const isExpanded = expandedFolder === folder.id;
        const FolderIcon = FOLDER_ICONS[folder.icon] || Folder;
        const available = notes.filter((n) => !(folder.noteIds || []).includes(n.id));
        return (
          <div key={folder.id} className="rounded-2xl overflow-hidden bg-card border border-border">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <button type="button" onClick={() => setExpandedFolder(isExpanded ? null : folder.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/12 text-primary flex-shrink-0"><FolderIcon className="w-5 h-5" /></span>
                <div className="flex-1 min-w-0">
                  <p className="font-cinzel text-base font-semibold text-foreground truncate">{folder.name}</p>
                  <p className="text-xs text-muted-foreground">{folderNotes.length} {folderNotes.length === 1 ? t.noteOne : t.noteMany}</p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button type="button" aria-label="Add" onClick={() => setAddingToFolder(addingToFolder === folder.id ? null : folder.id)} className="p-2 rounded-lg text-primary"><Plus className="w-4 h-4" /></button>
              <button type="button" aria-label="Delete folder" onClick={() => deleteFolder(folder.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>

            <AnimatePresence>
              {addingToFolder === folder.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-3 pt-2 border-t border-border">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t.addNoteHere}</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {available.map((n) => (
                        <button type="button" key={n.id} onClick={() => addNoteToFolder(folder.id, n.id)} className="w-full text-left px-3 py-2 rounded-xl bg-secondary">
                          <p className="font-cinzel text-sm font-semibold text-accent">{n.verse_ref || t.untitled}</p>
                          <p className="text-xs text-foreground/70 truncate">{n.note_text?.slice(0, 60)}</p>
                        </button>
                      ))}
                      {available.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">{t.allNotesFiled}</p>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 pt-3 border-t border-border space-y-2">
                    {folderNotes.length === 0
                      ? <p className="text-sm text-muted-foreground text-center py-3">{t.noNotesInFolder}</p>
                      : folderNotes.map((n) => <NoteRow key={n.id} note={n} t={t} locale={locale} onRemove={() => removeNoteFromFolder(folder.id, n.id)} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{t.unfiledNotes} ({sortedUnfiled.length})</p>
        {sortedUnfiled.length === 0 && notes.length === 0 && <EmptyState icon={StickyNote} title={t.noNotesYet} minHeight={140} />}
        <div className="space-y-2.5">
          {sortedUnfiled.map((n) => <NoteRow key={n.id} note={n} t={t} locale={locale} onDelete={() => deleteNote(n.id)} />)}
        </div>
      </div>
    </div>
  );
}