import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, HeartHandshake } from "lucide-react";
import PhotoCard, { GOLD } from "@/components/ui/PhotoCard";
import { useLang } from "@/lib/LanguageContext";
import { prayHref } from "@/components/foryou/forYouUtils";

// Black-and-white photo header with the golden icon, progress and the two main actions.
export default function ForYouHero({ meta, title, text, doneCount, totalThemes, passages, onBack }) {
  const { t } = useLang();
  const Icon = meta.icon;
  const pct = totalThemes ? (doneCount / totalThemes) * 100 : 0;

  return (
    <PhotoCard photo={meta.photo} mark={Icon} markClass="w-40 h-40" className="rounded-3xl" innerClassName="p-5">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs min-h-9 mb-3" style={{ color: "rgba(255,255,255,0.75)" }}>
        <ArrowLeft className="w-4 h-4" /> {t.back}
      </button>

      <div className="flex items-center gap-3">
        <motion.div initial={{ scale: 0.6, rotate: -12, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ border: `1.5px solid ${GOLD}`, background: "rgba(0,0,0,0.35)" }}>
          <Icon className="w-7 h-7" strokeWidth={1.4} style={{ color: GOLD }} />
        </motion.div>
        <div className="min-w-0">
          <h1 className="font-cinzel text-3xl font-semibold leading-tight break-words" style={{ color: "#fff" }}>{title}</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.78)" }}>{text.sub}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>{text.intro}</p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
          <span>{t.fyProgress.replace("{done}", doneCount).replace("{total}", totalThemes)}</span>
          <span style={{ color: GOLD }}>{t.fyPassagesCount.replace("{n}", passages)}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.18)" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full" style={{ background: GOLD }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link to={`/plans?cat=${meta.planCat}`} className="flex items-center justify-center gap-2 min-h-11 rounded-full text-sm font-cinzel font-semibold" style={{ background: GOLD, color: "#141414" }}>
          <BookOpen className="w-4 h-4" /> {t.fyStartPlan}
        </Link>
        <Link to={prayHref(meta.key)} className="flex items-center justify-center gap-2 min-h-11 rounded-full text-sm font-cinzel font-semibold" style={{ border: `1px solid ${GOLD}`, color: GOLD }}>
          <HeartHandshake className="w-4 h-4" /> {t.fyPray}
        </Link>
      </div>
    </PhotoCard>
  );
}