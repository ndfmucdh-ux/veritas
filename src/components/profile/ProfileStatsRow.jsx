import { BookOpen, Highlighter, StickyNote, Heart } from "lucide-react";

export default function ProfileStatsRow({ sessions = 0, highlights = 0, notes = 0, saved = 0 }) {
  const stats = [
    { label: "Sessions", value: sessions, icon: BookOpen, color: "#00f5ff" },
    { label: "Highlights", value: highlights, icon: Highlighter, color: "#fbbf24" },
    { label: "Notes", value: notes, icon: StickyNote, color: "#a78bfa" },
    { label: "Saved", value: saved, icon: Heart, color: "#f472b6" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 px-5 mb-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color }} />
          <p className="font-cinzel text-lg font-bold text-white">{value}</p>
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
        </div>
      ))}
    </div>
  );
}