import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Play, Trash2, ChevronRight, X, Check, Loader2, BookOpen, Music2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { BIBLE_BOOKS } from "@/lib/bibleData";
import { LoadingState, EmptyState } from "@/components/ui/states";

const PLAYLIST_COLORS = ["#00f5ff", "#fbbf24", "#a78bfa", "#34d399", "#f97316", "#f472b6", "#60a5fa"];
const PLAYLIST_ICONS = ["🌅", "🌙", "📖", "🎵", "🙏", "✝️", "🕊️", "⭐", "🔥", "💎"];

const SUGGESTED = [
  { name: "Morning Worship",  icon: "🌅", color: "#fbbf24" },
  { name: "Evening Peace",    icon: "🌙", color: "#a78bfa" },
  { name: "Faith & Courage",  icon: "🔥", color: "#f97316" },
  { name: "Psalms of Praise", icon: "🎵", color: "#34d399" },
];

export default function AudioPlaylists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [showAddItem, setShowAddItem] = useState(null); // playlist id
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🎵");
  const [newColor, setNewColor] = useState("#00f5ff");
  const [creating, setCreating] = useState(false);
  // For adding chapter/verse
  const [addBook, setAddBook] = useState("John");
  const [addChapter, setAddChapter] = useState(1);
  const [addTranslation, setAddTranslation] = useState("KJV");
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => { loadPlaylists(); }, []);

  const loadPlaylists = async () => {
    setLoading(true);
    const data = await base44.entities.AudioPlaylist.list("-created_date", 50);
    setPlaylists(data || []);
    setLoading(false);
  };

  const createPlaylist = async (name, icon, color) => {
    setCreating(true);
    await base44.entities.AudioPlaylist.create({ name, icon, color, items: [] });
    setNewName(""); setNewIcon("🎵"); setNewColor("#00f5ff");
    setShowCreate(false);
    await loadPlaylists();
    setCreating(false);
  };

  const deletePlaylist = async (id) => {
    await base44.entities.AudioPlaylist.delete(id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const addChapterToPlaylist = async (playlist) => {
    setAddingItem(true);
    const items = Array.isArray(playlist.items) ? playlist.items : [];
    const label = `${addBook} ${addChapter}`;
    if (items.some(i => i.label === label && i.translation === addTranslation)) {
      setAddingItem(false);
      setShowAddItem(null);
      return;
    }
    const updated = [...items, {
      type: "chapter",
      book: addBook,
      chapter: addChapter,
      label,
      translation: addTranslation,
    }];
    await base44.entities.AudioPlaylist.update(playlist.id, { items: updated });
    await loadPlaylists();
    setAddingItem(false);
    setShowAddItem(null);
  };

  const removeItemFromPlaylist = async (playlist, index) => {
    const items = [...(playlist.items || [])];
    items.splice(index, 1);
    await base44.entities.AudioPlaylist.update(playlist.id, { items });
    setPlaylists(prev => prev.map(p => p.id === playlist.id ? { ...p, items } : p));
  };

  const bookData = BIBLE_BOOKS.find(b => b.name === addBook);
  const totalChapters = bookData?.chapters || 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cinzel text-base font-bold text-white">My Playlists</h2>
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Custom listening queues</p>
        </div>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-cinzel text-xs"
          style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.25)", color: "#00f5ff" }}>
          <Plus className="w-3.5 h-3.5" /> New Playlist
        </motion.button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl p-4 space-y-3"
              style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.18)" }}>
              <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(0,245,255,0.6)" }}>New Playlist</p>

              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Playlist name…"
                className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)", fontSize: "16px" }} />

              {/* Quick-suggest */}
              <div className="flex gap-2 flex-wrap">
                {SUGGESTED.map(s => (
                  <button key={s.name} onClick={() => { setNewName(s.name); setNewIcon(s.icon); setNewColor(s.color); }}
                    className="px-2.5 py-1 rounded-full text-[10px] font-cinzel transition-all"
                    style={{ background: `${s.color}12`, color: s.color, border: `1px solid ${s.color}30` }}>
                    {s.icon} {s.name}
                  </button>
                ))}
              </div>

              {/* Icon picker */}
              <div className="flex gap-2 flex-wrap">
                {PLAYLIST_ICONS.map(ic => (
                  <button key={ic} onClick={() => setNewIcon(ic)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
                    style={{ background: newIcon === ic ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)", border: newIcon === ic ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.07)" }}>
                    {ic}
                  </button>
                ))}
              </div>

              {/* Color picker */}
              <div className="flex gap-2">
                {PLAYLIST_COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)}
                    className="w-7 h-7 rounded-full transition-all flex-shrink-0"
                    style={{ background: c, border: newColor === c ? "2px solid white" : "2px solid transparent", boxShadow: newColor === c ? `0 0 10px ${c}80` : "none" }} />
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl font-cinzel text-xs"
                  style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Cancel
                </button>
                <motion.button whileTap={{ scale: 0.96 }} disabled={!newName.trim() || creating}
                  onClick={() => createPlaylist(newName.trim(), newIcon, newColor)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-cinzel text-xs"
                  style={{ background: "rgba(0,245,255,0.15)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.3)", opacity: !newName.trim() ? 0.5 : 1 }}>
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Create
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlists */}
      {loading ? (
        <LoadingState label="Loading playlists…" size="md" minHeight={120} />
      ) : playlists.length === 0 ? (
        <EmptyState
          icon={Music2}
          title="No playlists yet"
          description="Create a playlist and add chapters or verses to build your custom listening queue"
          minHeight={160}
        />
      ) : (
        <div className="space-y-3">
          {playlists.map((pl, idx) => {
            const isExpanded = expandedId === pl.id;
            const items = Array.isArray(pl.items) ? pl.items : [];
            return (
              <motion.div key={pl.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${pl.color || "#00f5ff"}25` }}>
                {/* Header */}
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${pl.color || "#00f5ff"}15`, border: `1px solid ${pl.color || "#00f5ff"}30` }}>
                    {pl.icon || "🎵"}
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => setExpandedId(isExpanded ? null : pl.id)}>
                    <p className="font-cinzel text-sm font-semibold text-white">{pl.name}</p>
                    <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={items[0] ? `/read?book=${encodeURIComponent(items[0].book)}&chapter=${items[0].chapter}` : "#"}
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: `${pl.color || "#00f5ff"}15`, color: pl.color || "#00f5ff" }}>
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    </a>
                    <button onClick={() => setExpandedId(isExpanded ? null : pl.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform" style={{ transform: isExpanded ? "rotate(90deg)" : "none" }} />
                    </button>
                    <button onClick={() => deletePlaylist(pl.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(248,113,113,0.07)", color: "#f87171" }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded items */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <div className="pt-3 space-y-1.5">
                          {items.length === 0 && (
                            <p className="text-xs font-inter text-center py-4" style={{ color: "rgba(255,255,255,0.25)" }}>
                              No items yet — add chapters below
                            </p>
                          )}
                          {items.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                              <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: pl.color || "#00f5ff" }} />
                              <p className="flex-1 text-xs font-cinzel text-white">{item.label}</p>
                              <span className="text-[9px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>{item.translation}</span>
                              <a href={`/read?book=${encodeURIComponent(item.book)}&chapter=${item.chapter}`}
                                className="text-[9px] font-cinzel px-2 py-0.5 rounded-lg"
                                style={{ background: `${pl.color || "#00f5ff"}15`, color: pl.color || "#00f5ff" }}>
                                Open
                              </a>
                              <button onClick={() => removeItemFromPlaylist(pl, i)}
                                className="w-5 h-5 flex items-center justify-center rounded-md"
                                style={{ color: "rgba(248,113,113,0.6)" }}>
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add chapter */}
                        {showAddItem === pl.id ? (
                          <div className="rounded-xl p-3 space-y-2.5"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <p className="text-[9px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Add Chapter</p>
                            <div className="grid grid-cols-3 gap-2">
                              <select value={addBook} onChange={e => setAddBook(e.target.value)}
                                className="col-span-1 rounded-lg px-2 py-1.5 text-xs font-cinzel focus:outline-none"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                                {BIBLE_BOOKS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                              </select>
                              <select value={addChapter} onChange={e => setAddChapter(Number(e.target.value))}
                                className="rounded-lg px-2 py-1.5 text-xs font-cinzel focus:outline-none"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                                {Array.from({ length: totalChapters }, (_, i) => i + 1).map(ch => (
                                  <option key={ch} value={ch}>{ch}</option>
                                ))}
                              </select>
                              <select value={addTranslation} onChange={e => setAddTranslation(e.target.value)}
                                className="rounded-lg px-2 py-1.5 text-xs font-cinzel focus:outline-none"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                                {["KJV","NIV","ESV","NKJV","NLT","RVR60","NVI"].map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setShowAddItem(null)}
                                className="flex-1 py-1.5 rounded-lg font-cinzel text-xs"
                                style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}>
                                Cancel
                              </button>
                              <motion.button whileTap={{ scale: 0.96 }} disabled={addingItem}
                                onClick={() => addChapterToPlaylist(pl)}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg font-cinzel text-xs"
                                style={{ background: `${pl.color || "#00f5ff"}20`, color: pl.color || "#00f5ff", border: `1px solid ${pl.color || "#00f5ff"}40` }}>
                                {addingItem ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Add
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setShowAddItem(pl.id)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-cinzel text-xs mt-1"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)" }}>
                            <Plus className="w-3.5 h-3.5" /> Add Chapter
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}