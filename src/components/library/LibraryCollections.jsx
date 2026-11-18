import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Folder, BookOpen, Trash2, X, Check, Loader2, ChevronDown, ChevronRight,
  Bookmark, Highlighter, StickyNote, Sparkles
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LoadingState, EmptyState } from "@/components/ui/states";

const PRESET_COLLECTIONS = [
  { name: "Comfort", emoji: "🕊️", color: "#60a5fa" },
  { name: "Strength", emoji: "💪", color: "#f97316" },
  { name: "Wisdom", emoji: "💎", color: "#a78bfa" },
  { name: "Hope", emoji: "🌅", color: "#fbbf24" },
  { name: "Faith", emoji: "✝️", color: "#00f5ff" },
  { name: "Love", emoji: "❤️", color: "#f472b6" },
  { name: "Peace", emoji: "🌿", color: "#34d399" },
  { name: "Gratitude", emoji: "🙏", color: "#f59e0b" },
];

export default function LibraryCollections({ bookmarks, highlights, notes }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📁");
  const [newColor, setNewColor] = useState("#00f5ff");
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [addingTo, setAddingTo] = useState(null); // collection id being added to
  const [itemType, setItemType] = useState("bookmark"); // bookmark | highlight | note

  useEffect(() => { loadCollections(); }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const cols = await base44.entities.VerseCollection.list("-created_date", 30).catch(() => []);
      setCollections(cols || []);
    } finally { setLoading(false); }
  };

  const createCollection = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const col = await base44.entities.VerseCollection.create({
      name: newName.trim(),
      icon: newEmoji,
      color: newColor,
      verse_refs: [],
      verse_count: 0,
    });
    setCollections(prev => [col, ...prev]);
    setNewName(""); setNewEmoji("📁"); setShowCreate(false);
    setSaving(false);
  };

  const deleteCollection = async (id) => {
    await base44.entities.VerseCollection.delete(id);
    setCollections(prev => prev.filter(c => c.id !== id));
  };

  const addItemToCollection = async (col, item) => {
    const ref = item.verse_ref;
    if (!ref || (col.verse_refs || []).includes(ref)) return;
    const updated = [...(col.verse_refs || []), ref];
    await base44.entities.VerseCollection.update(col.id, { verse_refs: updated, verse_count: updated.length });
    setCollections(prev => prev.map(c => c.id === col.id ? { ...c, verse_refs: updated, verse_count: updated.length } : c));
    setAddingTo(null);
  };

  const removeFromCollection = async (col, ref) => {
    const updated = (col.verse_refs || []).filter(r => r !== ref);
    await base44.entities.VerseCollection.update(col.id, { verse_refs: updated, verse_count: updated.length });
    setCollections(prev => prev.map(c => c.id === col.id ? { ...c, verse_refs: updated, verse_count: updated.length } : c));
  };

  const allItems = [
    ...bookmarks.map(b => ({ ...b, _type: "bookmark", verse_ref: b.verse_ref })),
    ...highlights.map(h => ({ ...h, _type: "highlight", verse_ref: h.verse_ref })),
    ...notes.map(n => ({ ...n, _type: "note", verse_ref: n.verse_ref })),
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cinzel text-base font-bold text-white">Thematic Collections</h2>
          <p className="text-[11px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.35)" }}>
            Organize verses by theme — Comfort, Strength, Wisdom…
          </p>
        </div>
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-cinzel text-xs"
          style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.25)" }}>
          <Plus className="w-3.5 h-3.5" /> New
        </motion.button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl p-4 space-y-3"
              style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.15)" }}>
              <p className="font-cinzel text-xs font-semibold text-white">New Collection</p>

              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {PRESET_COLLECTIONS.map(p => (
                  <button key={p.name} onClick={() => { setNewName(p.name); setNewEmoji(p.emoji); setNewColor(p.color); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-cinzel transition-all"
                    style={{
                      background: newName === p.name ? `${p.color}20` : "rgb(var(--ink) / 0.04)",
                      color: newName === p.name ? p.color : "rgb(var(--ink) / 0.5)",
                      border: newName === p.name ? `1px solid ${p.color}50` : "1px solid rgb(var(--ink) / 0.08)",
                    }}>
                    {p.emoji} {p.name}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Collection name…"
                  className="flex-1 rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                  style={{ fontSize: "16px", background: "var(--fill-3)", border: "1px solid rgb(var(--ink) / 0.1)", color: "rgb(var(--ink) / 0.85)" }} />
                <input value={newEmoji} onChange={e => setNewEmoji(e.target.value)} maxLength={2}
                  className="w-12 text-center rounded-xl px-2 py-2.5 text-lg focus:outline-none"
                  style={{ background: "var(--fill-3)", border: "1px solid rgb(var(--ink) / 0.1)", color: "#fff" }} />
              </div>

              <div className="flex gap-2 items-center">
                {["#00f5ff","#fbbf24","#a78bfa","#f472b6","#34d399","#f97316","#60a5fa"].map(c => (
                  <button key={c} onClick={() => setNewColor(c)}
                    className="w-6 h-6 rounded-full transition-all"
                    style={{ background: c, boxShadow: newColor === c ? `0 0 10px ${c}` : "none",
                      border: newColor === c ? `2px solid white` : "2px solid transparent" }} />
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl font-cinzel text-sm"
                  style={{ background: "var(--fill-2)", color: "rgb(var(--ink) / 0.4)" }}>
                  Cancel
                </button>
                <button onClick={createCollection} disabled={!newName.trim() || saving}
                  className="flex-1 py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2"
                  style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.3)",
                    opacity: !newName.trim() ? 0.5 : 1 }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Create</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && <LoadingState label="Loading collections…" size="lg" />}

      {!loading && collections.length === 0 && (
        <EmptyState
          icon="📚"
          title="No collections yet"
          description="Create thematic collections to organize your saved verses"
        />
      )}

      {/* Collections list */}
      {collections.map((col, i) => (
        <motion.div key={col.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--fill-1)", border: `1px solid ${col.color || "#00f5ff"}22` }}>
          {/* Collection header */}
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            onClick={() => setExpandedId(expandedId === col.id ? null : col.id)}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: `${col.color || "#00f5ff"}15`, border: `1px solid ${col.color || "#00f5ff"}30` }}>
              {col.icon || "📁"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-cinzel text-sm font-semibold text-white">{col.name}</p>
              <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.3)" }}>
                {col.verse_count || 0} verse{col.verse_count !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={e => { e.stopPropagation(); setAddingTo(col.id); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff" }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button onClick={e => { e.stopPropagation(); deleteCollection(col.id); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ color: "rgb(var(--ink) / 0.25)" }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ChevronDown className="w-4 h-4" style={{ color: "rgb(var(--ink) / 0.25)",
                transform: expandedId === col.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </div>
          </button>

          {/* Add item picker */}
          <AnimatePresence>
            {addingTo === col.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-4 pb-3 pt-1 space-y-2"
                  style={{ borderTop: "1px solid rgb(var(--ink) / 0.05)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgb(var(--ink) / 0.3)" }}>
                      Add to {col.name}
                    </p>
                    <div className="flex gap-1">
                      {[["bookmark","🔖"],["highlight","✨"],["note","✍️"]].map(([type, emoji]) => (
                        <button key={type} onClick={() => setItemType(type)}
                          className="px-2 py-1 rounded-lg text-[10px] font-cinzel transition-all"
                          style={{
                            background: itemType === type ? `${col.color}20` : "rgb(var(--ink) / 0.04)",
                            color: itemType === type ? col.color : "rgb(var(--ink) / 0.35)",
                            border: itemType === type ? `1px solid ${col.color}40` : "1px solid rgb(var(--ink) / 0.07)"
                          }}>
                          {emoji} {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {allItems.filter(it => it._type === itemType).map(item => {
                      const alreadyIn = (col.verse_refs || []).includes(item.verse_ref);
                      return (
                        <button key={item.id} onClick={() => !alreadyIn && addItemToCollection(col, item)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
                          style={{
                            background: alreadyIn ? `${col.color}12` : "rgb(var(--ink) / 0.03)",
                            opacity: alreadyIn ? 0.6 : 1
                          }}>
                          <span className="text-sm">{itemType === "bookmark" ? "🔖" : itemType === "highlight" ? "✨" : "✍️"}</span>
                          <span className="text-xs font-cinzel flex-1 truncate text-white">{item.verse_ref}</span>
                          {alreadyIn
                            ? <Check className="w-3 h-3 flex-shrink-0" style={{ color: col.color }} />
                            : <Plus className="w-3 h-3 flex-shrink-0" style={{ color: "rgb(var(--ink) / 0.3)" }} />}
                        </button>
                      );
                    })}
                    {allItems.filter(it => it._type === itemType).length === 0 && (
                      <p className="text-xs font-inter text-center py-3" style={{ color: "rgb(var(--ink) / 0.25)" }}>
                        No {itemType}s yet
                      </p>
                    )}
                  </div>
                  <button onClick={() => setAddingTo(null)}
                    className="w-full py-2 rounded-xl font-cinzel text-xs"
                    style={{ background: "var(--fill-2)", color: "rgb(var(--ink) / 0.35)" }}>
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Verse refs in collection */}
          <AnimatePresence>
            {expandedId === col.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-4 pb-4 pt-1 space-y-2"
                  style={{ borderTop: "1px solid rgb(var(--ink) / 0.05)" }}>
                  {(!col.verse_refs || col.verse_refs.length === 0) && (
                    <p className="text-xs font-inter text-center py-3" style={{ color: "rgb(var(--ink) / 0.25)" }}>
                      No verses yet — tap + to add
                    </p>
                  )}
                  {(col.verse_refs || []).map(ref => (
                    <div key={ref} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: "var(--fill-1)" }}>
                      <span className="text-xs font-cinzel flex-1" style={{ color: col.color || "#00f5ff" }}>{ref}</span>
                      <a href={`/read?book=${encodeURIComponent(ref.split(" ").slice(0,-1).join(" "))}&chapter=${ref.split(" ").pop()?.split(":")[0]}`}
                        className="p-1 rounded-lg" style={{ color: "rgb(var(--ink) / 0.3)" }}>
                        <BookOpen className="w-3.5 h-3.5" />
                      </a>
                      <button onClick={() => removeFromCollection(col, ref)}
                        className="p-1 rounded-lg" style={{ color: "rgb(var(--ink) / 0.25)" }}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}