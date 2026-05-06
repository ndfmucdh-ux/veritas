import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function ReadingCalendar({ progress, accent = "#00f5ff" }) {
  const [offset, setOffset] = useState(0); // 0 = current month, -1 = prev, etc.

  const { year, month, calDays, completedSet } = useMemo(() => {
    const now = new Date();
    now.setMonth(now.getMonth() + offset);
    const year = now.getFullYear();
    const month = now.getMonth();

    // Build completed date set from progress
    const completedSet = new Set(
      (progress || [])
        .map(p => p.completed_at?.slice(0, 10))
        .filter(Boolean)
    );

    // Build calendar days (pad from Mon)
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const pad = firstDay; // pad from Sunday
    const calDays = [
      ...Array(pad).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    return { year, month, calDays, completedSet };
  }, [progress, offset]);

  const monthName = new Date(year, month).toLocaleString("en-US", { month: "long", year: "numeric" });
  const today = new Date().toISOString().slice(0, 10);

  const pad2 = n => String(n).padStart(2, "0");
  const dayKey = (d) => `${year}-${pad2(month + 1)}-${pad2(d)}`;

  const completedCount = calDays.filter(d => d && completedSet.has(dayKey(d))).length;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <button onClick={() => setOffset(o => o - 1)}
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
        <button onClick={() => setOffset(o => Math.min(0, o + 1))}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
          disabled={offset >= 0}>
          <ChevronRight className="w-4 h-4" style={{ opacity: offset >= 0 ? 0.25 : 1 }} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 px-3 pb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
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
          return (
            <motion.div key={key}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.005, duration: 0.2 }}
              className="aspect-square rounded-lg flex items-center justify-center relative"
              style={{
                background: done ? `${accent}22` : isToday ? "rgba(255,255,255,0.07)" : "transparent",
                border: isToday ? `1px solid ${accent}55` : done ? `1px solid ${accent}44` : "1px solid rgba(255,255,255,0.04)",
              }}>
              {done && (
                <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                </div>
              )}
              <span className="text-[10px] font-inter relative z-10"
                style={{ color: done ? accent : isToday ? "white" : "rgba(255,255,255,0.4)", fontWeight: isToday ? "600" : "400" }}>
                {d}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}