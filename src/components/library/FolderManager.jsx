import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Pencil, BookOpen, X, Check, Loader2, ChevronDown, ChevronUp, FolderOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { EmptyState } from "@/components/ui/states";

const FOLDER_THEMES = [
  { name: "Favorite Promises", icon: "⭐", color: "#fbbf24" },
  { name: "Hope in Hardship", icon: "🕊️", color: "#60a5fa" },
  { name: "God's Faithfulness", icon: "🌿", color: "#34d399" },
  { name: "Identity in Christ", icon: "✝️", color: "#00f5ff" },
  { name: "Prayers for Family", icon: "🙏", color: "#a78bfa" },
  { name: "Healing Verses", icon: "💚", color: "#34d399" },
  { name: "Fear & Courage", icon: "⚔️", color: "#f87171" },
  { name: "Gratitude & Praise", icon: "🌟", color: "#fbbf24" },
];

const ICONS = ["📁","⭐","🕊️","🌿","✝️","🙏","💚","⚔️","🌟","🔥","💎","📖","🎯","🌈"];
const COLORS = ["#fbbf24","#00f5ff","#a78bfa","#34d399","#f87171","#fb923c","#f472b6","#60a5fa"];

const HIGHLIGHT_COLOR_HEX = {
  yellow: "#fbbf24", cyan: "#00e5ff", purple: "#a78bfa",
  green: "#34d399", red: "#f87171", orange: "#fb923c", pink: "#f472b6",
};

export default function FolderManager({ folders, highlights, onFoldersChange }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [expandedFolder, setExpandedFolder] = useState(null);
  const [addingHighlights, setAddingHighlights] = useState(null); // folder id
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📁");
  const [newColor, setNewColor] = useState("#00f5ff");
  const [saving, setSaving] = useState(false);

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
      const updated = await base44.entities.VerseFolder.update(editingFolder.id, {
        name: newName.trim(), icon: newIcon, color: newColor,
      });
      onFoldersChange(folders.map(f => f.id === editingFolder.id ? { ...f, name: newName.trim(), icon: newIcon, color: newColor } : f));
    } else {
      const created = await base44.entities.VerseFolder.create({
        name: newName.trim(), icon: newIcon, color: newColor, verse_refs: [],
      });
      onFoldersChange([created, ...folders]);
    }
    setSaving(false);
    setShowCreate(false);
    setEditingFolder(null);
  };

  const deleteFolder = async (id) => {
    await base44.entities.VerseFolder.delete(id);
    onFoldersChange(folders.filter(f => f.id !== id));
  };

  const removeVerseFromFolder = async (folder, ref) => {
    const updated = (folder.verse_refs || []).filter(r => r !== ref);
    await base44.entities.VerseFolder.update(folder.id, { verse_refs: updated });
    onFoldersChange(folders.map(f => f.id === folder.id ? { ...f, verse_refs: updated } : f));
  };

  const addHighlightToFolder = async (folder, verseRef) => {
    const existing = new Set(folder.verse_refs || []);
    if (existing.has(verseRef)) return;
    existing.add(verseRef);
    const updated = [...existing];
    await base44.entities.VerseFolder.update(folder.id, { verse_refs: updated });
    onFoldersChange(folders.map(f => f.id === folder.id ? { ...f, verse_refs: updated } : f));
  };

  return (
    <div className="space-y-3">
      {/* Quick theme suggestions */}
      {folders.length === 0 && !showCreate && (
        <div className="rounded-2xl p-4" style={{ background: "rgba(0,245,255,0.04)", border: "1px dashed rgba(0,245,255,0.15)" }}>
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Quick Start — Suggested Themes</p>
          <div className="grid grid-cols-2 gap-2">
            {FOLDER_THEMES.map(t => (
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

      {/* Create / Edit form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl"
            style={{ border: "1px solid rgba(0,245,255,0.2)", background: "rgba(0,245,255,0.04)" }}>
            <div className="p-4 space-y-3">
              <p className="font-cinzel text-sm font-semibold text-white">{editingFolder ? "Edit Folder" : "New Folder"}</p>

              {/* Quick theme pills */}
              {!editingFolder && (
                <div className="flex flex-wrap gap-1.5">
                  {FOLDER_THEMES.map(t => (
                    <button key={t.name} onClick={() => { setNewName(t.name); setNewIcon(t.icon); setNewColor(t.color); }}
                      className="text-[10px] px-2.5 py-1 rounded-full font-cinzel flex items-center gap-1"
                      style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }}>
                      {t.icon} {t.name}
                    </button>
                  ))}
                </div>
              )}

              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Folder name..."
                className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
                autoFocus
              />

              <div className="flex gap-3">
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
                        style={{ background: c, boxShadow: newColor === c ? `0 0 0 2px #07080f, 0 0 0 3.5px ${c}` : "none" }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => { setShowCreate(false); setEditingFolder(null); }}
                  className="flex-1 py-2 rounded-xl font-cinzel text-sm"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>Cancel</button>
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

      {/* Create button */}
      {!showCreate && (
        <button onClick={() => openCreate()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-cinzel text-sm transition-all"
          style={{ background: "rgba(0,245,255,0.05)", border: "1px dashed rgba(0,245,255,0.25)", color: "#00f5ff" }}>
          <Plus className="w-4 h-4" /> New Folder
        </button>
      )}

      {/* Folder list */}
      {folders.map((folder, i) => {
        const isExpanded = expandedFolder === folder.id;
        const isAddingHL = addingHighlights === folder.id;
        const refs = folder.verse_refs || [];

        // Highlights not yet in this folder
        const availableHighlights = highlights.filter(h => !refs.includes(h.verse_ref));

        return (
          <motion.div key={folder.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${folder.color || "#00f5ff"}22` }}>
            {/* Header row */}
            <div className="flex items-center gap-3 p-4">
              <button onClick={() => setExpandedFolder(isExpanded ? null : folder.id)}
                className="flex items-center gap-3 flex-1 text-left">
                <span className="text-2xl flex-shrink-0">{folder.icon || "📁"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-cinzel text-sm font-semibold text-white">{folder.name}</p>
                  <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {refs.length} verse{refs.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />}
              </button>
              <button onClick={() => openEdit(folder)} className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => deleteFolder(folder.id)} className="p-1.5 rounded-lg transition-colors hover:bg-destructive/10"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                  <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>

                    {/* Verses in folder */}
                    {refs.length === 0 ? (
                      <div className="py-4 text-center">
                        <FolderOpen className="w-6 h-6 mx-auto mb-2" style={{ color: "rgba(255,255,255,0.15)" }} />
                        <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>Empty folder. Add highlighted verses below.</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 mt-3">
                        {refs.map(ref => (
                          <div key={ref} className="flex items-center justify-between px-3 py-2 rounded-xl"
                            style={{ background: `${folder.color || "#00f5ff"}08`, border: `1px solid ${folder.color || "#00f5ff"}18` }}>
                            <p className="text-xs font-cinzel" style={{ color: folder.color || "#00f5ff" }}>· {ref}</p>
                            <div className="flex gap-1">
                              <a href={`/read?book=${ref.split(" ")[0]}&chapter=${ref.split(" ")[1]?.split(":")[0] || 1}`}
                                className="p-1 rounded-lg" style={{ color: "rgba(255,255,255,0.3)" }}>
                                <BookOpen className="w-3 h-3" />
                              </a>
                              <button onClick={() => removeVerseFromFolder(folder, ref)}
                                className="p-1 rounded-lg" style={{ color: "rgba(255,255,255,0.25)" }}>
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add highlights button */}
                    <button onClick={() => setAddingHighlights(isAddingHL ? null : folder.id)}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl font-cinzel text-xs transition-all"
                      style={{ background: isAddingHL ? `${folder.color || "#00f5ff"}15` : "rgba(255,255,255,0.04)", color: folder.color || "#00f5ff", border: `1px dashed ${folder.color || "#00f5ff"}35` }}>
                      <Plus className="w-3.5 h-3.5" /> Add Highlighted Verses
                    </button>

                    {/* Highlight picker */}
                    <AnimatePresence>
                      {isAddingHL && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="mt-2 space-y-1.5 max-h-52 overflow-y-auto scrollbar-hide">
                            {availableHighlights.length === 0 ? (
                              <p className="text-xs font-inter text-center py-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                                All your highlights are already in this folder
                              </p>
                            ) : (
                              availableHighlights.map(hl => {
                                const borderColor = HIGHLIGHT_COLOR_HEX[hl.color] || "#fbbf24";
                                return (
                                  <button key={hl.id} onClick={() => addHighlightToFolder(folder, hl.verse_ref)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all hover:bg-white/5"
                                    style={{ border: `1px solid ${borderColor}20`, borderLeft: `3px solid ${borderColor}` }}>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-cinzel" style={{ color: borderColor }}>{hl.verse_ref}</p>
                                      <p className="text-[10px] font-inter capitalize" style={{ color: "rgba(255,255,255,0.3)" }}>{hl.color}</p>
                                    </div>
                                    <Plus className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {folders.length === 0 && !showCreate && (
        <EmptyState
          icon="📁"
          title="No folders yet"
          description="Create thematic folders to organize your highlighted verses into meaningful collections"
        />
      )}
    </div>
  );
}