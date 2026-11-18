import { useState } from "react";
import { ChevronLeft, Leaf } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import PlanProgressOverview from "@/components/plans/PlanProgressOverview";
import PlanDayRow from "@/components/plans/PlanDayRow";
import PlanDownloadButton from "@/components/plans/PlanDownloadButton";
import PlanInvitePanel from "@/components/plans/PlanInvitePanel";
import ReadingCalendar from "@/components/plans/ReadingCalendar";

const GOLD = "#d9b77e";

export default function PresetPlanDetail({ plan, progress, completed, isDayComplete, completeDay, onBack }) {
  const { t } = useLang();
  const [view, setView] = useState("list");
  const total = plan.duration_days;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  const seg = (id, label) => (
    <button key={id} type="button" onClick={() => setView(id)}
      className={`px-4 min-h-9 rounded-full text-xs font-cinzel font-semibold ${view === id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{label}</button>
  );

  return (
    <div className="md:ml-16 min-h-screen pb-28 px-4 pt-4 space-y-4 max-w-2xl mx-auto">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground min-h-9">
        <ChevronLeft className="w-4 h-4" /> {t.back}
      </button>

      <header>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t.s6Eyebrow}</p>
        <h1 className="font-cinzel text-3xl font-semibold text-foreground leading-tight mt-1">{plan.title}</h1>
        <p className="text-sm text-muted-foreground mt-1.5 leading-snug">{plan.description}</p>
      </header>

      <PlanProgressOverview pct={pct} stats={[
        { value: completed, label: t.s6DaysDone },
        { value: Math.max(0, total - completed), label: t.s6Remaining },
        { value: total, label: t.s6Days },
      ]} />

      <PlanDownloadButton plan={plan} accentColor={GOLD} />

      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t.s6DailyReadings}</p>
        <div className="flex p-0.5 rounded-full bg-secondary">{seg("list", t.s6List)}{seg("calendar", t.s6Calendar)}</div>
      </div>

      {view === "calendar" ? (
        <ReadingCalendar progress={progress} accent={GOLD} />
      ) : (
        <div className="space-y-2">
          {plan.days.map((day) => (
            <PlanDayRow key={day.day} day={day} category={plan.category} done={isDayComplete(plan.title, day.day)} onComplete={() => completeDay(plan.title, day.day)} />
          ))}
          {plan.days.length < total && (
            <p className="text-xs text-center text-muted-foreground py-3">{total - plan.days.length} {t.s6Days.toLowerCase()}</p>
          )}
        </div>
      )}

      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
        <Leaf className="w-3.5 h-3.5 text-primary" /> {t.s6KeepGoing}
      </p>

      <PlanInvitePanel planTitle={plan.title} planCategory={plan.category} />
    </div>
  );
}