import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Sparkles, Loader2, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";

// One daily reading: small day pill, title, passages, completion check. Tap to expand.
export default function PlanDayRow({ day, done, category, onComplete }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [devo, setDevo] = useState(null);
  const [loading, setLoading] = useState(false);

  const first = day.verses?.[0] || "";
  const readHref = `/read?book=${encodeURIComponent(first.split(" ").slice(0, -1).join(" ") || "John")}&chapter=${first.split(":")[0]?.split(" ").slice(-1)[0] || 1}`;

  const generate = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateDevotional", { verse_ref: first, category });
      setDevo(res.data?.devotional || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="flex items-center gap-2.5 p-2.5">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex-1 min-w-0 flex items-center gap-2.5 text-left">
          <span className="flex-shrink-0 px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold tracking-wide uppercase">
            {t.s6Day} {day.day}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-cinzel text-sm font-semibold text-foreground truncate">{day.title}</span>
            <span className="block text-[11px] text-muted-foreground truncate">{day.verses?.join(" · ")}</span>
          </span>
          <ChevronDown className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <button type="button" onClick={() => !done && onComplete()} aria-label={t.s6MarkDone} aria-pressed={done}
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={done ? { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" } : { border: "1.5px solid hsl(var(--border))" }}>
          {done && <Check className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 pt-1 border-t border-border space-y-3">
              <p className="text-sm leading-relaxed text-foreground/85 pt-2">{devo?.reflection || day.devotional}</p>
              {devo?.insights?.length > 0 && (
                <ul className="space-y-1">
                  {devo.insights.map((s, i) => <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-accent">·</span>{s}</li>)}
                </ul>
              )}
              {devo?.application && <p className="text-sm rounded-lg bg-secondary p-2.5 text-foreground/85">{devo.application}</p>}
              {day.prayer && <p className="text-sm font-playfair italic text-muted-foreground border-l-2 border-accent pl-3">{day.prayer}</p>}
              <div className="flex flex-wrap gap-2">
                {!done && (
                  <button type="button" onClick={onComplete} className="px-3 min-h-9 rounded-lg bg-primary text-primary-foreground text-xs font-cinzel font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> {t.s6MarkDone}
                  </button>
                )}
                <button type="button" onClick={generate} disabled={loading} className="px-3 min-h-9 rounded-lg bg-secondary text-foreground text-xs font-cinzel font-semibold flex items-center gap-1.5">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} {t.s6AI}
                </button>
                <a href={readHref} className="px-3 min-h-9 rounded-lg bg-secondary text-foreground text-xs font-cinzel font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> {t.s6Read}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}