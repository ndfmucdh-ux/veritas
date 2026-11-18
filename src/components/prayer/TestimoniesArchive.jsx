import { motion } from "framer-motion";
import { CheckCircle2, History, Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/states";
import { useLang } from "@/lib/LanguageContext";
import { DATE_LOCALE } from "@/lib/i18nCommunity";
import { MOODS } from "@/components/prayer/moods";

export default function TestimoniesArchive({ prayers }) {
  const { t, lang } = useLang();
  if (prayers.length === 0) return <EmptyState icon={Heart} title={t.pjNoTest} description={t.pjNoTestDesc} />;

  return (
    <div className="space-y-2.5">
      <div className="rounded-2xl p-3 flex items-center gap-3 bg-primary/10 border border-primary/25">
        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <p className="font-cinzel text-sm font-semibold text-foreground">{t.pjArchive}</p>
          <p className="text-xs text-muted-foreground">{t.pjArchiveCount.replace("{n}", prayers.length)}</p>
        </div>
      </div>

      {prayers.map((prayer, i) => {
        const mood = MOODS.find((m) => m.id === prayer.mood);
        const MoodIcon = mood?.Icon;
        return (
          <motion.div key={prayer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }}
            className="rounded-2xl p-3 bg-card border border-border">
            <div className="flex items-center gap-1.5 min-w-0">
              {MoodIcon && <MoodIcon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
              <p className="font-cinzel text-sm font-semibold text-foreground truncate flex-1">{prayer.verse_ref || t.pjPersonal}</p>
              {prayer.answered_date && <span className="text-[11px] text-muted-foreground flex-shrink-0">{new Date(prayer.answered_date).toLocaleDateString(DATE_LOCALE[lang], { month: "short", day: "numeric", year: "numeric" })}</span>}
            </div>
            <p className="text-xs leading-snug text-muted-foreground mt-1 line-clamp-2">{prayer.prayer_text}</p>
            {prayer.answered_note && (
              <div className="mt-2 rounded-xl px-3 py-2 flex items-start gap-2 bg-primary/10 border border-primary/20">
                <History className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary" />
                <p className="text-xs leading-relaxed text-foreground/90">{prayer.answered_note}</p>
              </div>
            )}
            {prayer.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">{prayer.tags.map((tag) => <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">{tag}</span>)}</div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}