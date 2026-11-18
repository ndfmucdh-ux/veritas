import { motion } from "framer-motion";
import { Bookmark, Trash2 } from "lucide-react";
import { formatTime } from "@/hooks/useAudioDashboard";
import { EmptyState } from "@/components/ui/states";

export default function AudioBookmarksTab({ bookmarks, onDelete }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgb(var(--ink) / 0.25)" }}>
          {bookmarks.length} saved spot{bookmarks.length !== 1 ? "s" : ""}
        </p>
      </div>
      {bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No spots saved yet"
          description="Tap the 🔖 button on any chapter in History to save your exact listening spot"
        />
      ) : (
        bookmarks.map((bm, i) => (
          <motion.div key={bm.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
            style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.18)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)" }}>
              <Bookmark className="w-4 h-4" style={{ color: "#fbbf24" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-cinzel text-sm font-semibold text-white">{bm.label}</p>
              <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.35)" }}>
                {bm.translation} · at {formatTime(bm.timestamp_seconds)}
              </p>
              <p className="text-[9px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.2)" }}>
                Saved {new Date(bm.saved_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <a href={`/read?book=${encodeURIComponent(bm.book)}&chapter=${bm.chapter}`}
                className="text-[10px] font-cinzel px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.2)" }}>
                Resume →
              </a>
              <button onClick={() => onDelete(bm.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(248,113,113,0.08)", color: "#f87171" }}>
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}