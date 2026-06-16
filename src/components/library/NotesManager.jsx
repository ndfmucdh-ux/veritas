import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, FolderPlus, Folder, BookOpen, Trash2, SortAsc, Calendar, ChevronDown, ChevronUp, X, Check, Plus } from "lucide-react";
import { deleteNoteItem } from "@/lib/dataAccess";

const FOLDER_COLORS = ["#00f5ff", "#fbbf24", "#a78bfa", "#34d399", "#f87171", "#f472b6", "#fb923c"];
const FOLDER_ICONS = ["📁", "✝️", "🙏", "📖", "⭐", "🔥", "💎", "🌿", "🕊️"];

export default function NotesManager({ notes, onNotesChange }) {
  // NOTE: folders are stored in localStorage only — not synced to the DB.
  // This means they are device-local. Acceptable for a personal organizer feature.
  const [folders, setFolders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("veritas_note_folders") || "[]"); } catch { return []; }
  });
  const [expandedFolder, setExpandedFolder] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📁");
  const [newColor, setNewColor] = useState("#00f5ff");
  const [sortBy, setSortBy] = useState("date"); // "date" | "alpha"
  const [addingToFolder, setAddingToFolder] = useState(null);

  const saveFolders = (updated) => {
    setFolders(updated);
    localStorage.setItem("veritas_note_folders", JSON.stringify(updated));
  };

  const createFolder = () => {
    if (!newName.trim()) return;
    // Use crypto.randomUUID if available, fall back to timestamp+random for uniqueness
    const id = typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const folder = { id, name: newName.trim(), icon: newIcon, color: newColor, noteIds: [], createdAt: new Date().toISOString() };
    saveFolders([folder, ...folders]);
    setNewName(""); setNewIcon("📁"); setNewColor("#00f5ff");
    setShowCreate(false);
  };

  const deleteFolder = (id) => saveFolders(folders.filter(f => f.id !== id));

  const addNoteToFolder = (folderId, noteId) => {
    const updated = folders.map(f => {
      if (f.id !== folderId) return f;
      const ids = new Set(f.noteIds || []);
      ids.add(noteId);
      return { ...f, noteIds: [...ids] };
    });
    saveFolders(updated);
    setAddingToFolder(null);
  };

  const removeNoteFromFolder = (folderId, noteId) => {
    const updated = folders.map(f => {
      if (f.id !== folderId) return f;
      return { ...f, noteIds: (f.noteIds || []).filter(id => id !== noteId) };
    });
    saveFolders(updated);
  };

  const deleteNote = async (id) => {
    const item = notes.find(n => n.id === id) || { id };
    await deleteNoteItem(item);
    onNotesChange(notes.filter(n => n.id !== id));
    // Remove from all folders too
    saveFolders(folders.map(f => ({ ...f, noteIds: (f.noteIds || []).filter(nid => nid !== id) })));
  };

  const sortedFolders = [...folders].sort((a, b) =>
    sortBy === "alpha" ? a.name.localeCompare(b.name) : new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Unfiled notes
  const filedIds = new Set(folders.flatMap(f => f.noteIds || []));
  const unfiledNotes = notes.filter(n => !filedIds.has(n.id));
  const sortedUnfiled = [...unfiledNotes].sort((a, b) =>
    sortBy === "alpha"
      ? (a.verse_ref || "").localeCompare(b.verse_ref || "")
      : new Date(b.created_date) - new Date(a.created_date)
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={() => setSortBy("date")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-cinzel transition-all"
            style={{ background: sortBy === "date" ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.05)", color: sortBy === "date" ? "#00f5ff" : "rgba(255,255,255,0.4)", border: sortBy === "date" ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent" }}>
            <Calendar className="w-3.5 h-3.5" /> Date
          </button>
          <button onClick={() => setSortBy("alpha")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-cinzel transition-all"
            style={{ background: sortBy === "alpha" ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.05)", color: sortBy === "alpha" ? "#00f5ff" : "rgba(255,255,255,0.4)", border: sortBy === "alpha" ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent" }}>
            <SortAsc className="w-3.5 h-3.5" /> A–Z
          </button>
        </div>
        <button onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-cinzel transition-all"
          style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}>
          <FolderPlus className="w-3.5 h-3.5" /> New Folder
        </button>
      </div>

      {/* Create folder panel */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl"
            style={{ border: "1px solid rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.05)" }}>
            <div className="p-4 space-y-3">
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Folder name (e.g. 'Sermon Notes', 'Romans Study')"
                className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
                autoFocus onKeyDown={e => e.key === "Enter" && createFolder()}
              />
              <div className="flex gap-2 flex-wrap">
                {FOLDER_ICONS.map(em => (
                  <button key={em} onClick={() => setNewIcon(em)}
                    className="w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all"
                    style={{ background: newIcon === em ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.05)", border: newIcon === em ? "1px solid rgba(167,139,250,0.4)" : "1px solid transparent" }}>
                    {em}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {FOLDER_COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)}
                    className="w-6 h-6 rounded-full transition-all"
                    style={{ background: c, boxShadow: newColor === c ? `0 0 0 2px #07080f, 0 0 0 3.5px ${c}` : "none" }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-xl text-sm font-cinzel" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>Cancel</button>
                <button onClick={createFolder} disabled={!newName.trim()}
                  className="flex-1 py-2 rounded-xl text-sm font-cinzel flex items-center justify-center gap-2"
                  style={{ background: `${newColor}22`, color: newColor, border: `1px solid ${newColor}44` }}>
                  <Check className="w-4 h-4" /> Create
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folders */}
      {sortedFolders.map(folder => {
        const folderNotes = notes.filter(n => (folder.noteIds || []).includes(n.id));
        const isExpanded = expandedFolder === folder.id;
        return (
          <div key={folder.id} className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${folder.color}22` }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => setExpandedFolder(isExpanded ? null : folder.id)}
                className="flex items-center gap-3 flex-1 text-left">
                <span className="text-xl">{folder.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-cinzel text-sm font-semibold text-white">{folder.name}</p>
                  <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>{folderNotes.length} note{folderNotes.length !== 1 ? "s" : ""}</p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />}
              </button>
              <button onClick={() => setAddingToFolder(addingToFolder === folder.id ? null : folder.id)}
                className="p-1.5 rounded-lg transition-colors" style={{ color: folder.color }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => deleteFolder(folder.id)} className="p-1.5 rounded-lg" style={{ color: "rgba(255,255,255,0.25)" }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add note picker */}
            <AnimatePresence>
              {addingToFolder === folder.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <p className="text-[9px] font-cinzel uppercase tracking-widest pt-2 mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>Add a note to this folder</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-hide">
                      {notes.filter(n => !(folder.noteIds || []).includes(n.id)).map(n => (
                        <button key={n.id} onClick={() => addNoteToFolder(folder.id, n.id)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs transition-all hover:bg-white/5"
                          style={{ border: `1px solid ${folder.color}18` }}>
                          <p className="font-cinzel" style={{ color: folder.color }}>{n.verse_ref || "Untitled"}</p>
                          <p className="font-inter text-white/40 truncate">{n.note_text?.slice(0, 60)}</p>
                        </button>
                      ))}
                      {notes.filter(n => !(folder.noteIds || []).includes(n.id)).length === 0 && (
                        <p className="text-xs font-inter text-center py-3" style={{ color: "rgba(255,255,255,0.25)" }}>All notes are already in this folder</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notes in folder */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    {folderNotes.length === 0 ? (
                      <p className="text-xs font-inter text-center py-4" style={{ color: "rgba(255,255,255,0.25)" }}>No notes yet — tap + to add</p>
                    ) : folderNotes.map(note => (
                      <div key={note.id} className="flex items-start gap-2 rounded-xl p-3 mt-2"
                        style={{ background: `${folder.color}08`, border: `1px solid ${folder.color}18` }}>
                        <div className="flex-1 min-w-0">
                          <p className="font-cinzel text-xs mb-1" style={{ color: folder.color }}>{note.verse_ref || "Note"}</p>
                          <p className="text-xs font-inter leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.65)" }}>{note.note_text}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <a href={`/read?book=${note.book}&chapter=${note.chapter}`} className="p-1 rounded-lg" style={{ color: "rgba(255,255,255,0.3)" }}>
                            <BookOpen className="w-3 h-3" />
                          </a>
                          <button onClick={() => removeNoteFromFolder(folder.id, note.id)} className="p-1 rounded-lg" style={{ color: "rgba(255,255,255,0.25)" }}>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Unfiled notes */}
      <div>
        <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
          Unfiled Notes ({sortedUnfiled.length})
        </p>
        {sortedUnfiled.length === 0 && notes.length === 0 && (
          <div className="flex flex-col items-center py-10 gap-3">
            <StickyNote className="w-8 h-8" style={{ color: "rgba(255,255,255,0.15)" }} />
            <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>No notes yet</p>
          </div>
        )}
        <div className="space-y-2">
          {sortedUnfiled.map(note => (
            <div key={note.id} className="glass rounded-xl p-3 border border-border/50 flex items-start gap-3">
              <StickyNote className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#a78bfa" }} />
              <div className="flex-1 min-w-0">
                <p className="font-cinzel text-xs mb-1" style={{ color: "#a78bfa" }}>{note.verse_ref || "Note"}</p>
                <p className="text-xs font-inter leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.65)" }}>{note.note_text}</p>
                <p className="text-[10px] font-inter mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {new Date(note.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <button onClick={() => deleteNote(note.id)} className="p-1 rounded-lg flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}