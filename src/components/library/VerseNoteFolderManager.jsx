/**
 * VerseNoteFolderManager
 * Full folder management for both saved verses AND notes.
 * Supports drag-and-drop via @hello-pangea/dnd, CRUD folders, custom names/icons/colors.
 */
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Pencil, BookOpen, X, Check, Loader2,
  ChevronDown, ChevronUp, FolderOpen, GripVertical, StickyNote, Bookmark
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LoadingState } from "@/components/ui/states";

const THEMES = [
  { name: "Favorite Promises", icon: "⭐", color: "#fbbf24" },
  { name: "Hope in Hardship",  icon: "🕊️", color: "#60a5fa" },
  { name: "Identity in Christ",icon: "✝️", color: "#00f5ff" },
  { name: "Prayers for Family",icon: "🙏", color: "#a78bfa" },
  { name: "Healing Verses",    icon: "💚", color: "#34d399" },
  { name: "Fear & Courage",    icon: "⚔️", color: "#f87171" },
  { name: "Gratitude & Praise",icon: "🌟", color: "#fbbf24" },
  { name: "God's Faithfulness",icon: "🌿", color: "#34d399" },
];

const ICONS  = ["📁","⭐","🕊️","🌿","✝️","🙏","💚","⚔️","🌟","🔥","💎","📖","🎯","🌈","✨","🦁"];
const COLORS = ["#fbbf24","#00f5ff","#a78bfa","#34d399","#f87171","#fb923c","#f472b6","#60a5fa"];

export default function VerseNoteFolderManager({ highlights = [], notes = [] }) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [expandedFolder, setExpandedFolder] = useState(null);
  const [addingTo, setAddingTo] = useState(null);   // { folderId, type: "verse"|"note" }
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📁");
  const [newColor, setNewColor] = useState("#00f5ff");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.VerseFolder.list("-created_date", 50)
      .then(f => setFolders(f || []))
      .finally(() => setLoading(false));
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────

  const openCreate = (theme = null) => {
    setNewName(theme?.name || "");
    setNewIcon(theme?.icon || "📁");
    setNewColor(theme?.color || "#00f5ff");
    setEditingFolder(null);
    setShowCreate(true);
  };

  const openEdit = (folder) => {
    setNewName(folder.name);
    setNewIcon(folder.icon || "📁");
    setNewColor(folder.color || "#00f5ff");
    setEditingFolder(folder);
    setShowCreate(true);
  };

  const saveFolder = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    if (editingFolder) {
      await base44.entities.VerseFolder.update(editingFolder.id, {
        name: newName.trim(), icon: newIcon, color: newColor,
      });
      setFolders(prev => prev.map(f =>
        f.id === editingFolder.id ? { ...f, name: newName.trim(), icon: newIcon, color: newColor } : f
      ));
    } else {
      const created = await base44.entities.VerseFolder.create({
        name: newName.trim(), icon: newIcon, color: newColor, verse_refs: [],
      });
      setFolders(prev => [created, ...prev]);
    }
    setSaving(false);
    setShowCreate(false);
    setEditingFolder(null);
  };

  const deleteFolder = async (id) => {
    await base44.entities.VerseFolder.delete(id);
    setFolders(prev => prev.filter(f => f.id !== id));
  };

  const removeRef = async (folder, ref) => {
    const updated = (folder.verse_refs || []).filter(r => r !== ref);
    await base44.entities.VerseFolder.update(folder.id, { verse_refs: updated });
    setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, verse_refs: updated } : f));
  };

  const addRef = async (folder, ref) => {
    const existing = new Set(folder.verse_refs || []);
    if (existing.has(ref)) return;
    existing.add(ref);
    const updated = [...existing];
    await base44.entities.VerseFolder.update(folder.id, { verse_refs: updated });
    setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, verse_refs: updated } : f));
    setAddingTo(null);
  };

  // ── Drag & Drop ───────────────────────────────────────────────

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    // draggableId = "verse::<ref>" or "note::<verseRef>"
    const ref = draggableId.split("::")[1];
    const targetFolder = folders.find(f => f.id === destination.droppableId);
    if (!targetFolder) return;
    await addRef(targetFolder, ref);
  };

  if (loading) return <LoadingState label="Loading folders…" size="md" />;

  // Build palette of items available for adding
  const verseItems = highlights.map(h => ({ id: `verse::${h.verse_ref}`, ref: h.verse_ref, type: "verse", color: h.color }));
  const noteItems  = notes.map(n => ({ id: `note::${n.verse_ref}`, ref: n.verse_ref, type: "note", text: n.note_text }));

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-cinzel text-sm font-semibold text-white">Study Folders</p>
            <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Drag verses or notes into folders to organise by topic
            </p>
          </div>
          {!showCreate && (
            <button onClick={() => openCreate()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-cinzel text-xs transition-all"
              style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.25)" }}>
              <Plus className="w-3.5 h-3.5" /> New Folder
            </button>
          )}
        </div>

        {/* ── Create/Edit Form ── */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-2xl"
              style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.2)" }}>
              <div className="p-4 space-y-3">
                <p className="font-cinzel text-sm font-semibold text-white">{editingFolder ? "Edit Folder" : "Create Folder"}</p>

                {/* Theme suggestions */}
                {!editingFolder && (
                  <div className="flex flex-wrap gap-1.5">
                    {THEMES.map(t => (
                      <button key={t.name}
                        onClick={() => { setNewName(t.name); setNewIcon(t.icon); setNewColor(t.color); }}
                        className="text-[10px] px-2.5 py-1 rounded-full font-cinzel flex items-center gap-1 transition-all"
                        style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }}>
                        {t.icon} {t.name}
                      </button>
                    ))}
                  </div>
                )}

                <input value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Folder name…"
                  className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                  style={{ background: "var(--fill-2)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && saveFolder()}
                />

                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-[9px] font-cinzel uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Icon</p>
                    <div className="flex flex-wrap gap-1">
                      {ICONS.map(em => (
                        <button key={em} onClick={() => setNewIcon(em)}
                          className="w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all"
                          style={{ background: newIcon === em ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)", border: newIcon === em ? "1px solid rgba(0,245,255,0.4)" : "1px solid transparent" }}>
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-cinzel uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Color</p>
                    <div className="flex flex-wrap gap-1.5">
                      {COLORS.map(c => (
                        <button key={c} onClick={() => setNewColor(c)}
                          className="w-6 h-6 rounded-full transition-all"
                          style={{ background: c, boxShadow: newColor === c ? `0 0 0 2px hsl(var(--surface-4)), 0 0 0 3.5px ${c}` : "none" }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={() => { setShowCreate(false); setEditingFolder(null); }}
                    className="flex-1 py-2 rounded-xl font-cinzel text-sm"
                    style={{ background: "var(--fill-2)", color: "rgba(255,255,255,0.4)" }}>
                    Cancel
                  </button>
                  <button onClick={saveFolder} disabled={!newName.trim() || saving}
                    className="flex-1 py-2 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2"
                    style={{ background: `${newColor}20`, color: newColor, border: `1px solid ${newColor}40` }}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {editingFolder ? "Save" : "Create"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty state ── */}
        {folders.length === 0 && !showCreate && (
          <div className="rounded-2xl p-5" style={{ background: "rgba(0,245,255,0.03)", border: "1px dashed rgba(0,245,255,0.15)" }}>
            <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
              Quick Start — Suggested Themes
            </p>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.slice(0, 6).map(t => (
                <button key={t.name} onClick={() => openCreate(t)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{ background: `${t.color}10`, border: `1px solid ${t.color}25` }}>
                  <span className="text-lg flex-shrink-0">{t.icon}</span>
                  <span className="text-xs font-cinzel leading-tight" style={{ color: t.color }}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Draggable Source Pool ── */}
        {(verseItems.length > 0 || noteItems.length > 0) && folders.length > 0 && (
          <div className="rounded-2xl p-3" style={{ background: "var(--fill-1)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
              🖱️ Drag items below into folders above
            </p>
            <Droppable droppableId="source-pool" isDropDisabled>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-wrap gap-2">
                  {verseItems.map((item, idx) => (
                    <Draggable key={item.id} draggableId={item.id} index={idx}>
                      {(drag, snapshot) => (
                        <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl cursor-grab active:cursor-grabbing text-xs font-cinzel transition-all"
                          style={{
                            background: snapshot.isDragging ? "rgba(0,245,255,0.2)" : "rgba(0,245,255,0.07)",
                            border: "1px solid rgba(0,245,255,0.25)",
                            color: "#00f5ff",
                            boxShadow: snapshot.isDragging ? "0 8px 24px rgba(0,0,0,0.5)" : "none",
                          }}>
                          <GripVertical className="w-3 h-3 opacity-50" />
                          <Bookmark className="w-3 h-3" />
                          {item.ref}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {noteItems.map((item, idx) => (
                    <Draggable key={item.id} draggableId={item.id} index={verseItems.length + idx}>
                      {(drag, snapshot) => (
                        <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl cursor-grab active:cursor-grabbing text-xs font-cinzel transition-all"
                          style={{
                            background: snapshot.isDragging ? "rgba(167,139,250,0.2)" : "rgba(167,139,250,0.07)",
                            border: "1px solid rgba(167,139,250,0.25)",
                            color: "#a78bfa",
                            boxShadow: snapshot.isDragging ? "0 8px 24px rgba(0,0,0,0.5)" : "none",
                          }}>
                          <GripVertical className="w-3 h-3 opacity-50" />
                          <StickyNote className="w-3 h-3" />
                          {item.ref}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        )}

        {/* ── Folder List (droppable targets) ── */}
        {folders.map((folder, i) => {
          const isExp = expandedFolder === folder.id;
          const refs = folder.verse_refs || [];
          const color = folder.color || "#00f5ff";

          return (
            <Droppable key={folder.id} droppableId={folder.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: snapshot.isDraggingOver ? `${color}12` : "rgba(255,255,255,0.03)",
                    border: snapshot.isDraggingOver ? `1px solid ${color}55` : `1px solid ${color}22`,
                    boxShadow: snapshot.isDraggingOver ? `0 0 20px ${color}18` : "none",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 p-4">
                    <button onClick={() => setExpandedFolder(isExp ? null : folder.id)}
                      className="flex items-center gap-3 flex-1 text-left">
                      <span className="text-2xl flex-shrink-0">{folder.icon || "📁"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-cinzel text-sm font-semibold text-white">{folder.name}</p>
                        <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {refs.length} item{refs.length !== 1 ? "s" : ""}
                          {snapshot.isDraggingOver && <span style={{ color }}> · Drop here</span>}
                        </p>
                      </div>
                      {isExp
                        ? <ChevronUp className="w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                        : <ChevronDown className="w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                      }
                    </button>
                    <button onClick={() => openEdit(folder)} className="p-1.5 rounded-lg hover:bg-white/10"
                      style={{ color: "rgba(255,255,255,0.3)" }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteFolder(folder.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"
                      style={{ color: "rgba(255,255,255,0.3)" }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Expanded content */}
                  {isExp && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      {refs.length === 0 ? (
                        <div className="py-5 text-center">
                          <FolderOpen className="w-6 h-6 mx-auto mb-2" style={{ color: "rgba(255,255,255,0.15)" }} />
                          <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>
                            Drag verses or notes here, or use the Add buttons below
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 mt-3">
                          {refs.map(ref => (
                            <div key={ref} className="flex items-center justify-between px-3 py-2 rounded-xl"
                              style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                              <p className="text-xs font-cinzel flex-1 min-w-0 truncate" style={{ color }}>
                                · {ref}
                              </p>
                              <div className="flex gap-1 ml-2 flex-shrink-0">
                                <a href={`/read?book=${ref.split(" ")[0]}&chapter=${ref.split(" ")[1]?.split(":")[0] || 1}`}
                                  className="p-1 rounded-lg" style={{ color: "rgba(255,255,255,0.3)" }}>
                                  <BookOpen className="w-3 h-3" />
                                </a>
                                <button onClick={() => removeRef(folder, ref)}
                                  className="p-1 rounded-lg" style={{ color: "rgba(255,255,255,0.25)" }}>
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quick-add buttons */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setAddingTo(addingTo?.folderId === folder.id && addingTo.type === "verse" ? null : { folderId: folder.id, type: "verse" })}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-cinzel text-xs transition-all"
                          style={{ background: "rgba(0,245,255,0.06)", color: "#00f5ff", border: "1px dashed rgba(0,245,255,0.25)" }}>
                          <Bookmark className="w-3.5 h-3.5" /> Add Verse
                        </button>
                        <button
                          onClick={() => setAddingTo(addingTo?.folderId === folder.id && addingTo.type === "note" ? null : { folderId: folder.id, type: "note" })}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-cinzel text-xs transition-all"
                          style={{ background: "rgba(167,139,250,0.06)", color: "#a78bfa", border: "1px dashed rgba(167,139,250,0.25)" }}>
                          <StickyNote className="w-3.5 h-3.5" /> Add Note
                        </button>
                      </div>

                      {/* Quick-add picker */}
                      {addingTo?.folderId === folder.id && (
                        <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide">
                          {(addingTo.type === "verse" ? verseItems : noteItems)
                            .filter(item => !refs.includes(item.ref))
                            .map(item => (
                              <button key={item.id}
                                onClick={() => addRef(folder, item.ref)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all hover:bg-white/5"
                                style={{ border: `1px solid rgba(255,255,255,0.07)` }}>
                                {addingTo.type === "verse"
                                  ? <Bookmark className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#00f5ff" }} />
                                  : <StickyNote className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#a78bfa" }} />
                                }
                                <span className="text-xs font-cinzel flex-1 min-w-0 truncate" style={{ color: "rgba(255,255,255,0.7)" }}>
                                  {item.ref}
                                </span>
                                <Plus className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
                              </button>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}