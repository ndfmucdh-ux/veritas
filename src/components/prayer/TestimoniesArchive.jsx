import { motion } from "framer-motion";
import { CheckCircle2, History, Heart } from "lucide-react";

const MOOD_ICONS = {
  grateful: "🙏",
  confessing: "🤲",
  interceding: "💗",
  celebrating: "🎉",
};

const MOOD_COLORS = {
  grateful: "#fbbf24",
  confessing: "#f87171",
  interceding: "#f472b6",
  celebrating: "#34d399",
};

export default function TestimoniesArchive({ prayers }) {
  if (prayers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Heart className="w-10 h-10" style={{ color: "rgba(52,211,153,0.3)" }} />
        <p className="font-cinzel text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No testimonies yet</p>
        <p className="text-xs font-inter text-center max-w-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          When you mark a prayer as answered, it will appear here as a testimony of God's faithfulness.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(52,211,153,0.15)" }}>
          <CheckCircle2 className="w-5 h-5" style={{ color: "#34d399" }} />
        </div>
        <div>
          <p className="font-cinzel text-sm font-semibold text-white">Testimonies Archive</p>
          <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(52,211,153,0.7)" }}>
            {prayers.length} answered prayer{prayers.length !== 1 ? "s" : ""} — God is faithful
          </p>
        </div>
      </div>

      {prayers.map((prayer, idx) => {
        const color = MOOD_COLORS[prayer.mood] || "#34d399";
        const icon = MOOD_ICONS[prayer.mood] || "🙏";
        return (
          <motion.div
            key={prayer.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl p-4"
            style={{ background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.15)" }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-cinzel text-sm text-white">{prayer.verse_ref || "Personal Prayer"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs">{icon}</span>
                  <span className="text-[10px] font-inter capitalize" style={{ color: "rgba(255,255,255,0.35)" }}>{prayer.mood}</span>
                  <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                    <CheckCircle2 className="w-2.5 h-2.5" /> Answered
                  </span>
                </div>
              </div>
              {prayer.answered_date && (
                <span className="text-[10px] font-inter flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {new Date(prayer.answered_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>

            {/* Original prayer */}
            <p className="text-xs font-inter leading-relaxed mb-3 line-clamp-2"
              style={{ color: "rgba(255,255,255,0.5)" }}>{prayer.prayer_text}</p>

            {/* Testimony note */}
            {prayer.answered_note && (
              <div className="rounded-xl px-3 py-2.5 flex items-start gap-2"
                style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <History className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#34d399" }} />
                <p className="text-xs font-inter leading-relaxed" style={{ color: "rgba(52,211,153,0.9)" }}>
                  {prayer.answered_note}
                </p>
              </div>
            )}

            {/* Tags */}
            {prayer.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {prayer.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-inter"
                    style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}