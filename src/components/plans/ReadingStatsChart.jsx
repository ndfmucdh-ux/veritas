import { useState, useMemo, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, BarChart3 } from "lucide-react";
import { listReadingHistory } from "@/lib/dataAccess";
import { useLang } from "@/lib/LanguageContext";

const GOLD = "#d9b77e";
const tick = { fontSize: 10, fill: "rgb(var(--ink) / 0.7)" };

export default function ReadingStatsChart() {
  const { t } = useLang();
  const [dailyData, setDailyData] = useState([]);
  const [books, setBooks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("line");

  useEffect(() => {
    (async () => {
      const today = new Date();
      const progress = await listReadingHistory({ limit: 300 }).catch(() => []);
      const map = {};
      (progress || []).forEach((p) => {
        const stamp = p.completed_at || p.created_date;
        if (!stamp) return;
        const key = new Date(stamp).toDateString();
        map[key] = (map[key] || 0) + (p.reading_time_seconds || 300) / 60;
      });
      setDailyData(Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (29 - i));
        return { date: String(d.getDate()), time_minutes: Math.round(map[d.toDateString()] || 0) };
      }));
      setBooks(new Set((progress || []).map((p) => p.book)).size);
      setLoading(false);
    })();
  }, []);

  const totals = useMemo(() => {
    const total = dailyData.reduce((s, d) => s + d.time_minutes, 0);
    return { total, avg: Math.round(total / 30) };
  }, [dailyData]);

  const stats = [[t.s6TotalTime, `${totals.total}m`], [t.s6DailyAvg, `${totals.avg}m`], [t.s6Books, books]];
  const tip = { background: "var(--popover-surface)", border: "1px solid var(--hairline)", borderRadius: 12, fontSize: 12 };

  return (
    <section className="rounded-2xl bg-card border border-border p-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <BarChart3 className="w-4 h-4 flex-shrink-0 text-primary" />
          <p className="font-cinzel text-sm font-semibold text-foreground truncate">{t.s6Insights}</p>
        </div>
        <div className="flex p-0.5 rounded-full bg-secondary flex-shrink-0">
          {[["line", "~"], ["bar", "▮"]].map(([id, glyph]) => (
            <button key={id} type="button" onClick={() => setChartType(id)} aria-label={id}
              className={`w-9 min-h-8 rounded-full text-xs ${chartType === id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{glyph}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-36 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-secondary px-2.5 py-1.5 min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">{label}</p>
                <p className="font-cinzel text-base font-bold text-foreground leading-tight">{value}</p>
              </div>
            ))}
          </div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={dailyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <XAxis dataKey="date" tick={tick} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={tick} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tip} />
                  <Line type="monotone" dataKey="time_minutes" stroke={GOLD} strokeWidth={2} dot={false} />
                </LineChart>
              ) : (
                <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <XAxis dataKey="date" tick={tick} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={tick} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tip} />
                  <Bar dataKey="time_minutes" fill={GOLD} radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-1">{t.s6TimePerDay} · {t.s6Last30}</p>
        </>
      )}
    </section>
  );
}