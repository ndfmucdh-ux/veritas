import { motion } from "framer-motion";
import { CheckCircle2, History, Trash2 } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { DATE_LOCALE } from "@/lib/i18nCommunity";
import { tone } from "@/components/prayer/moods";

export default function PrayerCard({
  prayer, mood, view, answeringId, answerNote,
  onSetAnswering, onAnswerNoteChange, onMarkAnswered, onDelete,
}) {
  const { t, lang } = useLang();
  const v = mood?.v || "--primary";
  const Icon = mood?.Icon;
  return (
    <motion.div
      id={`prayer-${prayer.id}`}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
      className="rounded-2xl p-5 bg-card border border-border shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-cinzel text-lg font-semibold text-foreground">{prayer.verse_ref}</p>
          <div className="flex items-center flex-wrap gap-2 mt-1.5">
            {Icon && <Icon className="w-3.5 h-3.5" style={{ color: tone(v) }} />}
            <span className="text-xs text-muted-foreground">{mood ? t[mood.labelKey] : ""}</span>
            {prayer.answered && (
              <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 text-primary bg-primary/10 border border-primary/30">
                <CheckCircle2 className="w-3 h-3" /> {t.pjAnswered}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!prayer.answered && view === "active" && (
            <button onClick={() => onSetAnswering(prayer.id === answeringId ? null : prayer.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-primary border border-primary/40 hover:bg-primary/10 transition-colors"
              title={t.pjMarkTitle}>
              <CheckCircle2 className="w-3.5 h-3.5" /> {t.pjAnswered}
            </button>
          )}
          <button onClick={() => onDelete(prayer.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3">{prayer.prayer_text}</p>

      {prayer.answered && prayer.answered_note && (
        <div className="mt-3 rounded-xl px-3 py-2.5 flex items-start gap-2 bg-primary/10 border border-primary/20">
          <History className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary" />
          <div>
            <p className="text-xs leading-relaxed text-foreground/85">{prayer.answered_note}</p>
            {prayer.answered_date && (
              <p className="text-xs mt-0.5 text-muted-foreground">
                {new Date(prayer.answered_date).toLocaleDateString(DATE_LOCALE[lang], { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      )}

      {answeringId === prayer.id && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-2">
          <textarea value={answerNote} onChange={e => onAnswerNoteChange(e.target.value)}
            placeholder={t.pjAnswerPh} rows={2}
            className="w-full rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary bg-background border border-border text-foreground" />
          <div className="flex gap-2">
            <button onClick={() => onSetAnswering(null)} className="flex-1 py-2 rounded-xl text-sm text-muted-foreground border border-border">{t.cancel}</button>
            <button onClick={() => onMarkAnswered(prayer)}
              className="flex-1 py-2 rounded-xl text-sm flex items-center justify-center gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="w-4 h-4" /> {t.pjMarkAnswered}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}