import { motion } from "framer-motion";
import { Users, Lock, Globe, Crown } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

export const GROUP_CATEGORIES = [
  { id: "study_group", key: "cmStudy" },
  { id: "prayer_circle", key: "cmPrayerCircles" },
  { id: "accountability", key: "cmAccountability" },
  { id: "mens_group", key: "cmMens" },
  { id: "womens_group", key: "cmWomens" },
];

// One group in a list: name, type, members, plan progress and a single action.
export default function GroupCard({ group, actionLabel, onAction, busy }) {
  const { t } = useLang();
  const cat = GROUP_CATEGORIES.find((c) => c.id === group.category) || GROUP_CATEGORIES[0];
  const PrivacyIcon = group.privacy === "private" ? Lock : Globe;
  const total = group.progress?.total || 0;
  const pct = total ? (group.progress.done / total) * 100 : 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-3.5 bg-card border border-border flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-cinzel text-base font-semibold text-foreground leading-tight break-words">{group.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t[cat.key]}</p>
        </div>
        {group.role === "owner" && <Crown className="w-4 h-4 text-primary flex-shrink-0" aria-label={t.cmOwner} />}
      </div>
      {group.description && <p className="text-sm text-foreground/75 line-clamp-2">{group.description}</p>}
      {total > 0 && (
        <div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
          <p className="text-[11px] text-muted-foreground mt-1">{t.cmChaptersDone.replace("{done}", group.progress.done).replace("{total}", total)}</p>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="flex items-center gap-3 text-xs text-muted-foreground min-w-0">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{t.cmMembersN.replace("{n}", group.member_count)}</span>
          {group.privacy && <PrivacyIcon className="w-3.5 h-3.5" />}
        </span>
        <button type="button" disabled={busy} onClick={onAction} className="px-4 min-h-9 rounded-full text-xs font-cinzel font-semibold bg-primary text-primary-foreground flex-shrink-0 disabled:opacity-60">{actionLabel}</button>
      </div>
    </motion.div>
  );
}