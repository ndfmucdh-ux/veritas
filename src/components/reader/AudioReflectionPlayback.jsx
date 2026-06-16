import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Trash2, Loader2 } from "lucide-react";
import { deleteReflection as deleteReflectionSvc } from "@/lib/services/audioReflectionService";

export default function AudioReflectionPlayback({ reflections, onDeleted }) {
  const [playingId, setPlayingId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const moodEmojis = {
    grateful: "🙏",
    confessing: "🤲",
    interceding: "💗",
    celebrating: "🎉",
    questioning: "❓",
    seeking: "🔍",
  };

  const playReflection = (id, url) => {
    const audio = new Audio(url);
    audio.play();
    setPlayingId(id);
    audio.onended = () => setPlayingId(null);
  };

  const deleteReflection = async (id) => {
    setDeleting(id);
    try {
      await deleteReflectionSvc(id);
      onDeleted?.(id);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  };

  if (!reflections || reflections.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {reflections.map(r => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-2.5 rounded-lg"
          style={{ background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.15)" }}
        >
          <button
            onClick={() => playReflection(r.id, r.audio_url)}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: playingId === r.id ? "rgba(0,229,255,0.2)" : "rgba(0,229,255,0.12)",
              color: "#00f5ff",
            }}
          >
            {playingId === r.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-cinzel text-white/60">{moodEmojis[r.mood] || "💬"} {r.mood}</p>
            {r.transcript && <p className="text-[11px] font-inter text-white/40 truncate">{r.transcript}</p>}
          </div>
          <button
            onClick={() => deleteReflection(r.id)}
            disabled={deleting === r.id}
            className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 disabled:opacity-50"
          >
            {deleting === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" /> : <Trash2 className="w-3.5 h-3.5 text-red-500/60" />}
          </button>
        </motion.div>
      ))}
    </div>
  );
}