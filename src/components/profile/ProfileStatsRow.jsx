import { BookOpen, Highlighter, StickyNote, Heart } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

export default function ProfileStatsRow({ sessions = 0, highlights = 0, notes = 0, saved = 0 }) {
  const { t } = useLang();
  const stats = [
    { label: t.s5Sessions, value: sessions, icon: BookOpen },
    { label: t.s5Highlights, value: highlights, icon: Highlighter },
    { label: t.s5Notes, value: notes, icon: StickyNote },
    { label: t.s5Saved, value: saved, icon: Heart },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 px-5 my-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-2xl py-2.5 px-1 text-center min-w-0" style={{ background: "hsl(var(--card))", border: "1px solid var(--hairline)" }}>
          <Icon className="w-4 h-4 mx-auto mb-1" strokeWidth={1.5} style={{ color: "var(--t-gold)" }} />
          <p className="font-cinzel text-lg font-bold leading-none text-foreground">{value}</p>
          <p className="text-[10px] font-inter mt-1 truncate" style={{ color: "rgb(var(--ink) / 0.7)" }}>{label}</p>
        </div>
      ))}
    </div>
  );
}