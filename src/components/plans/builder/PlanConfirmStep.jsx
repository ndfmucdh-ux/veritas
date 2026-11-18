import { BIBLE_BOOKS, getTranslatedBookName } from "@/lib/bibleData";
import { DATE_LOCALE } from "@/lib/i18nCommunity";
import { useLang } from "@/lib/LanguageContext";

function Stat({ label, value }) {
  return (
    <div className="rounded-xl p-3 text-center bg-secondary border border-border">
      <p className="font-cinzel text-base font-bold text-primary">{value}</p>
      <p className="text-xs mt-0.5 text-muted-foreground">{label}</p>
    </div>
  );
}

export default function PlanConfirmStep({ f, selections, totalChapters, estimatedDays }) {
  const { t, lang } = useLang();
  const fmt = (d) => new Date(d + "T00:00:00").toLocaleDateString(DATE_LOCALE[lang] || "en-US", { month: "short", day: "numeric" });
  return (
    <div className="space-y-4 pt-2">
      <div className="rounded-2xl p-4 bg-card border border-border">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{f.icon}</span>
          <div className="min-w-0">
            <p className="font-cinzel text-base font-bold text-foreground break-words">{f.title}</p>
            {f.description && <p className="text-xs mt-0.5 text-muted-foreground">{f.description}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label={t.bpStatChapters} value={totalChapters} />
          <Stat label={t.bpStatDaily} value={t.bpChShort.replace("{n}", f.dailyGoal)} />
          {f.startDate && <Stat label={t.bpStatStart} value={fmt(f.startDate)} />}
          {estimatedDays && <Stat label={t.bpStatEst} value={estimatedDays} />}
          {f.targetDate && <Stat label={t.bpStatDeadline} value={fmt(f.targetDate)} />}
        </div>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-2">{t.bpBooksSel}</p>
        <div className="space-y-1.5">
          {Object.entries(selections).map(([book, chapters]) => (
            <div key={book} className="flex items-center justify-between px-3 min-h-10 rounded-xl bg-secondary">
              <span className="text-sm font-cinzel text-foreground">{getTranslatedBookName(book, lang)}</span>
              <span className="text-xs text-primary">
                {chapters.size === BIBLE_BOOKS.find((b) => b.name === book)?.chapters ? t.bpAllChapters : t.bpChapters.replace("{n}", chapters.size)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}