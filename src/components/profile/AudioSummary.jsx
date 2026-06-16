import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Headphones, Clock, TrendingUp, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AudioSummary() {
  const [audioHistory, setAudioHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BibleAudioProgress.list("-updated_date", 500)
      .then(d => setAudioHistory(d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { topBooks, avgWeeklyMinutes, totalHours, completedCount } = useMemo(() => {
    const completed = audioHistory.filter(a => a.completed);
    const totalSeconds = completed.reduce((s, a) => s + (a.timestamp_seconds || 0), 0);
    const totalHours = Math.round(totalSeconds / 3600 * 10) / 10;

    // Weekly average (over last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recent = completed.filter(a => new Date(a.updated_date || a.created_date) > fourWeeksAgo);
    const recentSeconds = recent.reduce((s, a) => s + (a.timestamp_seconds || 0), 0);
    const avgWeeklyMinutes = Math.round(recentSeconds / 60 / 4);

    // Top books
    const bookCount = {};
    completed.forEach(a => { bookCount[a.book] = (bookCount[a.book] || 0) + 1; });
    const topBooks = Object.entries(bookCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

    return { topBooks, avgWeeklyMinutes, totalHours, completedCount: completed.length };
  }, [audioHistory]);

  if (loading) return <div className="h-24 rounded-2xl shimmer" style={{ background: "rgba(255,255,255,0.04)" }} />;

  if (audioHistory.length === 0) {
    return (
      <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <Headphones className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(255,255,255,0.15)" }} />
        <p className="font-cinzel text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No audio history yet</p>
      </div>
    );
  }

  const colors = ["#fbbf24", "#00f5ff", "#a78bfa", "#34d399", "#f87171", "#fb923c"];

  return (
    <div className="space-y-3">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total Hours", value: `${totalHours}h`, icon: Clock, color: "#00f5ff" },
          { label: "Avg/Week", value: `${avgWeeklyMinutes}m`, icon: TrendingUp, color: "#34d399" },
          { label: "Completed", value: completedCount, icon: BookOpen, color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center"
            style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
            <p className="font-cinzel text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Top books */}
      {topBooks.length > 0 && (
        <div className="rounded-xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[9px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Most Listened Books</p>
          {topBooks.map(([book, count], i) => (
            <div key={book} className="flex items-center gap-2">
              <span className="w-4 text-[10px] font-cinzel text-center flex-shrink-0" style={{ color: colors[i] }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-0.5">
                  <span className="font-inter text-[11px] text-white truncate">{book}</span>
                  <span className="text-[10px] font-cinzel flex-shrink-0 ml-2" style={{ color: colors[i] }}>{count}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(count / topBooks[0][1]) * 100}%` }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="h-full rounded-full" style={{ background: colors[i] }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}