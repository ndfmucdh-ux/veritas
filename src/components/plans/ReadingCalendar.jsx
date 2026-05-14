import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, X, CheckCircle2 } from "lucide-react";

export default function ReadingCalendar({ progress, accent = "#00f5ff" }) {
  const [offset, setOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null); // { key, date, sessions }

  const { year, month, calDays, completedSet, sessionsByDate } = useMemo(() => {
    const now = new Date();
    now.setMonth(now.getMonth() + offset);
    const year = now.getFullYear();
    const month = now.getMonth();

    // Group sessions by date string (YYYY-MM-DD)
    const sessionsByDate = {};
    (progress || []).forEach(p => {
      const dateKey = p.completed_at?.slice(0, 10);
      if (!dateKey) return;
      if (!sessionsByDate[dateKey]) sessionsByDate[dateKey] = [];
      sessionsByDate[dateKey].push(p);
    });

    const completedSet = new Set(Object.keys(sessionsByDate));

    // Build calendar days (pad from Sunday)
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calDays = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    return { year, month, calDays, completedSet, sessionsByDate };
  }, [progress, offset]);

  const monthName = new Date(year, month).toLocaleString("en-US", { month: "long", year: "numeric" });
  const today = new Date().toISOString().slice(0, 10);
  const pad2 = n => String(n).padStart(2, "0");
  const dayKey = d => `${year}-${pad2(month + 1)}-${pad2(d)}`;

  const completedCount = calDays.filter(d => d && completedSet.has(dayKey(d))).length;

  const handleDayTap = (d) => {
    const key = dayKey(d);
    const sessions = sessionsByDate[key];
    if (!sessions?.length) return;
    const date = new Date(year, month, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    setSelectedDay({ key, date, sessions });
  };

  return (
    <div className="rounded-2xl overflow-visible"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <button onClick={() => { setOffset(o => o - 1); setSelectedDay(null); }}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="font-cinzel text-sm font-bold text-white">{monthName}</p>
          <p className="text-[10px] font-inter mt-0.5" style={{ color: accent }}>
            {completedCount} reading day{completedCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => { setOffset(o => Math.min(0, o + 1)); setSelectedDay(null); }}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
          disabled={offset >= 0}>
          <ChevronRight className="w-4 h-4" style={{ opacity: offset >= 0 ? 0.25 : 1 }} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 px-3 pb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <p key={d} className="text-center text-[9px] font-cinzel pb-1" style={{ color: "rgba(255,255,255,0.2)" }}>{d}</p>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 px-3 pb-4">
        {calDays.map((d, i) => {
          if (!d) return <div key={`pad-${i}`} />;
          const key = dayKey(d);
          const isToday = key === today;
          const done = completedSet.has(key);
          const isSelected = selectedDay?.key === key;
          const sessionCount = sessionsByDate[key]?.length || 0;

          return (
            <motion.button
              key={key}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.005, duration: 0.2 }}
              whileTap={done ? { scale: 0.88 } : {}}
              onClick={() => done ? handleDayTap(d) : undefined}
              className="aspect-square rounded-lg flex flex-col items-center justify-center relative"
              style={{
                background: isSelected
                  ? `${accent}35`
                  : done
                    ? `${accent}18`
                    : isToday
                      ? "rgba(255,255,255,0.07)"
                      : "transparent",
                border: isSelected
                  ? `1.5px solid ${accent}`
                  : isToday
                    ? `1px solid ${accent}55`
                    : done
                      ? `1px solid ${accent}40`
                      : "1px solid rgba(255,255,255,0.04)",
                cursor: done ? "pointer" : "default",
                boxShadow: isSelected ? `0 0 12px ${accent}30` : "none",
              }}
            >
              {done && (
                <div className="absolute top-1 right-1">
                  <div className="w-1 h-1 rounded-full" style={{ background: accent }} />
                </div>
              )}
              <span
                className="text-[10px] font-inter"
                style={{
                  color: done ? accent : isToday ? "white" : "rgba(255,255,255,0.4)",
                  fontWeight: isToday || done ? "600" : "400",
                }}
              >
                {d}
              </span>
              {sessionCount > 1 && (
                <span className="text-[7px] font-cinzel mt-0.5" style={{ color: accent, opacity: 0.8 }}>
                  {sessionCount}×
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Day detail panel */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t"
            style={{ borderColor: `${accent}22` }}
          >
            <div className="px-4 py-4">
              {/* Date header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-cinzel text-sm font-bold text-white">{selectedDay.date}</p>
                  <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {selectedDay.sessions.length} session{selectedDay.sessions.length !== 1 ? "s" : ""} completed
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sessions list */}
              <div className="space-y-2">
                {selectedDay.sessions.map((session, idx) => {
                  const book = session.book || "—";
                  const chapter = session.chapter;
                  const planId = session.plan_id;
                  const isRealBook = book !== "Plan" && book !== "—";
                  const label = isRealBook
                    ? `${book}${chapter ? ` ${chapter}` : ""}`
                    : planId
                      ? `${planId} · Day ${chapter}`
                      : "Reading Session";

                  const translation = session.translation || "KJV";
                  const readHref = isRealBook
                    ? `/read?book=${encodeURIComponent(book)}&chapter=${chapter || 1}&translation=${translation}`
                    : null;

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{
                        background: `${accent}08`,
                        border: `1px solid ${accent}20`,
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-cinzel text-sm text-white font-semibold truncate">{label}</p>
                        {translation && isRealBook && (
                          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{translation}</p>
                        )}
                      </div>
                      {readHref && (
                        <a
                          href={readHref}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-cinzel flex-shrink-0"
                          style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
                        >
                          <BookOpen className="w-3 h-3" /> Read
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}