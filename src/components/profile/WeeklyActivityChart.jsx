import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import { listReadingActivity } from "@/lib/dataAccess";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeeklyActivityChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Build last 7 calendar days from REAL reading sessions
    const buckets = [];
    const keyToIdx = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      keyToIdx[key] = buckets.length;
      buckets.push({ day: DAY_LABELS[d.getDay()], key, chapters: 0, _seen: new Set() });
    }

    listReadingActivity({ limit: 200 })
      .then(records => {
        (records || []).forEach(r => {
          const key = (r.created_date || "").slice(0, 10);
          const idx = keyToIdx[key];
          if (idx === undefined) return;
          const uniq = `${r.book}:${r.chapter}`;
          if (!buckets[idx]._seen.has(uniq)) {
            buckets[idx]._seen.add(uniq);
            buckets[idx].chapters += 1;
          }
        });
        setData(buckets.map(({ day, chapters }) => ({ day, chapters })));
      })
      .catch(() => setData(buckets.map(({ day }) => ({ day, chapters: 0 }))));
  }, []);

  if (!data) {
    return (
      <div className="h-36 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00f5ff" }} />
      </div>
    );
  }

  const hasActivity = data.some(d => d.chapters > 0);

  if (!hasActivity) {
    return (
      <p className="text-xs font-inter text-center py-10" style={{ color: "rgb(var(--ink) / 0.25)" }}>
        Read a chapter to start building your weekly activity
      </p>
    );
  }

  return (
    <div className="h-36">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f5ff" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#00f5ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "rgb(var(--ink) / 0.3)", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "rgb(var(--ink) / 0.3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "var(--popover-surface)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 12, fontSize: 12, fontFamily: "Cinzel" }}
            labelStyle={{ color: "#00f5ff" }}
            itemStyle={{ color: "rgb(var(--ink) / 0.7)" }}
          />
          <Area type="monotone" dataKey="chapters" stroke="#00f5ff" strokeWidth={2} fill="url(#cg)" dot={{ fill: "#00f5ff", r: 3, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}