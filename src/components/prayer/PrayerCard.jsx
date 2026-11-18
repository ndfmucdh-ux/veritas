import { motion } from "framer-motion";
import { CheckCircle2, History, Trash2 } from "lucide-react";

export default function PrayerCard({
  prayer, mood, view, answeringId, answerNote,
  onSetAnswering, onAnswerNoteChange, onMarkAnswered, onDelete,
}) {
  return (
    <motion.div
      id={`prayer-${prayer.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-2xl p-4 group"
      style={{ background: `${mood?.color}08`, border: `1px solid ${mood?.color}22` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-cinzel text-sm text-white">{prayer.verse_ref}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs">{mood?.icon}</span>
            <span className="text-[10px] text-white/40">{mood?.label}</span>
            {prayer.answered && (
              <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                <CheckCircle2 className="w-3 h-3" /> Answered
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!prayer.answered && view === "active" && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onSetAnswering(prayer.id === answeringId ? null : prayer.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-cinzel transition-colors"
              style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}
              title="Mark as answered">
              <CheckCircle2 className="w-3 h-3" /> Answered
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDelete(prayer.id)}
            className="p-1.5 rounded-lg opacity-40 hover:opacity-80 transition-opacity">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </motion.button>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-white/60 line-clamp-3">{prayer.prayer_text}</p>

      {prayer.answered && prayer.answered_note && (
        <div className="mt-2 rounded-xl px-3 py-2 flex items-start gap-2"
          style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
          <History className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "#34d399" }} />
          <div>
            <p className="text-[10px] font-inter leading-relaxed" style={{ color: "rgba(52,211,153,0.9)" }}>{prayer.answered_note}</p>
            {prayer.answered_date && (
              <p className="text-[9px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                {new Date(prayer.answered_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      )}

      {answeringId === prayer.id && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-2">
          <textarea
            value={answerNote}
            onChange={e => onAnswerNoteChange(e.target.value)}
            placeholder="How was this prayer answered? (optional)"
            rows={2}
            className="w-full rounded-xl px-3 py-2 text-xs font-inter resize-none focus:outline-none"
            style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.25)", color: "rgba(255,255,255,0.8)" }}
          />
          <div className="flex gap-2">
            <button onClick={() => onSetAnswering(null)}
              className="flex-1 py-1.5 rounded-xl text-xs font-cinzel"
              style={{ background: "var(--fill-2)", color: "rgba(255,255,255,0.4)" }}>Cancel</button>
            <button onClick={() => onMarkAnswered(prayer)}
              className="flex-1 py-1.5 rounded-xl text-xs font-cinzel flex items-center justify-center gap-1.5"
              style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Answered
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}