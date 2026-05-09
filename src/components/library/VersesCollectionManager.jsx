import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Play, Edit2, Trash2, X, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function VersesCollectionManager() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📚");
  const [newColor, setNewColor] = useState("#00f5ff");
  const [playingCollectionId, setPlayingCollectionId] = useState(null);

  const colors = ["#00f5ff", "#fbbf24", "#a78bfa", "#34d399", "#f87171", "#f472b6"];
  const icons = ["📚", "💎", "🙏", "❤️", "⭐", "🔥", "✨", "💫"];

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const data = await base44.entities.VerseCollection.list("-updated_date", 50)
        .catch(() => []);
      setCollections(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () => {
    if (!newName.trim()) return;
    try {
      await base44.entities.VerseCollection.create({
        name: newName.trim(),
        icon: newIcon,
        color: newColor,
        verse_refs: [],
        verse_count: 0,
        play_order: [],
      });
      setNewName("");
      setNewIcon("📚");
      setNewColor("#00f5ff");
      setShowCreateForm(false);
      loadCollections();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCollection = async (id) => {
    try {
      await base44.entities.VerseCollection.delete(id);
      setCollections(c => c.filter(col => col.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const playCollection = async (collection) => {
    if (!collection.play_order || collection.play_order.length === 0) return;

    setPlayingCollectionId(collection.id);

    // Fetch all verses in collection and play them as audio
    try {
      const verseTexts = [];
      for (const verseRef of collection.play_order) {
        const verses = await base44.entities.Verse.filter({ verse_ref: verseRef })
          .catch(() => []);
        if (verses?.[0]) {
          verseTexts.push(`${verseRef}: ${verses[0].text}`);
        }
      }

      if (verseTexts.length > 0) {
        // Use Web Speech API to read verses
        const text = verseTexts.join(" ... ");
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.onend = () => setPlayingCollectionId(null);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error(err);
      setPlayingCollectionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-cyan" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create button */}
      <motion.button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="w-full py-3 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2 transition-all"
        style={{
          background: "rgba(0,245,255,0.12)",
          color: "#00f5ff",
          border: "1px solid rgba(0,245,255,0.25)",
        }}
      >
        <Plus className="w-4 h-4" /> New Collection
      </motion.button>

      {/* Create form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.2)" }}
          >
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Collection name (e.g., Comfort, Promises)"
              className="w-full px-3 py-2.5 rounded-lg text-sm font-inter focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(0,245,255,0.2)",
                color: "rgba(255,255,255,0.8)",
              }}
            />

            <div>
              <p className="text-xs font-cinzel mb-1.5 text-white/40">Icon</p>
              <div className="flex flex-wrap gap-2">
                {icons.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setNewIcon(icon)}
                    className="text-2xl p-2 rounded-lg transition-all"
                    style={{ background: newIcon === icon ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)" }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-cinzel mb-1.5 text-white/40">Color</p>
              <div className="flex gap-2">
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className="w-8 h-8 rounded-lg transition-all"
                    style={{
                      background: c,
                      border: newColor === c ? `2px solid rgba(255,255,255,0.5)` : "1px solid transparent",
                      transform: newColor === c ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                onClick={createCollection}
                disabled={!newName.trim()}
                className="flex-1 py-2.5 rounded-lg font-cinzel text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{
                  background: "rgba(52,211,153,0.15)",
                  color: "#34d399",
                  border: "1px solid rgba(52,211,153,0.25)",
                }}
              >
                <Check className="w-4 h-4" /> Create
              </motion.button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-2.5 rounded-lg font-cinzel text-sm transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid transparent",
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collections list */}
      <div className="space-y-3">
        {collections.length === 0 ? (
          <p className="text-center text-white/35 py-8 text-sm">No collections yet. Create one to organize your verses!</p>
        ) : (
          collections.map(col => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: `${col.color}08`,
                border: `1px solid ${col.color}25`,
              }}
            >
              <span className="text-2xl">{col.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-cinzel font-semibold text-white">{col.name}</p>
                <p className="text-xs text-white/40">{col.verse_count || 0} verses</p>
              </div>
              <div className="flex items-center gap-1.5">
                {col.play_order && col.play_order.length > 0 && (
                  <motion.button
                    onClick={() => playCollection(col)}
                    disabled={playingCollectionId === col.id}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg transition-all"
                    style={{
                      background: playingCollectionId === col.id ? `${col.color}25` : `${col.color}12`,
                      color: col.color,
                    }}
                    title="Play as audio"
                  >
                    {playingCollectionId === col.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  </motion.button>
                )}
                <motion.button
                  onClick={() => deleteCollection(col.id)}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-red-500/10 transition-all"
                  title="Delete collection"
                >
                  <Trash2 className="w-4 h-4 text-red-500/60" />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}