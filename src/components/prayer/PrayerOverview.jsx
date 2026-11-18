import { useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, CheckCircle2, Flame, Trophy } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { DATE_LOCALE } from "@/lib/i18nCommunity";
import { computeStreaks, topTopics, dayKey } from "@/lib/prayerStats";

const BADGES = [
  [3, "badgeFaithful"], [7, "badgeDevoted"], [14, "badgePersistent"], [30, "badgeSteadfast"], [60, "badgeWarrior"], [100, "badgeElder"],
];

// Five-week grid that ends with the current week, so every column matches its weekday.
function weekGrid() {
  const start = new Date();
  start.setDate(start.getDate() - start.getDay() - 28);
  const today = dayKey(new Date());
  return Array.from({ length: 35 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dayKey(d);
    return { key, future: key > today };
  });
}

function Tile({ icon: Icon, value, label, tone }) {
  return (
    <div className="rounded-xl bg-secondary px-2.5 py-2 min-w-0">
      <div className="flex items-center gap-1.5 text-muted-foreground"><Icon className={`w-3.5 h-3.5 flex-shrink-0 ${tone}`} /><span className="text-[11px] truncate">{label}</span></div>
      <p className="font-cinzel text-xl font-semibold text-foreground leading-tight">{value}</p>
    </div>
  );
}

export default function PrayerOverview({ prayers }) {
  const { t, lang } = useLang();
  const { streak, longest, dates } = useMemo(() => computeStreaks(prayers), [prayers]);
  const topics = useMemo(() => topTopics(prayers, 5), [prayers]);
  const grid = useMemo(weekGrid, []);
  const total = prayers.length;
  const answered = prayers.filter((p) => p.answered).length;
  const pct = total ? Math.round((answered / total) * 100) : 0;
  const next = BADGES.find(([d]) => streak < d);
  const earned = BADGES.filter(([d]) => longest >= d);
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + i).toLocaleDateString(DATE_LOCALE[lang], { weekday: "narrow" }));

  return (
    <section className="rounded-2xl bg-card border border-border p-3.5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-cinzel text-base font-semibold text-foreground">{t.pjSummary}</p>
        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-cinzel border ${streak > 0 ? "text-accent border-accent/40 bg-accent/10" : "text-muted-foreground border-border"}`}>
          <Flame className="w-3.5 h-3.5" /> {t.pjStreak.replace("{n}", streak)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Tile icon={Heart} value={total} label={t.pjTotal} tone="text-primary" />
        <Tile icon={CheckCircle2} value={`${answered}`} label={`${t.pjAnswered} · ${pct}%`} tone="text-success" />
        <Tile icon={Trophy} value={longest} label={t.pjBestLbl} tone="text-accent" />
      </div>

      {total === 0 ? (
        <p className="text-xs text-center text-muted-foreground py-1">{t.pjStartHint}</p>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{t.pjWeeks}</p>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekdays.map((d, i) => <p key={i} className="text-center text-[10px] text-muted-foreground">{d}</p>)}
              {grid.map(({ key, future }, i) => {
                const on = dates.has(key);
                return (
                  <motion.div key={key} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.008 }} title={key}
                    className={`h-5 rounded-md flex items-center justify-center border ${on ? "bg-accent/25 border-accent/60" : future ? "border-transparent bg-secondary/40" : "bg-secondary border-border"}`}>
                    {on && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {next && (
            <div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                <span>{t.pjNext.replace("{name}", t[next[1]]).replace("{n}", next[0])}</span><span className="text-accent">{streak}/{next[0]}</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (streak / next[0]) * 100)}%` }} transition={{ duration: 0.9 }} className="h-full rounded-full bg-accent" />
              </div>
            </div>
          )}

          {(earned.length > 0 || topics.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {earned.map(([d, k]) => <span key={d} className="text-[11px] font-cinzel px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">{t[k]}</span>)}
              {topics.map((x) => <span key={x.name} className="text-[11px] px-2.5 py-0.5 rounded-full bg-secondary text-foreground/80 border border-border capitalize">{x.name} · {x.count}</span>)}
            </div>
          )}
        </>
      )}
    </section>
  );
}