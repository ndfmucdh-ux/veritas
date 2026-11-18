import { motion } from "framer-motion";
import { CheckCircle2, History, Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/states";
import { useLang } from "@/lib/LanguageContext";
import { DATE_LOCALE } from "@/lib/i18nCommunity";
import { MOODS } from "@/components/prayer/moods";

export default function TestimoniesArchive({ prayers }) {
  const { t, lang } = useLang();
  if (prayers.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title={t.pjNoTest}
        description={t.pjNoTestDesc}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(52,211,153,0.15)" }}>
          <CheckCircle2 className="w-5 h-5" style={{ color: "#34d399" }} />
        </div>
        <div>
          <p className="font-cinzel text-sm font-semibold text-white">{t.pjArchive}</p>
          <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(52,211,153,0.7)" }}>
            {t.pjArchiveCount.replace("{n}", prayers.length)}
          </p>
        </div>
      </div>

      {prayers.map((prayer, idx) => {
        const mood = MOODS.find(m => m.id === prayer.mood);
        const MoodIcon = mood?.Icon;
        return (
          <motion.div
            key={prayer.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl p-4"
            style={{ background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.15)" }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-cinzel text-sm text-white">{prayer.verse_ref || t.pjPersonal}</p>
                <div className="flex items-center gap-2 mt-1">
                  {MoodIcon && <MoodIcon className="w-3.5 h-3.5 text-muted-foreground" />}
                  <span className="text-xs text-muted-foreground">{mood ? t[mood.labelKey] : ""}</span>
                  <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                    <CheckCircle2 className="w-2.5 h-2.5" /> {t.pjAnswered}
                  </span>
                </div>
              </div>
              {prayer.answered_date && (
                <span className="text-[10px] font-inter flex-shrink-0" style={{ color: "rgb(var(--ink) / 0.25)" }}>
                  {new Date(prayer.answered_date).toLocaleDateString(DATE_LOCALE[lang], { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>

            {/* Original prayer */}
            <p className="text-xs font-inter leading-relaxed mb-3 line-clamp-2"
              style={{ color: "rgb(var(--ink) / 0.5)" }}>{prayer.prayer_text}</p>

            {/* Testimony note */}
            {prayer.answered_note && (
              <div className="rounded-xl px-3 py-2.5 flex items-start gap-2"
                style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <History className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#34d399" }} />
                <p className="text-xs font-inter leading-relaxed" style={{ color: "rgba(52,211,153,0.9)" }}>
                  {prayer.answered_note}
                </p>
              </div>
            )}

            {/* Tags */}
            {prayer.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {prayer.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-inter"
                    style={{ background: "var(--fill-2)", color: "rgb(var(--ink) / 0.3)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}