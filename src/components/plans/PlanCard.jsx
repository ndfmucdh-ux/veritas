import { motion } from "framer-motion";
import { Leaf, Trash2 } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

const STATUS_KEY = { completed: "s6Completed", inProgress: "s6InProgress", notStarted: "s6NotStarted" };

// One reading plan, same layout for curated and custom plans.
export default function PlanCard({ title, days, description, done, total, unit = "days", photo, icon: Icon = Leaf, onClick, onDelete, index = 0 }) {
  const { t } = useLang();
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const status = pct >= 100 ? "completed" : done > 0 ? "inProgress" : "notStarted";
  const countLabel = (unit === "days" ? t.s6DaysOf : t.s6ChaptersOf).replace("{done}", done).replace("{total}", total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 8) * 0.04 }}
      role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className="flex gap-3 p-3 rounded-2xl bg-card border border-border cursor-pointer min-w-0 active:scale-[0.99] transition-transform"
      style={{ boxShadow: "0 2px 10px rgba(40,30,15,0.06)" }}
    >
      <div className="relative w-[4.5rem] h-[4.5rem] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-secondary self-start">
        {photo && <img src={photo} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "grayscale(1)" }} />}
        {photo && <div className="absolute inset-0" style={{ background: "rgba(10,10,10,0.55)" }} />}
        <Icon className="relative w-8 h-8" strokeWidth={1.3} style={{ color: photo ? "#d9b77e" : "hsl(var(--primary))" }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-cinzel text-base font-semibold text-foreground leading-tight break-words min-w-0">{title}</p>
          {onDelete && (
            <button type="button" aria-label={t.s6Delete} onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-8 h-8 -mt-1 -mr-1 rounded-full flex items-center justify-center flex-shrink-0 text-muted-foreground">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {days != null && <p className="text-xs font-semibold text-accent mt-0.5">{days} {t.s6Days}</p>}
        {description && <p className="text-xs text-muted-foreground leading-snug mt-1 line-clamp-2">{description}</p>}

        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-semibold text-foreground w-9 text-right">{pct}%</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <span className="text-[11px] text-muted-foreground truncate">{countLabel}</span>
          <span className={`text-[11px] flex-shrink-0 ${status === "completed" ? "px-2 py-0.5 rounded-md border border-border text-foreground" : "text-muted-foreground"}`}>
            {t[STATUS_KEY[status]]}
          </span>
        </div>
      </div>
    </motion.div>
  );
}