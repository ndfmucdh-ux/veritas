import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import { listReadingHistory } from "@/lib/dataAccess";
import { LoadingState, EmptyState } from "@/components/ui/states";

export default function ReadingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listReadingHistory({ limit: 20 })
      .then(data => setHistory(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading your reading history…" size="lg" />;

  if (history.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No reading history yet"
        description="Start reading chapters and they'll appear here so you can pick up where you left off"
        action={
          <a href="/read"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-cinzel text-sm min-h-10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.2)" }}>
            <BookOpen className="w-4 h-4" /> Start Reading
          </a>
        }
      />
    );
  }

  // Deduplicate — keep latest entry per book+chapter
  const seen = new Set();
  const deduped = history.filter(item => {
    const key = `${item.book}-${item.chapter}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-cyan" />
        <p className="font-cinzel text-xs uppercase tracking-widest text-white/40">Last 20 chapters read</p>
      </div>
      {deduped.map((item, i) => {
        const date = item.completed_at ? new Date(item.completed_at) : null;
        const isToday = date && new Date().toDateString() === date.toDateString();
        const isYesterday = date && new Date(Date.now() - 86400000).toDateString() === date.toDateString();
        const dateLabel = !date ? "" : isToday ? "Today" : isYesterday ? "Yesterday" : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        return (
          <motion.a
            key={`${item.id}-${i}`}
            href={`/read?book=${encodeURIComponent(item.book)}&chapter=${item.chapter}${item.translation ? `&translation=${item.translation}` : ""}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl group transition-all"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Number badge */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-cinzel text-xs font-bold"
              style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.15)" }}>
              {i + 1}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-cinzel text-sm font-semibold text-white">
                {item.book} {item.chapter}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {item.translation && (
                  <span className="text-[10px] font-inter px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>
                    {item.translation}
                  </span>
                )}
                {dateLabel && (
                  <span className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {dateLabel}
                  </span>
                )}
                {item.reading_time_seconds > 0 && (
                  <span className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.25)" }}>
                    · {Math.round(item.reading_time_seconds / 60)}m
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className="w-4 h-4 flex-shrink-0 transition-colors group-hover:text-cyan"
              style={{ color: "rgba(255,255,255,0.2)" }} />
          </motion.a>
        );
      })}
    </div>
  );
}