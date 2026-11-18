import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
import useSmoothNavigate from "@/hooks/useSmoothNavigate";
import { useLang } from "@/lib/LanguageContext";
import { FOR_YOU_META } from "@/lib/forYouMeta";
import { getForYouText } from "@/lib/forYouText";
import { useForYouProgress } from "@/components/foryou/forYouUtils";
import ForYouHero from "@/components/foryou/ForYouHero";
import ForYouKeyVerse from "@/components/foryou/ForYouKeyVerse";
import ForYouThemeCard from "@/components/foryou/ForYouThemeCard";
import ForYouQuestions from "@/components/foryou/ForYouQuestions";

export default function ForYouSection() {
  const { category } = useParams();
  const navigate = useSmoothNavigate();
  const { t, lang } = useLang();
  const [openTheme, setOpenTheme] = useState(0);
  const [done, toggleDone] = useForYouProgress(category);

  const meta = FOR_YOU_META[category];
  const text = meta ? getForYouText(lang, category) : null;

  // Unknown category goes back home (in an effect, never during render).
  useEffect(() => {
    if (!meta) navigate("/", { replace: true });
  }, [meta, navigate]);

  useEffect(() => { setOpenTheme(0); }, [category]);

  if (!meta) return null;

  const title = t[meta.labelKey];
  const passages = meta.themes.reduce((n, th) => n + th.verses.length, 0);

  return (
    <div className="md:ml-16 min-h-screen pb-28 px-4 pt-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <ForYouHero meta={meta} title={title} text={text} doneCount={done.length} totalThemes={meta.themes.length} passages={passages} onBack={() => navigate(-1)} />

        <ForYouKeyVerse verseRef={meta.key} text={text.keyText} />

        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground px-1">{t.fyThemesTitle} · {t.fyThemesCount.replace("{n}", meta.themes.length)}</p>
          {meta.themes.map((theme, i) => (
            <ForYouThemeCard key={`${category}-${i}`} theme={theme} copy={text.themes[i]} index={i}
              isOpen={openTheme === i} isDone={done.includes(i)}
              onToggle={() => setOpenTheme(openTheme === i ? null : i)} onDone={() => toggleDone(i)} />
          ))}
        </div>

        <ForYouQuestions questions={text.qs} verseRef={meta.key} />

        <Link to={`/plans?cat=${meta.planCat}`} className="block">
          <motion.div whileTap={{ scale: 0.98 }} className="rounded-2xl px-4 py-3.5 flex items-center gap-3 bg-card border border-border">
            <span className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0"><BookOpen className="w-5 h-5 text-primary" /></span>
            <span className="flex-1 min-w-0">
              <span className="block font-cinzel text-sm font-semibold text-foreground">{t.fyPlansTitle}</span>
              <span className="block text-xs text-muted-foreground">{t.fyPlansSub.replace("{name}", title)}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </motion.div>
        </Link>
      </div>
    </div>
  );
}