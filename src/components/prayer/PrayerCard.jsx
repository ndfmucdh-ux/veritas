import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, History, Trash2, ChevronDown } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { DATE_LOCALE } from "@/lib/i18nCommunity";
import { tone } from "@/components/prayer/moods";

export default function PrayerCard({
  prayer, mood, view, answeringId, answerNote,
  onSetAnswering, onAnswerNoteChange, onMarkAnswered, onDelete,
}) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const Icon = mood?.Icon;
  const date = prayer.created_date ? new Date(prayer.created_date).toLocaleDateString(DATE_LOCALE[lang], { month: "short", day: "numeric" }) : "";
  const iconBtn = "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0";

  const askDelete = () => {
    if (confirm) return onDelete(prayer.id);
    setConfirm(true);
    setTimeout(() => setConfirm(false), 3000);
  };

  return (
    <motion.article id={`prayer-${prayer.id}`} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl p-3 bg-card border border-border">
      <div className="flex items-start gap-2">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5 min-w-0">
            {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: tone(mood.v) }} />}
            <p className="font-cinzel text-sm font-semibold text-foreground truncate">{prayer.verse_ref || t.pjPersonal}</p>
            <span className="text-[11px] text-muted-foreground flex-shrink-0">{date}</span>
          </div>
          <p className={`text-sm leading-snug text-foreground/80 mt-1 whitespace-pre-wrap ${open ? "" : "line-clamp-2"}`}>{prayer.prayer_text}</p>
        </button>
        <div className="flex items-center flex-shrink-0">
          {!prayer.answered && view === "active" && (
            <button type="button" onClick={() => onSetAnswering(prayer.id === answeringId ? null : prayer.id)} title={t.pjMarkTitle} aria-label={t.pjMarkTitle}
              className={`${iconBtn} text-primary bg-primary/10`}><CheckCircle2 className="w-4 h-4" /></button>
          )}
          <button type="button" onClick={askDelete} aria-label="Delete" className={`${iconBtn} ${confirm ? "bg-destructive text-destructive-foreground" : "text-muted-foreground"}`}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {(prayer.tags?.length > 0 || prayer.answered) && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {prayer.answered && <span className="text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 text-primary bg-primary/10 border border-primary/30"><CheckCircle2 className="w-3 h-3" />{t.pjAnswered}</span>}
          {prayer.tags?.map((tag) => <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">{tag}</span>)}
          <ChevronDown className={`w-4 h-4 ml-auto text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      )}

      {prayer.answered && prayer.answered_note && (
        <div className="mt-2 rounded-xl px-3 py-2 flex items-start gap-2 bg-primary/10 border border-primary/20">
          <History className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary" />
          <div className="min-w-0">
            <p className="text-xs leading-relaxed text-foreground/85">{prayer.answered_note}</p>
            {prayer.answered_date && <p className="text-[11px] mt-0.5 text-muted-foreground">{new Date(prayer.answered_date).toLocaleDateString(DATE_LOCALE[lang], { month: "short", day: "numeric", year: "numeric" })}</p>}
          </div>
        </div>
      )}

      {answeringId === prayer.id && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 space-y-2 overflow-hidden">
          <textarea value={answerNote} onChange={(e) => onAnswerNoteChange(e.target.value)} placeholder={t.pjAnswerPh} rows={2} style={{ fontSize: 16 }}
            className="w-full rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-secondary border border-border text-foreground" />
          <div className="flex gap-2">
            <button type="button" onClick={() => onSetAnswering(null)} className="flex-1 min-h-10 rounded-full text-sm text-foreground bg-secondary">{t.cancel}</button>
            <button type="button" onClick={() => onMarkAnswered(prayer)} className="flex-1 min-h-10 rounded-full text-sm flex items-center justify-center gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="w-4 h-4" /> {t.pjMarkAnswered}
            </button>
          </div>
        </motion.div>
      )}
    </motion.article>
  );
}