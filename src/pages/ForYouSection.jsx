import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { SECTIONS } from "@/components/foryou/forYouSections";
import ForYouThemeCard from "@/components/foryou/ForYouThemeCard";

export default function ForYouSection() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [expandedTheme, setExpandedTheme] = useState(null);

  const section = SECTIONS[category];

  // Redirect for an unknown category must happen in an effect, not during render
  // (calling navigate() in the render body triggers a React update-during-render warning).
  useEffect(() => {
    if (!section) navigate("/", { replace: true });
  }, [section, navigate]);

  if (!section) return null;

  const SectionIcon = section.icon;

  return (
    <div className="md:ml-16 min-h-screen pb-28 px-4">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl mb-6 mt-4"
        style={{ background: `linear-gradient(135deg, ${section.color}18, ${section.color}06)`, border: `1px solid ${section.color}33` }}>
        <div className="px-6 py-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-xs font-cinzel" style={{ color: "rgba(255,255,255,0.4)" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Volver
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${section.color}22`, border: `2px solid ${section.color}44` }}>
              <SectionIcon className="w-8 h-8" style={{ color: section.color }} />
            </div>
            <div>
              <h1 className="font-cinzel text-2xl font-bold text-white">{section.title}</h1>
              <p className="text-sm font-inter mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{section.subtitle}</p>
            </div>
          </div>
          <p className="mt-4 text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{section.intro}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Temas de Estudio</p>
          <div className="space-y-3">
            {section.themes.map((theme, i) => (
              <ForYouThemeCard key={i} theme={theme} index={i} color={section.color}
                isExpanded={expandedTheme === i} onToggle={() => setExpandedTheme(expandedTheme === i ? null : i)} />
            ))}
          </div>
        </div>

        {/* Reading Plans CTA */}
        <Link to={`/plans?cat=${section.planCat}`}>
          <motion.div whileTap={{ scale: 0.98 }} className="rounded-2xl px-5 py-4 flex items-center gap-4"
            style={{ background: `${section.color}10`, border: `1px solid ${section.color}33` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${section.color}22` }}>
              <BookOpen className="w-5 h-5" style={{ color: section.color }} />
            </div>
            <div className="flex-1">
              <p className="font-cinzel text-sm font-semibold text-white">Planes de Lectura</p>
              <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Ver todos los planes para {section.title.toLowerCase()}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: section.color }} />
          </motion.div>
        </Link>
      </div>
    </div>
  );
}