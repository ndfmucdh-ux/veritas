import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, Check, HeartHandshake } from "lucide-react";
import PhotoCard, { GOLD } from "@/components/ui/PhotoCard";
import { useLang } from "@/lib/LanguageContext";
import { localRef, readHref, prayHref } from "@/components/foryou/forYouUtils";

// One study theme: dark photo card that opens into reflection, practice, passages and actions.
export default function ForYouThemeCard({ theme, copy, index, isOpen, isDone, onToggle, onDone }) {
  const { t, lang } = useLang();
  const [label, desc, reflection, practice] = copy;
  const Icon = theme.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: (index % 3) * 0.05 }}>
      <PhotoCard photo={theme.photo} mark={Icon} markClass="w-28 h-28" className="rounded-2xl">
        <button type="button" onClick={onToggle} aria-expanded={isOpen} className="w-full flex items-center gap-3 p-4 text-left">
          <span className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ border: `1px solid ${GOLD}`, background: "rgba(0,0,0,0.35)" }}>
            <Icon className="w-5 h-5" strokeWidth={1.5} style={{ color: GOLD }} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-cinzel text-base font-semibold leading-tight" style={{ color: "#fff" }}>{label}</span>
            <span className="block text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>{desc}</span>
          </span>
          {isDone && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 14 }}
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: GOLD, color: "#141414" }}><Check className="w-3.5 h-3.5" /></motion.span>
          )}
          <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform" style={{ color: "rgba(255,255,255,0.6)", transform: isOpen ? "rotate(90deg)" : "none" }} />
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: GOLD }}>{t.fyReflection}</p>
                  <p className="text-sm leading-relaxed mt-1" style={{ color: "rgba(255,255,255,0.9)" }}>{reflection}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)" }}>
                  <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: GOLD }}>{t.fyPractice}</p>
                  <p className="text-sm leading-snug mt-1" style={{ color: "#fff" }}>{practice}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] mb-1.5" style={{ color: GOLD }}>{t.fyPassages}</p>
                  <div className="space-y-1.5">
                    {theme.verses.map((ref) => (
                      <Link key={ref} to={readHref(ref)} className="flex items-center gap-2.5 px-3 min-h-11 rounded-xl" style={{ background: "rgba(255,255,255,0.1)" }}>
                        <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
                        <span className="font-cinzel text-sm flex-1 min-w-0 truncate" style={{ color: "#fff" }}>{localRef(ref, lang)}</span>
                        <ChevronRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
                      </Link>
                    ))}
                  </div>
                </div>
                {theme.cross?.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] mb-1.5" style={{ color: GOLD }}>{t.fyCrossRefs}</p>
                    <div className="space-y-1.5">
                      {theme.cross.map((ref) => (
                        <Link key={ref} to={readHref(ref)} className="flex items-center gap-2.5 px-3 min-h-11 rounded-xl" style={{ background: "rgba(255,255,255,0.1)" }}>
                          <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
                          <span className="font-cinzel text-sm flex-1 min-w-0 truncate" style={{ color: "#fff" }}>{localRef(ref, lang)}</span>
                          <ChevronRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button type="button" onClick={onDone} aria-pressed={isDone}
                    className="flex items-center justify-center gap-1.5 min-h-11 rounded-full text-xs font-cinzel font-semibold"
                    style={isDone ? { background: GOLD, color: "#141414" } : { border: `1px solid ${GOLD}`, color: GOLD }}>
                    <Check className="w-4 h-4" /> {isDone ? t.fyDone : t.fyMarkDone}
                  </button>
                  <Link to={prayHref(theme.verses[0])} className="flex items-center justify-center gap-1.5 min-h-11 rounded-full text-xs font-cinzel font-semibold" style={{ background: "rgba(255,255,255,0.14)", color: "#fff" }}>
                    <HeartHandshake className="w-4 h-4" /> {t.fyPrayAbout}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PhotoCard>
    </motion.div>
  );
}