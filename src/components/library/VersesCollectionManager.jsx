import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Play, Pause, Trash2, X, Loader2, Check, FolderPlus, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PRESET_COLLECTIONS = [
  { name: "Comfort", icon: "🕊️", color: "#a78bfa" },
  { name: "Promises", icon: "⭐", color: "#fbbf24" },
  { name: "Courage", icon: "🔥", color: "#f97316" },
  { name: "Wisdom", icon: "💎", color: "#00f5ff" },
  { name: "Healing", icon: "💚", color: "#34d399" },
  { name: "Praise", icon: "🎉", color: "#f472b6" },
];

const ICONS = ["📚", "💎", "🙏", "❤️", "⭐", "🔥", "✨", "💫", "🕊️", "🌿"];
const COLORS = ["#00f5ff", "#fbbf24", "#a78bfa", "#34d399", "#f87171", "#f472b6", "#f97316"];

export default function VersesCollectionManager() {
  const [collections, setCollections] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📚");
  const [newColor, setNewColor] = useState("#00f5ff");
  const [playingId, setPlayingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [addingFolderTo, setAddingFolderTo] = useState(null); // collection id
  const [selectedFolder, setSelectedFolder] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.VerseCollection.list("-updated_date", 50).catch(() => []),
      base44.entities.VerseFolder.list("-created_date", 30).catch(() => []),
    ]).then(([c, f]) => {
      setCollections(c || []);
      setFolders(f || []);
    }).finally(() => setLoading(false));
  }, []);

  const createCollection = async (name, icon, color) => {
    await base44.entities.VerseCollection.create({ name, icon, color, verse_refs: [], verse_count: 0, play_order: [] });
    const data = await base44.entities.VerseCollection.list("-updated_date", 50).catch(() => []);
    setCollections(data || []);
    setNewName(""); setNewIcon("📚"); setNewColor("#00f5ff");
    setShowCreateForm(false);
  };

  const deleteCollection = async (id) => {
    await base44.entities.VerseCollection.delete(id);
    setCollections(c => c.filter(col => col.id !== id));
  };

  const addFolderVerses = async (collection, folder) => {
    const existing = new Set(collection.verse_refs || []);
    (folder.verse_refs || []).forEach(r => existing.add(r));
    const refs = [...existing];
    await base44.entities.VerseCollection.update(collection.id, { verse_refs: refs, verse_count: refs.length, play_order: refs });
    setCollections(c => c.map(col => col.id === collection.id ? { ...col, verse_refs: refs, verse_count: refs.length } : col));
    setAddingFolderTo(null);
    setSelectedFolder(null);
  };

  const playCollection = (collection) => {
    if (!collection.verse_refs?.length) return;
    setPlayingId(collection.id);
    const text = collection.verse_refs.join(" ... ");
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.8;
    utt.onend = () => setPlayingId(null);
    window.speechSynthesis.speak(utt);
  };

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-cyan" /></div>;

  return (
    <div className="space-y-4">
      {/* Preset quick-create row */}
      <div>
        <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Quick create</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLLECTIONS.filter(p => !collections.find(c => c.name === p.name)).map(p => (
            <button key={p.name} onClick={() => createCollection(p.name, p.icon, p.color)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-cinzel transition-all"
              style={{ background: `${p.color}12`, color: p.color, border: `1px solid ${p.color}30` }}>
              {p.icon} {p.name}
            </button>
          ))}
          {PRESET_COLLECTIONS.every(p => collections.find(c => c.name === p.name)) && (
            <p className="text-xs font-inter text-white/30">All presets created</p>
          )}
        </div>
      </div>

      {/* Create custom */}
      <motion.button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="w-full py-3 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2 transition-all"
        style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.2)" }}>
        <Plus className="w-4 h-4" /> Custom Collection
      </motion.button>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-4 space-y-3 overflow-hidden"
            style={{ background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.18)" }}>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Collection name (e.g., Comfort, Promises)"
              className="w-full px-3 py-2.5 rounded-lg text-sm font-inter focus:outline-none"
              style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,245,255,0.2)", color: "rgba(255,255,255,0.8)" }} />
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setNewIcon(ic)}
                  className="text-xl p-2 rounded-lg transition-all"
                  style={{ background: newIcon === ic ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)" }}>
                  {ic}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)}
                  className="w-8 h-8 rounded-lg transition-all"
                  style={{ background: c, border: newColor === c ? "2px solid rgba(255,255,255,0.5)" : "1px solid transparent", transform: newColor === c ? "scale(1.1)" : "scale(1)" }} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => createCollection(newName, newIcon, newColor)} disabled={!newName.trim()}
                className="flex-1 py-2.5 rounded-lg font-cinzel text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                <Check className="w-4 h-4" /> Create
              </button>
              <button onClick={() => setShowCreateForm(false)}
                className="flex-1 py-2.5 rounded-lg font-cinzel text-sm"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collections list */}
      <div className="space-y-3">
        {collections.length === 0 ? (
          <p className="text-center text-white/35 py-8 text-sm font-inter">No collections yet. Use the quick presets above or create a custom one.</p>
        ) : collections.map(col => (
          <motion.div key={col.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: `${col.color}08`, border: `1px solid ${col.color}25` }}>
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="text-2xl">{col.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-cinzel font-semibold text-white">{col.name}</p>
                <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>{col.verse_count || 0} verses</p>
              </div>
              <div className="flex items-center gap-1.5">
                {(col.verse_refs?.length > 0) && (
                  <motion.button onClick={() => playCollection(col)} disabled={playingId === col.id} whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg transition-all" style={{ background: `${col.color}18`, color: col.color }}>
                    {playingId === col.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  </motion.button>
                )}
                <button onClick={() => setExpandedId(expandedId === col.id ? null : col.id)}
                  className="p-2 rounded-lg transition-all" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)" }}>
                  <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: expandedId === col.id ? "rotate(180deg)" : "none" }} />
                </button>
                <button onClick={() => deleteCollection(col.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-4 h-4 text-red-500/60" />
                </button>
              </div>
            </div>

            {/* Expanded: verse list + add from folder */}
            <AnimatePresence>
              {expandedId === col.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1 space-y-2 border-t" style={{ borderColor: `${col.color}20` }}>
                    {(col.verse_refs || []).length === 0 ? (
                      <p className="text-xs font-inter text-white/30 py-2">No verses yet. Add from a folder below.</p>
                    ) : (
                      <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-hide">
                        {(col.verse_refs || []).map((ref, i) => (
                          <p key={i} className="text-xs font-cinzel px-2 py-1 rounded-lg" style={{ color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.04)" }}>{ref}</p>
                        ))}
                      </div>
                    )}

                    {/* Add from folder */}
                    {addingFolderTo === col.id ? (
                      <div className="space-y-2 pt-1">
                        <p className="text-[9px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Add from folder</p>
                        <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-hide">
                          {folders.length === 0 ? (
                            <p className="text-xs text-white/30 font-inter">No folders yet. Save verses to a folder first.</p>
                          ) : folders.map(f => (
                            <button key={f.id} onClick={() => addFolderVerses(col, f)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
                              style={{ background: selectedFolder === f.id ? `${f.color || "#00f5ff"}15` : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                              <span>{f.icon || "📁"}</span>
                              <span className="font-cinzel text-xs text-white flex-1">{f.name}</span>
                              <span className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>{(f.verse_refs || []).length} verses</span>
                            </button>
                          ))}
                        </div>
                        <button onClick={() => setAddingFolderTo(null)}
                          className="text-xs font-cinzel px-3 py-1.5 rounded-lg"
                          style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.04)" }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingFolderTo(col.id)}
                        className="flex items-center gap-2 text-xs font-cinzel px-3 py-2 rounded-xl w-full transition-all"
                        style={{ background: `${col.color}10`, color: col.color, border: `1px dashed ${col.color}35` }}>
                        <FolderPlus className="w-3.5 h-3.5" /> Add from Folder
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}