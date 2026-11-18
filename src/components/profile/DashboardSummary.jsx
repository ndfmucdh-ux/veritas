import { motion } from "framer-motion";
import { BookOpen, Clock, Highlighter, StickyNote } from "lucide-react";

export default function DashboardSummary({ readingProgress = 0, notesCount = 0, highlightsCount = 0 }) {
  const estimatedMinutes = readingProgress * 3;
  const hours = Math.floor(estimatedMinutes / 60);
  const mins = estimatedMinutes % 60;
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const stats = [
    {
      icon: BookOpen,
      color: "#00f5ff",
      value: readingProgress,
      label: "Reading Sessions",
      sub: "Saved chapter activity",
      glow: "rgba(0,245,255,0.12)",
    },
    {
      icon: Clock,
      color: "#a78bfa",
      value: timeLabel,
      label: "Estimated Time",
      sub: "Based on sessions",
      glow: "rgba(167,139,250,0.12)",
    },
    {
      icon: Highlighter,
      color: "#fbbf24",
      value: highlightsCount,
      label: "Highlights",
      sub: "Verses marked for study",
      glow: "rgba(251,191,36,0.1)",
    },
    {
      icon: StickyNote,
      color: "#34d399",
      value: notesCount,
      label: "Notes",
      sub: "Personal reflections",
      glow: "rgba(52,211,153,0.1)",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl p-4"
          style={{ background: s.glow, border: `1px solid ${s.color}25` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <s.icon className="w-4 h-4" style={{ color: s.color }} />
            <p className="text-[9px] font-cinzel uppercase tracking-widest" style={{ color: "rgb(var(--ink) / 0.35)" }}>
              {s.label}
            </p>
          </div>
          <p className="font-cinzel text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.3)" }}>{s.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}