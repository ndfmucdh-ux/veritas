import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Plus, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";
import SharedReadingPlanInvite from "./SharedReadingPlanInvite";

export default function CommunityPlanCard({ plan, isMember, joining, onJoin }) {
  const { t, lang } = useLang();
  const [added, setAdded] = useState(false);
  const sel = plan.plan_selections?.[0];
  const bookName = sel ? getTranslatedBookName(sel.book, lang) : null;
  const chapters = sel?.chapters || [];
  const total = plan.plan_total_chapters || chapters.length;
  const perDay = plan.plan_days && total ? Math.max(1, Math.ceil(total / plan.plan_days)) : null;
  const members = plan.member_count || 1;

  const addToMine = async () => {
    await base44.entities.CustomPlan.create({
      title: plan.name,
      description: plan.description || "",
      selections: plan.plan_selections || [],
      total_chapters: total,
    });
    setAdded(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 space-y-3"
      style={{ background: "hsl(var(--card))", border: "1px solid var(--hairline)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-cinzel text-base font-semibold text-foreground break-words">{plan.name}</p>
          <p className="text-xs font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.7)" }}>
            {members} {members > 1 ? t.s5Members : t.s5Member}
          </p>
        </div>
        <SharedReadingPlanInvite planId={plan.id} planName={plan.name} />
      </div>

      {plan.description && <p className="text-sm font-inter leading-snug" style={{ color: "rgb(var(--ink) / 0.8)" }}>{plan.description}</p>}

      {sel && (
        <div className="flex flex-wrap gap-1.5">
          {[
            `${bookName} ${chapters[0]}–${chapters[chapters.length - 1]}`,
            `${total} ${t.s5PlanSummary}`,
            plan.plan_days ? `${plan.plan_days} ${plan.plan_days > 1 ? t.s5Days : t.s5Day}` : null,
            perDay ? `${perDay} ${t.s5PerDayShort}` : null,
          ].filter(Boolean).map((chip) => (
            <span key={chip} className="text-[11px] font-inter px-2.5 py-1 rounded-full" style={{ background: "var(--fill-2)", color: "var(--t-gold)" }}>{chip}</span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => onJoin(plan)} disabled={joining} aria-pressed={isMember}
          className="min-h-10 rounded-xl text-xs font-cinzel font-semibold disabled:opacity-60 flex items-center justify-center gap-1.5"
          style={isMember ? { background: "hsl(var(--success) / 0.18)", color: "hsl(var(--success))" } : { background: "hsl(var(--primary) / 0.18)", color: "hsl(var(--primary))" }}>
          {joining ? "…" : isMember ? <><Check className="w-3.5 h-3.5" /> {t.s5Joined}</> : t.s5Join}
        </button>
        {sel ? (
          <Link to={`/read?book=${encodeURIComponent(sel.book)}&chapter=${chapters[0]}`}
            className="min-h-10 rounded-xl text-xs font-cinzel font-semibold flex items-center justify-center gap-1.5" style={{ background: "var(--fill-2)", color: "hsl(var(--foreground))" }}>
            <BookOpen className="w-3.5 h-3.5" /> {t.s5Start}
          </Link>
        ) : <span />}
      </div>

      {sel && (
        <button type="button" onClick={addToMine} disabled={added}
          className="w-full min-h-10 rounded-xl text-xs font-cinzel font-semibold flex items-center justify-center gap-1.5"
          style={{ border: "1px solid rgba(217,183,126,0.5)", color: "var(--t-gold)" }}>
          {added ? <><Check className="w-3.5 h-3.5" /> {t.s5Added}</> : <><Plus className="w-3.5 h-3.5" /> {t.s5AddMine}</>}
        </button>
      )}
    </motion.div>
  );
}