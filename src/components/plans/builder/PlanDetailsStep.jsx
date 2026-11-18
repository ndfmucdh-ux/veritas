import { CalendarDays, Minus, Plus } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

const ACCENT_COLORS = ["#8BA888", "#C9A66B", "#C17B5C", "#5B8C8C", "#a64d62", "#7d5a22", "#3f6275", "#9a5238"];
const ICONS = ["📖", "✝️", "🙏", "⭐", "🔥", "💎", "🌿", "🕊️", "🌟", "⚔️"];
const field = "w-full rounded-xl px-4 min-h-11 text-sm bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const lbl = "text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1.5";

export { ACCENT_COLORS };

export default function PlanDetailsStep({ f, set, daysUntilStart, daysUntilTarget, estimatedDays, minDate }) {
  const { t } = useLang();
  const step = "w-11 h-11 rounded-xl bg-secondary text-foreground flex items-center justify-center";
  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
        <div>
          <p className={lbl}>{t.bpIcon}</p>
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map((em) => (
              <button key={em} type="button" onClick={() => set({ icon: em })} aria-pressed={f.icon === em}
                className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border ${f.icon === em ? "bg-primary/15 border-primary" : "bg-secondary border-border"}`}>{em}</button>
            ))}
          </div>
        </div>
        <div>
          <p className={lbl}>{t.bpColor}</p>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((c) => (
              <button key={c} type="button" aria-label={c} onClick={() => set({ accentColor: c })} className="w-8 h-8 rounded-full"
                style={{ background: c, boxShadow: f.accentColor === c ? `0 0 0 2px hsl(var(--card)), 0 0 0 4px ${c}` : "none" }} />
            ))}
          </div>
        </div>
      </div>

      <div><p className={lbl}>{t.bpPlanTitle}</p>
        <input value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder={t.bpTitlePh} className={field} style={{ fontSize: 16 }} /></div>
      <div><p className={lbl}>{t.bpDesc}</p>
        <textarea value={f.description} onChange={(e) => set({ description: e.target.value })} placeholder={t.bpDescPh} rows={2} className={`${field} py-2.5 resize-none`} style={{ fontSize: 16 }} /></div>

      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0"><p className={lbl}>{t.bpStart}</p>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input type="date" value={f.startDate} min={minDate} onChange={(e) => set({ startDate: e.target.value })} className={`${field} pl-9 pr-2`} style={{ fontSize: 16 }} />
          </div>
          {daysUntilStart > 0 && <p className="text-xs mt-1 text-primary">{t.bpStartsIn.replace("{n}", daysUntilStart)}</p>}
        </div>
        <div className="min-w-0"><p className={lbl}>{t.bpTarget}</p>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input type="date" value={f.targetDate} min={minDate} onChange={(e) => set({ targetDate: e.target.value })} className={`${field} pl-9 pr-2`} style={{ fontSize: 16 }} />
          </div>
          {daysUntilTarget && <p className="text-xs mt-1 text-primary">{t.bpUntil.replace("{n}", daysUntilTarget)}</p>}
        </div>
      </div>

      <div>
        <p className={lbl}>{t.bpDaily}</p>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="-" onClick={() => set({ dailyGoal: Math.max(1, f.dailyGoal - 1) })} className={step}><Minus className="w-4 h-4" /></button>
          <div className="flex-1 text-center">
            <p className="font-cinzel text-2xl font-bold text-primary">{f.dailyGoal}</p>
            <p className="text-xs text-muted-foreground">{f.dailyGoal > 1 ? t.bpChDayN : t.bpChDay1}</p>
          </div>
          <button type="button" aria-label="+" onClick={() => set({ dailyGoal: Math.min(10, f.dailyGoal + 1) })} className={step}><Plus className="w-4 h-4" /></button>
        </div>
        {estimatedDays && <p className="text-xs mt-2 text-center text-muted-foreground">{t.bpEst.replace("{n}", estimatedDays)}</p>}
      </div>
    </div>
  );
}