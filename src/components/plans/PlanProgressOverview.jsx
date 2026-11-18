import { Leaf } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

// Progress ring + three numbers. `stats` is [{ value, label }] (max 3).
export default function PlanProgressOverview({ pct, stats }) {
  const { t } = useLang();
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <section className="relative overflow-hidden rounded-2xl bg-card border border-border p-4">
      <Leaf aria-hidden="true" className="absolute -right-3 -bottom-3 w-24 h-24 opacity-10 text-primary" strokeWidth={1} />
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">{t.s6Overview}</p>
      <div className="relative flex items-center gap-4">
        <div className="relative w-[4.5rem] h-[4.5rem] flex-shrink-0">
          <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
            <circle cx="36" cy="36" r={r} fill="none" strokeWidth="6" stroke="hsl(var(--secondary))" />
            <circle cx="36" cy="36" r={r} fill="none" strokeWidth="6" strokeLinecap="round" stroke="hsl(var(--primary))"
              strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, pct) / 100)} style={{ transition: "stroke-dashoffset 0.8s" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-cinzel text-base font-bold leading-none text-foreground">{pct}%</span>
            <span className="text-[9px] text-muted-foreground mt-0.5">{t.s6Complete}</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-2 min-w-0">
          {stats.map((s) => (
            <div key={s.label} className="min-w-0 text-center">
              <p className="font-cinzel text-lg font-semibold text-foreground leading-tight truncate">{s.value}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}