import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from "lucide-react";
import { listReadingActivity } from "@/lib/dataAccess";

export default function ReadingCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDates, setActiveDates] = useState(new Set()); // "YYYY-MM-DD" with reading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real reading activity from consolidated reading sessions (legacy fallback inside)
    listReadingActivity({ limit: 365 })
      .then(records => {
        const set = new Set();
        (records || []).forEach(r => {
          const key = (r.created_date || "").slice(0, 10);
          if (key) set.add(key);
        });
        setActiveDates(set);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const dateKey = (day) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const metCount = days.filter(d => d && activeDates.has(dateKey(d))).length;
  const monthGoalPercentage = Math.round((metCount / daysInMonth) * 100);

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

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
          <p className="font-cinzel text-sm font-semibold text-white">Reading Calendar</p>
        </div>
        <span className="text-[10px] font-cinzel px-2.5 py-1 rounded-full" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
          {metCount} / {daysInMonth}
        </span>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={handlePrevMonth} className="p-1.5 rounded-lg"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
        <p className="font-cinzel text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
          {monthName}
        </p>
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleNextMonth} className="p-1.5 rounded-lg"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-[10px] font-cinzel" style={{ color: "rgba(255,255,255,0.3)" }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const isMet = day && activeDates.has(dateKey(day));
          const isToday = day === new Date().getDate()
            && currentMonth.getMonth() === new Date().getMonth()
            && currentMonth.getFullYear() === new Date().getFullYear();

          return (
            <motion.div
              key={idx}
              whileHover={day ? { scale: 1.05 } : {}}
              className="aspect-square rounded-lg flex items-center justify-center text-xs font-cinzel cursor-pointer"
              style={{
                background: isMet
                  ? "rgba(52,211,153,0.2)"
                  : day
                  ? "rgba(255,255,255,0.04)"
                  : "transparent",
                border: isToday
                  ? "1.5px solid #00f5ff"
                  : isMet
                  ? "1px solid rgba(52,211,153,0.3)"
                  : "1px solid rgba(255,255,255,0.07)",
                color: day ? (isMet ? "#34d399" : "rgba(255,255,255,0.4)") : "transparent"
              }}
            >
              {day && (
                <>
                  {day}
                  {isMet && <span className="text-[6px] absolute">✓</span>}
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>Days read this month</p>
          <span className="font-cinzel font-bold text-white">{monthGoalPercentage}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${monthGoalPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #34d399, #06b6d4)" }}
          />
        </div>
      </div>
    </div>
  );
}