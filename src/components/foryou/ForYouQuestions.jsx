import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { RefreshCw, HeartHandshake } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { prayHref } from "@/components/foryou/forYouUtils";

// Reflection questions shown one at a time, with a prayer shortcut.
export default function ForYouQuestions({ questions, verseRef }) {
  const { t } = useLang();
  const [i, setI] = useState(0);

  return (
    <section className="rounded-2xl bg-card border border-border p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{t.fyQuestions}</p>
      <div className="min-h-[5.5rem] flex items-center">
        <AnimatePresence mode="wait">
          <motion.p key={i} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.25 }}
            className="font-playfair italic text-xl leading-snug text-foreground">{questions[i]}</motion.p>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground flex-1">{t.fyQOf.replace("{n}", i + 1).replace("{total}", questions.length)}</span>
        <button type="button" onClick={() => setI((i + 1) % questions.length)} className="flex items-center gap-1.5 px-3 min-h-10 rounded-full bg-secondary text-foreground text-xs font-cinzel font-semibold">
          <RefreshCw className="w-3.5 h-3.5" /> {t.fyNextQ}
        </button>
        <Link to={prayHref(verseRef)} className="flex items-center gap-1.5 px-3 min-h-10 rounded-full bg-primary text-primary-foreground text-xs font-cinzel font-semibold">
          <HeartHandshake className="w-3.5 h-3.5" /> {t.fyPray}
        </Link>
      </div>
    </section>
  );
}