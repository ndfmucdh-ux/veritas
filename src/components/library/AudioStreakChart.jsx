import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Clock, Headphones, Trophy, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function AudioStreakChart() {
  const [audioHistory, setAudioHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("streak"); // "streak" | "time"

  useEffect(() => {
    base44.entities.BibleAudioProgress.list("-updated_date", 500)
      .then(data => setAudioHistory(data || []))
      .finally(() => setLoading(false));
  }, []);

  const { weeklyStreak, streakDays, totalHours, weeklyData, topBooks } = useMemo(() => {
    const completed = audioHistory.filter(a => a.completed);

    // Streak calculation
    const completedDates = new Set(
      completed.map(a => (a.updated_date || a.created_date)?.slice(0, 10)).filter(Boolean)
    );
    let streakDays = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (completedDates.has(d.toISOString().slice(0, 10))) streakDays++;
      else if (i > 0) break;
    }

    // Last 8 weeks data
    const weeklyData = Array.from({ length: 8 }, (_, w) => {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      const label = `W${8 - w}`;
      const chapters = completed.filter(a => {
        const d = new Date(a.updated_date || a.created_date);
        return d >= weekStart && d <= weekEnd;
      }).length;
      const minutes = completed.filter(a => {
        const d = new Date(a.updated_date || a.created_date);
        return d >= weekStart && d <= weekEnd;
      }).reduce((s, a) => s + (a.timestamp_seconds || 0) / 60, 0);
      return { label, chapters, minutes: Math.round(minutes) };
    }).reverse();

    // This week's streak heatmap (last 7 days)
    const weeklyStreak = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      return { day: dayLabel, active: completedDates.has(key), date: key };
    });

    const totalSeconds = completed.reduce((s, a) => s + (a.timestamp_seconds || 0), 0);
    const totalHours = Math.round(totalSeconds / 3600 * 10) / 10;

    // Top books
    const bookCount = {};
    completed.forEach(a => { bookCount[a.book] = (bookCount[a.book] || 0) + 1; });
    const topBooks = Object.entries(bookCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { weeklyStreak, streakDays, totalHours, weeklyData, topBooks };
  }, [audioHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Flame, label: "Day Streak", value: `${streakDays}🔥`, color: "#fb923c" },
          { icon: Clock, label: "Total Hours", value: `${totalHours}h`, color: "#00f5ff" },
          { icon: Headphones, label: "Completed", value: audioHistory.filter(a => a.completed).length, color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 text-center"
            style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
            <p className="font-cinzel text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly streak heatmap */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="font-cinzel text-[10px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
          This Week's Listening
        </p>
        <div className="flex gap-2">
          {weeklyStreak.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.06 }}
                className="w-full aspect-square rounded-xl flex items-center justify-center"
                style={{
                  background: d.active ? "rgba(251,146,60,0.25)" : "rgba(255,255,255,0.04)",
                  border: d.active ? "1.5px solid rgba(251,146,60,0.5)" : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: d.active ? "0 0 14px rgba(251,146,60,0.2)" : "none",
                }}>
                {d.active && <Flame className="w-4 h-4" style={{ color: "#fb923c" }} />}
              </motion.div>
              <span className="text-[9px] font-cinzel" style={{ color: d.active ? "#fb923c" : "rgba(255,255,255,0.25)" }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart view toggle */}
      <div className="flex gap-2">
        {[["streak", "📖 Chapters"], ["time", "⏱ Minutes"]].map(([v, l]) => (
          <button key={v} onClick={() => setView(v)}
            className="flex-1 py-2 rounded-xl font-cinzel text-xs transition-all"
            style={{
              background: view === v ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.04)",
              color: view === v ? "#00f5ff" : "rgba(255,255,255,0.35)",
              border: view === v ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.07)",
            }}>
            {l}
          </button>
        ))}
      </div>

      {/* Weekly trend chart */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="font-cinzel text-[10px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
          8-Week Trend
        </p>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 2, right: 2, left: -28, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontFamily: "Cinzel" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "rgba(10,15,30,0.95)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 10, fontSize: 11, fontFamily: "Cinzel" }}
                labelStyle={{ color: "#00f5ff" }}
                itemStyle={{ color: "rgba(255,255,255,0.7)" }}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar dataKey={view === "streak" ? "chapters" : "minutes"} radius={[4, 4, 0, 0]}
                fill={view === "streak" ? "#00f5ff" : "#a78bfa"}
                style={{ filter: `drop-shadow(0 0 4px ${view === "streak" ? "#00f5ff" : "#a78bfa"}44)` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top books listened to */}
      {topBooks.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="font-cinzel text-[10px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
            Most Listened
          </p>
          <div className="space-y-2">
            {topBooks.map(([book, count], i) => {
              const maxCount = topBooks[0][1];
              const pct = (count / maxCount) * 100;
              const colors = ["#fbbf24", "#00f5ff", "#a78bfa", "#34d399", "#f87171"];
              return (
                <div key={book} className="flex items-center gap-3">
                  <span className="font-cinzel text-[10px] w-4 text-center" style={{ color: colors[i] }}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-cinzel text-xs text-white">{book}</span>
                      <span className="text-[10px] font-inter" style={{ color: colors[i] }}>{count} ch</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="h-full rounded-full" style={{ background: colors[i] }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}