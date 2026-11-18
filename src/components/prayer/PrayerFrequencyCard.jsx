import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useLang } from "@/lib/LanguageContext";
import { DATE_LOCALE } from "@/lib/i18nCommunity";
import { frequency, topTopics } from "@/lib/prayerStats";

export default function PrayerFrequencyCard({ prayers }) {
  const { t, lang } = useLang();
  const [view, setView] = useState("frequency");
  const data = useMemo(() => frequency(prayers, 30).map(({ key, count }) => ({
    date: new Date(`${key}T00:00:00`).toLocaleDateString(DATE_LOCALE[lang], { month: "short", day: "numeric" }), prayers: count,
  })), [prayers, lang]);
  const topics = useMemo(() => topTopics(prayers, 6), [prayers]);
  const tabs = [["frequency", t.pjFrequency], ["topics", t.pjTopics]];

  return (
    <section className="rounded-2xl bg-card border border-border p-3.5">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="font-cinzel text-base font-semibold text-foreground truncate">{view === "frequency" ? t.pjFreq30 : t.pjMostTopics}</p>
        <div className="flex p-0.5 rounded-full bg-secondary flex-shrink-0">
          {tabs.map(([id, label]) => (
            <button key={id} type="button" onClick={() => setView(id)} aria-pressed={view === id}
              className={`px-3 min-h-8 rounded-full text-xs font-cinzel ${view === id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{label}</button>
          ))}
        </div>
      </div>

      {view === "frequency" ? (
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis dataKey="date" interval={6} tick={{ fontSize: 10, fill: "rgb(var(--ink) / 0.6)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "rgb(var(--ink) / 0.6)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: "rgb(var(--ink) / 0.06)" }} contentStyle={{ background: "var(--popover-surface)", border: "1px solid var(--hairline)", borderRadius: 10, fontSize: 12 }} labelStyle={{ color: "rgb(var(--ink) / 0.8)" }} />
              <Bar dataKey="prayers" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : topics.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">{t.pjNoTopics}</p>
      ) : (
        <div className="space-y-1.5">
          {topics.map((x, i) => (
            <div key={x.name} className="flex items-center gap-2">
              <span className="text-xs capitalize text-foreground/85 w-24 truncate">{x.name}</span>
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(x.count / topics[0].count) * 100}%` }} transition={{ delay: i * 0.05, duration: 0.6 }} className="h-full rounded-full bg-accent" />
              </div>
              <span className="text-xs font-cinzel text-muted-foreground w-5 text-right">{x.count}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}