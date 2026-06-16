import { motion } from "framer-motion";
import { CheckCircle2, Headphones, Bookmark } from "lucide-react";
import { formatTime } from "@/hooks/useAudioDashboard";

export default function AudioHistoryTab({ audioHistory, completed, bookmarkSaved, onSaveBookmark }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
        {completed} chapters completed
      </p>
      {audioHistory.length === 0 && (
        <div className="py-16 flex flex-col items-center gap-3">
          <Headphones className="w-12 h-12" style={{ color: "rgba(255,255,255,0.15)" }} />
          <p className="font-cinzel text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No listening history yet</p>
        </div>
      )}
      {audioHistory.map((a, i) => (
        <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(255,255,255,0.03)", border: a.completed ? "1px solid rgba(52,211,153,0.2)" : "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: a.completed ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)" }}>
            {a.completed ? <CheckCircle2 className="w-4 h-4" style={{ color: "#34d399" }} /> : <Headphones className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-cinzel text-sm text-white">{a.book} {a.chapter}</p>
            <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>
              {a.translation} · {(a.updated_date || a.created_date)?.slice(0, 10)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {a.timestamp_seconds > 0 && (
              <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full"
                style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.18)" }}>
                {formatTime(a.timestamp_seconds)}
              </span>
            )}
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => onSaveBookmark(a)} title="Save this spot"
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: bookmarkSaved === a.id ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.05)",
                border: bookmarkSaved === a.id ? "1px solid rgba(251,191,36,0.35)" : "1px solid rgba(255,255,255,0.08)",
              }}>
              <Bookmark className="w-3.5 h-3.5" style={{ color: bookmarkSaved === a.id ? "#fbbf24" : "rgba(255,255,255,0.35)" }} />
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}