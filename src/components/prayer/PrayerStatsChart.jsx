import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Calendar, Tag } from "lucide-react";
import { LoadingState } from "@/components/ui/states";

export default function PrayerStatsChart() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [topTopics, setTopTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("frequency"); // "frequency" | "topics"

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const prayers = await base44.entities.PrayerJournal.list("-created_date", 500);
      
      // Build 30-day frequency chart
      const dayMap = {};
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        dayMap[key] = 0;
      }
      
      (prayers || []).forEach(p => {
        const date = new Date(p.created_date).toISOString().split("T")[0];
        if (dayMap.hasOwnProperty(date)) dayMap[date]++;
      });
      
      const chartData = Object.entries(dayMap).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        prayers: count
      }));
      setMonthlyData(chartData);

      // Count topics from tags
      const tagCounts = {};
      (prayers || []).forEach(p => {
        (p.tags || []).forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      const sorted = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([topic, count]) => ({ topic, count }));
      setTopTopics(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState label="Loading prayer stats…" size="md" />;

  return (
    <div className="rounded-2xl p-4 md:p-6 space-y-5"
      style={{ background: "rgba(244,114,182,0.04)", border: "1px solid rgba(244,114,182,0.15)" }}>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {view === "frequency" ? <Calendar className="w-4 h-4" style={{ color: "#f472b6" }} /> : <Tag className="w-4 h-4" style={{ color: "#f472b6" }} />}
          <h3 className="font-cinzel text-sm text-white font-semibold">
            {view === "frequency" ? "Prayer Frequency (Last 30 Days)" : "Most Prayed Topics"}
          </h3>
        </div>
        <div className="flex gap-1">
          {[
            { id: "frequency", label: "📈 Frequency" },
            { id: "topics", label: "🏷️ Topics" }
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              className="text-[10px] px-2.5 py-1.5 rounded-lg font-cinzel transition-all"
              style={{
                background: view === v.id ? "rgba(244,114,182,0.15)" : "rgba(255,255,255,0.03)",
                color: view === v.id ? "#f472b6" : "rgba(255,255,255,0.35)",
                border: view === v.id ? "1px solid rgba(244,114,182,0.3)" : "1px solid transparent"
              }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === "frequency" && monthlyData.length > 0 && (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)", fontFamily: "Inter" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "var(--popover-surface)", border: "1px solid rgba(244,114,182,0.2)", borderRadius: 8, fontSize: 12, fontFamily: "Cinzel" }}
                labelStyle={{ color: "#f472b6" }}
              />
              <Bar dataKey="prayers" fill="#f472b6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === "topics" && (
        <div className="space-y-2">
          {topTopics.length === 0 ? (
            <p className="text-xs text-white/40 py-6 text-center">No topics recorded yet</p>
          ) : (
            topTopics.map((item, i) => (
              <motion.div key={item.topic} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-lg p-2"
                style={{ background: "rgba(244,114,182,0.08)" }}>
                <span className="text-xs font-inter capitalize" style={{ color: "rgba(255,255,255,0.7)" }}>{item.topic}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      background: `linear-gradient(90deg, #f472b6, #f87171)`,
                      width: `${Math.min(100, (item.count / topTopics[0].count) * 100)}%`
                    }} />
                  </div>
                  <span className="text-xs font-cinzel text-white/60 w-5 text-right">{item.count}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}