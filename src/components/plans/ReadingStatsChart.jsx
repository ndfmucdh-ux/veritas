import { useState, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { base44 } from "@/api/base44Client";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ReadingStatsChart() {
  const [dailyData, setDailyData] = useState([]);
  const [booksCompleted, setBooksCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("time"); // "time" or "books"

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get reading progress for last 30 days
      const progress = await base44.entities.ReadingProgress.list("-completed_at", 300)
        .catch(() => []);

      // Group by date and calculate time spent per day
      const dateMap = {};
      (progress || []).forEach(p => {
        const date = new Date(p.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dateMap[date] = (dateMap[date] || 0) + (p.reading_time_seconds || 300) / 60; // Convert to minutes
      });

      // Generate last 30 days with data
      const chartData = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        chartData.push({
          date: dateStr,
          time_minutes: Math.round(dateMap[dateStr] || 0),
        });
      }

      setDailyData(chartData);

      // Count unique books completed
      const uniqueBooks = new Set((progress || []).map(p => p.book)).size;
      setBooksCompleted(uniqueBooks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalMinutes = dailyData.reduce((sum, d) => sum + d.time_minutes, 0);
    const avgMinutes = Math.round(totalMinutes / 30);
    const maxDay = Math.max(...dailyData.map(d => d.time_minutes), 0);
    return { totalMinutes, avgMinutes, maxDay };
  }, [dailyData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-cyan" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 space-y-5" style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.15)" }}>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Time", value: `${stats.totalMinutes}m`, color: "#00f5ff" },
          { label: "Daily Avg", value: `${stats.avgMinutes}m`, color: "#fbbf24" },
          { label: "Books", value: booksCompleted, color: "#34d399" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] font-cinzel text-white/40 mb-1">{s.label}</p>
            <p className="font-cinzel text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart type toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setChartType("time")}
          className="flex-1 py-2 rounded-lg text-xs font-cinzel transition-all"
          style={{
            background: chartType === "time" ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.05)",
            color: chartType === "time" ? "#00f5ff" : "rgba(255,255,255,0.4)",
            border: chartType === "time" ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent",
          }}
        >
          📊 Time Per Day
        </button>
        <button
          onClick={() => setChartType("books")}
          className="flex-1 py-2 rounded-lg text-xs font-cinzel transition-all"
          style={{
            background: chartType === "books" ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.05)",
            color: chartType === "books" ? "#00f5ff" : "rgba(255,255,255,0.4)",
            border: chartType === "books" ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent",
          }}
        >
          📖 Completion
        </button>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "time" ? (
            <LineChart data={dailyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f5ff" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#00f5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
              <Tooltip contentStyle={{ background: "rgba(10,15,30,0.95)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 12, fontSize: 12, fontFamily: "Inter" }} />
              <Line type="monotone" dataKey="time_minutes" stroke="#00f5ff" strokeWidth={2} dot={{ fill: "#00f5ff", r: 3 }} />
            </LineChart>
          ) : (
            <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "rgba(10,15,30,0.95)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="time_minutes" fill="#a78bfa" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] font-inter text-white/35 text-center">Last 30 days of reading activity</p>
    </div>
  );
}