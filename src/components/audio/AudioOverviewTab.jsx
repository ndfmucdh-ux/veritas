import { motion } from "framer-motion";
import { Target, Timer, Share2, Download } from "lucide-react";

export default function AudioOverviewTab({
  completed, streak, booksCompleted, totalMinutes, todayCount, goal,
  weeklyData, maxWeekly, onSleepTimer, onShare, onExportCSV, onExportPDF, busy,
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: "🎧", label: "Chapters Done", value: completed, color: "#00f5ff" },
          { icon: "🔥", label: "Day Streak", value: streak, color: "#fb923c" },
          { icon: "📚", label: "Books Heard", value: booksCompleted, color: "#a78bfa" },
          { icon: "⏱️", label: "Total Minutes", value: totalMinutes, color: "#34d399" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className="font-cinzel text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-inter mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-cinzel text-sm text-white flex items-center gap-2"><Target className="w-4 h-4 text-gold" /> Today's Goal</p>
          <span className="font-cinzel text-xs" style={{ color: todayCount >= goal ? "#34d399" : "#00f5ff" }}>{todayCount}/{goal} chapters</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (todayCount / goal) * 100)}%` }} transition={{ duration: 0.8 }}
            className="h-full rounded-full" style={{ background: todayCount >= goal ? "#34d399" : "#00f5ff" }} />
        </div>
        {todayCount >= goal && <p className="text-xs font-inter mt-2" style={{ color: "#34d399" }}>✅ Goal reached today!</p>}
      </div>

      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="font-cinzel text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>This Week</p>
        <div className="flex items-end gap-2 h-24">
          {weeklyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div initial={{ height: 0 }} animate={{ height: `${(d.count / maxWeekly) * 80}px` }} transition={{ delay: i * 0.05, duration: 0.5 }}
                className="w-full rounded-t-lg" style={{ background: d.count > 0 ? "rgba(0,245,255,0.4)" : "rgba(255,255,255,0.06)", minHeight: 4 }} />
              <span className="text-[9px] font-cinzel" style={{ color: "rgba(255,255,255,0.3)" }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={onSleepTimer} className="flex items-center gap-2.5 px-4 py-4 rounded-2xl font-cinzel text-sm transition-all"
          style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
          <Timer className="w-5 h-5" /> Sleep Timer
        </button>
        <button onClick={onShare} disabled={busy} className="flex items-center gap-2.5 px-4 py-4 rounded-2xl font-cinzel text-sm transition-all"
          style={{ background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
          <Share2 className="w-5 h-5" /> Share Progress
        </button>
        <button onClick={onExportCSV} disabled={busy} className="flex items-center gap-2.5 px-4 py-4 rounded-2xl font-cinzel text-sm transition-all"
          style={{ background: "rgba(0,245,255,0.06)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.15)" }}>
          <Download className="w-5 h-5" /> Export CSV
        </button>
        <button onClick={onExportPDF} disabled={busy} className="flex items-center gap-2.5 px-4 py-4 rounded-2xl font-cinzel text-sm transition-all"
          style={{ background: "rgba(52,211,153,0.06)", color: "#34d399", border: "1px solid rgba(52,211,153,0.15)" }}>
          <Download className="w-5 h-5" /> Export PDF
        </button>
      </div>

      <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(167,139,250,0.06))", border: "1px solid rgba(251,191,36,0.2)" }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
            {streak >= 7 ? "🏆" : streak >= 3 ? "⚡" : streak >= 1 ? "🔥" : "🎯"}
          </div>
          <div>
            <p className="font-cinzel text-sm font-bold text-white">
              {streak >= 7 ? "Streak Champion!" : streak >= 3 ? "On Fire!" : streak >= 1 ? "Building Momentum" : "Start Your Streak"}
            </p>
            <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              {streak >= 7 ? `${streak} days of consistent listening` : streak >= 3 ? `${streak} days — keep going!` : streak >= 1 ? "Day 1 complete!" : "Listen today to begin"}
            </p>
          </div>
        </div>
        {streak > 0 && (
          <div className="mt-3 text-xs font-cinzel" style={{ color: "#fbbf24" }}>
            +{streak >= 7 ? 50 : streak >= 3 ? 25 : 15} bonus XP earned for streak!
          </div>
        )}
      </div>
    </>
  );
}