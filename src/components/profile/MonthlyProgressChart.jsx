import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Mock data: 30 days of reading activity
const generateMockData = () => {
  const days = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({
      day: d.getDate(),
      date: d.toISOString().split("T")[0],
      versesRead: Math.floor(Math.random() * 8),
      streakDays: Math.max(0, 25 - i + Math.floor(Math.random() * 3)),
      books: ["John", "Psalms", "Romans", "Genesis"][Math.floor(Math.random() * 4)]
    });
  }
  return days;
};

export default function MonthlyProgressChart() {
  const [data] = useState(generateMockData());
  const [selectedDay, setSelectedDay] = useState(null);
  const [displayMode, setDisplayMode] = useState("verses"); // verses | streak

  const selectedData = selectedDay ? data.find(d => d.date === selectedDay) : null;
  const totalVerses = data.reduce((sum, d) => sum + d.versesRead, 0);
  const avgVerses = (totalVerses / data.length).toFixed(1);
  const maxStreak = Math.max(...data.map(d => d.streakDays));

  const chartData = data.map(d => ({
    day: d.day.toString(),
    value: displayMode === "verses" ? d.versesRead : d.streakDays,
    date: d.date,
    full: d
  }));

  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.15)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: "#00f5ff" }} />
          <p className="font-cinzel text-sm font-semibold text-white">Monthly Progress</p>
        </div>
        <div className="flex gap-2">
          {["verses", "streak"].map(mode => (
            <button
              key={mode}
              onClick={() => setDisplayMode(mode)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-cinzel uppercase transition-all"
              style={{
                background: displayMode === mode ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)",
                color: displayMode === mode ? "#00f5ff" : "rgba(255,255,255,0.3)",
                border: displayMode === mode ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent"
              }}
            >
              {mode === "verses" ? "Verses" : "Streak"}
            </button>
          ))}
        </div>
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
                background: "rgba(10,15,30,0.95)",
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
                  fill={selectedDay === entry.date ? "#00f5ff" : displayMode === "verses" ? "rgba(52,211,153,0.6)" : "rgba(255,215,0,0.6)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-3" style={{ background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.15)" }}>
          <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>This Month</p>
          <p className="font-cinzel text-lg font-bold text-white mt-1">{totalVerses} verses</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>Daily Avg</p>
          <p className="font-cinzel text-lg font-bold" style={{ color: "#fbbf24" }} >{avgVerses}</p>
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
            May {selectedData.day}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.6)" }}>Verses read</span>
              <span className="font-cinzel font-bold text-white">{selectedData.versesRead}</span>
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