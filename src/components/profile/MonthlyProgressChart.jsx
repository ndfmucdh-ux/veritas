import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { listReadingActivity } from "@/lib/dataAccess";

// Build 30 days of REAL reading activity from consolidated reading sessions.
// Each session = 1 chapter read; "chapters" mode counts unique chapters/day.
const buildDays = (records) => {
  const days = [];
  const now = new Date();
  // Map "YYYY-MM-DD" -> { chapters:Set, books:Set }
  const byDay = {};
  (records || []).forEach(r => {
    const key = (r.created_date || "").slice(0, 10);
    if (!key) return;
    if (!byDay[key]) byDay[key] = { chapters: new Set(), books: new Set() };
    byDay[key].chapters.add(`${r.book}:${r.chapter}`);
    if (r.book) byDay[key].books.add(r.book);
  });

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const entry = byDay[key];
    days.push({
      day: d.getDate(),
      date: key,
      chaptersRead: entry ? entry.chapters.size : 0,
      books: entry && entry.books.size ? [...entry.books].slice(0, 3).join(", ") : "—",
    });
  }
  return days;
};

export default function MonthlyProgressChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    listReadingActivity({ limit: 200 })
      .then(records => setData(buildDays(records)))
      .catch(() => setData(buildDays([])))
      .finally(() => setLoading(false));
  }, []);

  const selectedData = selectedDay ? data.find(d => d.date === selectedDay) : null;
  const totalChapters = data.reduce((sum, d) => sum + d.chaptersRead, 0);
  const activeDays = data.filter(d => d.chaptersRead > 0).length;
  const avgChapters = data.length ? (totalChapters / data.length).toFixed(1) : "0";

  const chartData = data.map(d => ({
    day: d.day.toString(),
    value: d.chaptersRead,
    date: d.date,
    full: d
  }));

  if (loading) {
    return (
      <div className="rounded-2xl p-5 flex items-center justify-center h-48"
        style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.15)" }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00f5ff" }} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.15)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: "#00f5ff" }} />
          <p className="font-cinzel text-sm font-semibold text-white">Monthly Progress</p>
        </div>
        <span className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>Last 30 days</span>
      </div>

      {/* Chart */}
      <div className="mb-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 0, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)", fontFamily: "Inter" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover-surface)",
                border: "1px solid rgba(0,245,255,0.2)",
                borderRadius: 12,
                fontSize: 12,
                fontFamily: "Cinzel"
              }}
              labelStyle={{ color: "#00f5ff" }}
              itemStyle={{ color: "rgba(255,255,255,0.7)" }}
            />
            <Bar
              dataKey="value"
              onClick={(data) => setSelectedDay(data.payload.date)}
              cursor="pointer"
            >
              {chartData.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={selectedDay === entry.date ? "#00f5ff" : "rgba(52,211,153,0.6)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-3" style={{ background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.15)" }}>
          <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>Chapters Read</p>
          <p className="font-cinzel text-lg font-bold text-white mt-1">{totalChapters}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>Active Days</p>
          <p className="font-cinzel text-lg font-bold" style={{ color: "#fbbf24" }} >{activeDays}</p>
        </div>
      </div>

      {/* Selected day info */}
      {selectedData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3"
          style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}
        >
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "#a78bfa" }}>
            {new Date(selectedData.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.6)" }}>Chapters read</span>
              <span className="font-cinzel font-bold text-white">{selectedData.chaptersRead}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.6)" }}>Focused on</span>
              <span className="font-cinzel font-bold text-white">{selectedData.books}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}