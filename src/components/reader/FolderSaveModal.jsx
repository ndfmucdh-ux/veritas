import { useState, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderPlus, X, Check, Plus, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FOLDER_SUGGESTIONS = [
  { name: "Favorite Promises", icon: "⭐", color: "#fbbf24" },
  { name: "Difficult Passages", icon: "🔥", color: "#f87171" },
  { name: "Prayers for Family", icon: "🙏", color: "#a78bfa" },
  { name: "Healing Verses", icon: "💚", color: "#34d399" },
  { name: "Identity in Christ", icon: "✝️", color: "#00f5ff" },
];

export default function FolderSaveModal({ verseRefs, onClose, onSaved }) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📁");
  const [newColor, setNewColor] = useState("#00f5ff");
  const [creating, setCreating] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    base44.entities.VerseFolder.list("-created_date", 30)
      .then(f => setFolders(f || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const saveToFolder = async (folder) => {
    setSaving(folder.id);
    const existing = new Set(folder.verse_refs || []);
    verseRefs.forEach(r => existing.add(r));
    await base44.entities.VerseFolder.update(folder.id, { verse_refs: [...existing] });
    setSaving(null);
    onSaved?.(folder.name);
    onClose();
  };

  const createAndSave = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const folder = await base44.entities.VerseFolder.create({
      name: newName.trim(),
      icon: newIcon,
      color: newColor,
      verse_refs: verseRefs,
    });
    setCreating(false);
    onSaved?.(newName.trim());
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ maxHeight: "85vh", display: "flex", flexDirection: "column", background: "var(--popover-surface)", border: "1px solid rgba(0,245,255,0.15)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <p id={titleId} className="font-cinzel text-base font-bold text-white">Save to Folder</p>
            <p id={descriptionId} className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              {verseRefs.length} verse{verseRefs.length !== 1 ? "s" : ""} selected
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "var(--fill-3)", color: "rgba(255,255,255,0.4)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 overflow-y-auto scrollbar-hide flex-1" style={{ maxHeight: "calc(85vh - 80px)" }}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00f5ff" }} />
            </div>
          ) : (
            <>
              {folders.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[9px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Your Folders</p>
                  {folders.map(folder => (
                    <button key={folder.id} onClick={() => saveToFolder(folder)}
                      disabled={saving === folder.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                      style={{ background: "var(--fill-2)", border: `1px solid ${folder.color || "#00f5ff"}22` }}>
                      <span className="text-xl flex-shrink-0">{folder.icon || "📁"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-cinzel text-sm text-white">{folder.name}</p>
                        <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>{(folder.verse_refs || []).length} verses</p>
                      </div>
                      {saving === folder.id
                        ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: folder.color }} />
                        : <Check className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100" style={{ color: folder.color }} />
                      }
                    </button>
                  ))}
                </div>
              )}

              {/* Create new */}
              <AnimatePresence>
                {!showCreate ? (
                  <button onClick={() => setShowCreate(true)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
                    style={{ background: "rgba(0,245,255,0.05)", border: "1px dashed rgba(0,245,255,0.2)", color: "#00f5ff" }}>
                    <Plus className="w-4 h-4" />
                    <span className="font-cinzel text-sm">New Folder</span>
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                    <p className="text-[9px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Quick suggestions</p>
                    <div className="flex gap-2 flex-wrap">
                      {FOLDER_SUGGESTIONS.map(s => (
                        <button key={s.name} onClick={() => { setNewName(s.name); setNewIcon(s.icon); setNewColor(s.color); }}
                          className="text-xs px-2.5 py-1 rounded-lg font-inter flex items-center gap-1"
                          style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
                          {s.icon} {s.name}
                        </button>
                      ))}
                    </div>
                    <input
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="Folder name..."
                      className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                      style={{ background: "var(--fill-2)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      {["📁","⭐","🔥","🙏","💚","✝️","📖","💎","🌟","🕊️"].map(em => (
                        <button key={em} onClick={() => setNewIcon(em)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all"
                          style={{ background: newIcon === em ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)", border: newIcon === em ? "1px solid rgba(0,245,255,0.3)" : "1px solid transparent" }}>
                          {em}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowCreate(false)}
                        className="flex-1 py-2 rounded-xl text-sm font-cinzel"
                        style={{ background: "var(--fill-2)", color: "rgba(255,255,255,0.4)" }}>Cancel</button>
                      <button onClick={createAndSave} disabled={!newName.trim() || creating}
                        className="flex-1 py-2 rounded-xl text-sm font-cinzel flex items-center justify-center gap-2"
                        style={{ background: "rgba(0,245,255,0.15)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.3)" }}>
                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                        Create & Save
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}