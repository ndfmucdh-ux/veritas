import { useState, useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";
import { DATE_LOCALE } from "@/lib/i18nCommunity";
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
  const { t, lang } = useLang();
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
      <div className="rounded-2xl flex items-center justify-center min-h-[14rem]"
        style={{ background: "hsl(var(--card))", border: "1px solid var(--hairline)" }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--t-gold)" }} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-3.5" style={{ background: "hsl(var(--card))", border: "1px solid var(--hairline)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: "var(--t-gold)" }} />
          <p className="font-cinzel text-sm font-semibold text-foreground">{t.s1Monthly}</p>
        </div>
        <span className="text-xs font-inter" style={{ color: "rgb(var(--ink) / 0.75)" }}>{t.s1Last30}</span>
      </div>

      {/* Chart */}
      <div className="mb-3 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 0, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "rgb(var(--ink) / 0.3)", fontFamily: "Inter" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "rgb(var(--ink) / 0.3)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover-surface)",
                border: "1px solid var(--hairline)",
                borderRadius: 12,
                fontSize: 12,
                fontFamily: "Cinzel"
              }}
              labelStyle={{ color: "#d9b77e" }}
              itemStyle={{ color: "rgb(var(--ink) / 0.7)" }}
            />
            <Bar
              dataKey="value"
              onClick={(data) => setSelectedDay(data.payload.date)}
              cursor="pointer"
            >
              {chartData.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={selectedDay === entry.date ? "#d9b77e" : "rgba(217,183,126,0.45)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl px-3 py-2 flex items-center justify-between gap-2" style={{ background: "var(--fill-2)" }}>
          <p className="text-xs font-inter min-w-0" style={{ color: "rgb(var(--ink) / 0.75)" }}>{t.s1ChaptersRead}</p>
          <p className="font-cinzel text-lg font-bold text-foreground">{totalChapters}</p>
        </div>
        <div className="rounded-xl px-3 py-2 flex items-center justify-between gap-2" style={{ background: "var(--fill-2)" }}>
          <p className="text-xs font-inter min-w-0" style={{ color: "rgb(var(--ink) / 0.75)" }}>{t.s1ActiveDays}</p>
          <p className="font-cinzel text-lg font-bold" style={{ color: "var(--t-gold)" }}>{activeDays}</p>
        </div>
      </div>

      {/* Selected day info */}
      {selectedData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3 mt-2"
          style={{ background: "var(--fill-2)" }}
        >
          <p className="text-[11px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "var(--t-gold)" }}>
            {new Date(selectedData.date + "T00:00:00").toLocaleDateString(DATE_LOCALE[lang], { month: "long", day: "numeric" })}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs font-inter" style={{ color: "rgb(var(--ink) / 0.6)" }}>{t.s1ChaptersRead}</span>
              <span className="font-cinzel font-bold text-white">{selectedData.chaptersRead}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-inter" style={{ color: "rgb(var(--ink) / 0.6)" }}>{t.s1FocusedOn}</span>
              <span className="font-cinzel font-bold text-white">{selectedData.books}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}