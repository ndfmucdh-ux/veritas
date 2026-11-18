import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from "lucide-react";
import { listReadingActivity } from "@/lib/dataAccess";
import { useLang } from "@/lib/LanguageContext";
import { DATE_LOCALE } from "@/lib/i18nCommunity";

const card = { background: "hsl(var(--card))", border: "1px solid var(--hairline)" };

export default function ReadingCalendar() {
  const { t, lang } = useLang();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDates, setActiveDates] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listReadingActivity({ limit: 365 })
      .then((records) => setActiveDates(new Set((records || []).map((r) => (r.created_date || "").slice(0, 10)).filter(Boolean))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const y = currentMonth.getFullYear();
  const m = currentMonth.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstDay = new Date(y, m, 1).getDay();
  const days = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const dateKey = (d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const now = new Date();
  const isToday = (d) => d === now.getDate() && m === now.getMonth() && y === now.getFullYear();

  const metCount = days.filter((d) => d && activeDates.has(dateKey(d))).length;
  const pct = Math.round((metCount / daysInMonth) * 100);
  const locale = DATE_LOCALE[lang] || "en-US";
  const monthName = currentMonth.toLocaleDateString(locale, { month: "long", year: "numeric" });
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2023, 0, 1 + i).toLocaleDateString(locale, { weekday: "narrow" }));
  const navBtn = "w-9 h-9 rounded-full flex items-center justify-center";

  if (loading) {
    return <div className="rounded-2xl flex items-center justify-center min-h-[14rem]" style={card}><Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--t-gold)" }} /></div>;
  }

  return (
    <div className="rounded-2xl p-3.5" style={card}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "var(--t-gold)" }} />
          <p className="font-cinzel text-sm font-semibold text-foreground truncate">{t.s5Calendar}</p>
        </div>
        <span className="text-xs font-cinzel px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: "var(--fill-2)", color: "var(--t-gold)" }}>{metCount} / {daysInMonth}</span>
      </div>

      <div className="flex items-center justify-between mb-1.5">
        <button onClick={() => setCurrentMonth(new Date(y, m - 1))} aria-label="Previous month" className={navBtn} style={{ background: "var(--fill-2)", color: "hsl(var(--foreground))" }}><ChevronLeft className="w-4 h-4" /></button>
        <p className="font-cinzel text-sm capitalize text-foreground">{monthName}</p>
        <button onClick={() => setCurrentMonth(new Date(y, m + 1))} aria-label="Next month" className={navBtn} style={{ background: "var(--fill-2)", color: "hsl(var(--foreground))" }}><ChevronRight className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((d, i) => <div key={i} className="text-center text-[11px] font-cinzel" style={{ color: "rgb(var(--ink) / 0.7)" }}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const met = day && activeDates.has(dateKey(day));
          return (
            <div key={idx} className="h-8 rounded-full flex items-center justify-center text-xs font-cinzel"
              style={{
                background: met ? "#d9b77e" : "transparent",
                color: met ? "#1a1408" : day ? "rgb(var(--ink) / 0.85)" : "transparent",
                fontWeight: met || isToday(day) ? 700 : 400,
                border: day && isToday(day) ? "1.5px solid #d9b77e" : "1.5px solid transparent",
              }}>
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <p className="text-xs font-inter flex-1" style={{ color: "rgb(var(--ink) / 0.75)" }}>{t.s5DaysRead}</p>
        <div className="h-1.5 w-24 rounded-full overflow-hidden" style={{ background: "var(--fill-3)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#d9b77e" }} />
        </div>
        <span className="font-cinzel text-sm font-bold text-foreground w-10 text-right">{pct}%</span>
      </div>
    </div>
  );
}