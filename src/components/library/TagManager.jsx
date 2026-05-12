import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Plus, X, Check } from "lucide-react";

const PRESET_TAGS = [
  "Comfort", "Inspiration", "Life Events", "Promises", "Wisdom",
  "Prayer", "Strength", "Hope", "Love", "Faith", "Gratitude", "Healing"
];

export default function TagManager({ currentTags = [], onSave, onClose }) {
  const [tags, setTags] = useState(currentTags);
  const [customInput, setCustomInput] = useState("");

  const toggleTag = (tag) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setCustomInput("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(12,16,30,0.98)", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-cyan" />
            <p className="font-cinzel text-sm font-semibold text-white">Manage Tags</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "rgba(255,255,255,0.3)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset tags */}
        <div>
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Quick tags</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-inter transition-all"
                style={{
                  background: tags.includes(tag) ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)",
                  color: tags.includes(tag) ? "#00f5ff" : "rgba(255,255,255,0.45)",
                  border: tags.includes(tag) ? "1px solid rgba(0,245,255,0.35)" : "1px solid rgba(255,255,255,0.08)"
                }}
              >
                {tags.includes(tag) && <Check className="w-3 h-3" />}
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Custom tag input */}
        <div>
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Custom tag</p>
          <div className="flex gap-2">
            <input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCustom()}
              placeholder="e.g. Morning Devotion"
              className="flex-1 rounded-xl px-3 py-2 text-sm font-inter focus:outline-none"
              style={{ fontSize: "16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }}
            />
            <button
              onClick={addCustom}
              disabled={!customInput.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.2)", opacity: customInput.trim() ? 1 : 0.4 }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active tags */}
        {tags.length > 0 && (
          <div>
            <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Selected ({tags.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-inter"
                  style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.25)" }}>
                  {tag}
                  <button onClick={() => setTags(prev => prev.filter(t => t !== tag))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Save */}
        <button
          onClick={() => { onSave(tags); onClose(); }}
          className="w-full py-3 rounded-xl font-cinzel text-sm font-semibold transition-all"
          style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.2), rgba(0,180,220,0.2))", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.3)" }}
        >
          Save Tags
        </button>
      </div>
    </motion.div>
  );
}