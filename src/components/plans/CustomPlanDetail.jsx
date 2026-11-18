import { ChevronLeft, Check } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import PlanProgressOverview from "@/components/plans/PlanProgressOverview";
import PlanInvitePanel from "@/components/plans/PlanInvitePanel";

export default function CustomPlanDetail({ plan, onBack, onToggleChapter }) {
  const { t } = useLang();
  const total = plan.total_chapters || 0;
  const doneKeys = plan.completed_chapters || [];
  const done = doneKeys.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const daysLeft = plan.target_date ? Math.ceil((new Date(plan.target_date) - new Date()) / 86400000) : null;
  const dailyGoal = parseInt(localStorage.getItem(`veritas_plan_daily_${plan.id}`) || localStorage.getItem(`veritas_plan_daily_${plan.title}`) || "1");
  const estDays = dailyGoal > 0 ? Math.ceil((total - done) / dailyGoal) : null;
  const deadlineLabel = daysLeft !== null ? (daysLeft > 0 ? t.s6Deadline : t.s6Overdue) : t.s6EstDone;
  const deadlineValue = daysLeft !== null ? `${Math.abs(daysLeft)}d` : estDays ? `${estDays}d` : "—";

  return (
    <div className="md:ml-16 min-h-screen pb-28 px-4 pt-4 space-y-4 w-full max-w-5xl mx-auto">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground min-h-9">
        <ChevronLeft className="w-4 h-4" /> {t.back}
      </button>

      <header>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t.s6Eyebrow}</p>
        <h1 className="font-cinzel text-3xl font-semibold text-foreground leading-tight mt-1 break-words">{plan.title}</h1>
        {plan.description && <p className="text-sm text-muted-foreground mt-1.5 leading-snug">{plan.description}</p>}
      </header>

      <PlanProgressOverview pct={pct} stats={[
        { value: `${done}/${total}`, label: t.s6ChaptersLbl },
        { value: `${dailyGoal}`, label: t.s6DailyGoal },
        { value: deadlineValue, label: deadlineLabel },
      ]} />

      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t.s6ChaptersLbl}</p>
      <div className="space-y-2">
        {(plan.selections || []).map((sel) => {
          const inBook = doneKeys.filter((k) => k.startsWith(`${sel.book}:`)).length;
          return (
            <div key={sel.book} className="rounded-xl bg-card border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-cinzel text-sm font-semibold text-foreground">{sel.book}</p>
                <span className="text-xs text-muted-foreground">{inBook}/{sel.chapters.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sel.chapters.map((ch) => {
                  const isDone = doneKeys.includes(`${sel.book}:${ch}`);
                  return (
                    <button key={ch} type="button" onClick={() => onToggleChapter(plan, sel.book, ch)} aria-pressed={isDone}
                      className="w-9 h-9 rounded-lg text-xs font-cinzel font-semibold flex items-center justify-center"
                      style={isDone ? { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" } : { background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}>
                      {isDone ? <Check className="w-3.5 h-3.5" /> : ch}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <PlanInvitePanel planTitle={plan.title} planCategory="custom" />
    </div>
  );
}