import { useState } from "react";
import { Search, Plus, Target, ChevronRight, Leaf, Shield, Flower2, Zap, Star, Gem, Sprout, BookOpen } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import PlanCard from "@/components/plans/PlanCard";
import ReadingStatsChart from "@/components/plans/ReadingStatsChart";

const CATS = [
  ["all", "s6All", Leaf], ["men", "s4Men", Shield], ["women", "s4Women", Flower2], ["youth", "s4Youth", Zap],
  ["kids", "s4Kids", Star], ["marriage", "s4Marriage", Gem], ["new_believer", "s4NewBeliever", Sprout],
];
const CAT_ICON = { men: Shield, women: Flower2, youth: Zap, kids: Star, marriage: Gem, new_believer: Sprout, general: BookOpen };
const TABS = [["all", "s6All"], ["inProgress", "s6InProgress"], ["completed", "s6Completed"], ["notStarted", "s6NotStarted"]];

const statusOf = (done, total) => (total > 0 && done >= total ? "completed" : done > 0 ? "inProgress" : "notStarted");
const chip = (active) => ({
  background: active ? "hsl(var(--primary) / 0.18)" : "hsl(var(--card))",
  color: active ? "hsl(var(--primary))" : "rgb(var(--ink) / 0.8)",
  border: active ? "1px solid hsl(var(--primary) / 0.5)" : "1px solid var(--hairline)",
});

export default function PlansListView({ presets, customPlans, getCompletedDays, onOpenPreset, onOpenCustom, onDeleteCustom, onBuild }) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [cat, setCat] = useState(new URLSearchParams(window.location.search).get("cat") || "all");
  const [langF, setLangF] = useState("all");

  const matches = (title, done, total) =>
    title.toLowerCase().includes(query.trim().toLowerCase()) && (tab === "all" || statusOf(done, total) === tab);

  const custom = customPlans.filter((p) => matches(p.title, (p.completed_chapters || []).length, p.total_chapters || 0));
  const curated = presets.filter((p) =>
    (cat === "all" || p.category === cat) && (langF === "all" || p.lang === langF) && matches(p.title, getCompletedDays(p.title), p.duration_days));

  return (
    <div className="md:ml-16 min-h-screen pb-28 px-4 pt-6 space-y-4 max-w-2xl mx-auto">
      <header>
        <h1 className="font-cinzel text-3xl font-semibold text-foreground">{t.readingPlansTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.structuredJourneys}</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.s6Search}
          className="w-full min-h-11 pl-10 pr-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" style={{ fontSize: 16 }} />
      </div>

      <div className="grid grid-cols-4 border-b border-border" role="tablist">
        {TABS.map(([id, key]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`min-w-0 px-1 min-h-11 text-xs font-cinzel font-semibold truncate border-b-2 -mb-px ${tab === id ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>
            {t[key]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATS.map(([id, key, Icon]) => (
          <button key={id} type="button" onClick={() => setCat(id)} className="flex items-center gap-1.5 px-3 min-h-9 rounded-full text-xs" style={chip(cat === id)}>
            <Icon className="w-3.5 h-3.5" /> {t[key]}
          </button>
        ))}
        {[["all", "All"], ["en", "English"], ["es", "Español"]].slice(1).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setLangF(langF === id ? "all" : id)} className="px-3 min-h-9 rounded-full text-xs" style={chip(langF === id)}>{label}</button>
        ))}
      </div>

      {custom.length > 0 && (
        <section className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t.s6MyPlans}</p>
          {custom.map((p, i) => (
            <PlanCard key={p.id} index={i} title={p.title} description={p.description} unit="chapters"
              done={(p.completed_chapters || []).length} total={p.total_chapters || 0}
              onClick={() => onOpenCustom(p)} onDelete={() => onDeleteCustom(p.id)} />
          ))}
        </section>
      )}

      <section className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t.s6Curated}</p>
        {curated.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">{t.s6None}</p>}
        {curated.map((p, i) => (
          <PlanCard key={p.title} index={i} title={p.title} days={p.duration_days} description={p.description} photo={p.photo}
            icon={CAT_ICON[p.category] || Leaf} done={getCompletedDays(p.title)} total={p.duration_days} onClick={() => onOpenPreset(p)} />
        ))}
      </section>

      <button type="button" onClick={onBuild}
        className="w-full flex items-center gap-3 p-3 rounded-2xl text-left bg-card border border-dashed border-border">
        <span className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0"><Target className="w-5 h-5 text-primary" /></span>
        <span className="flex-1 min-w-0">
          <span className="block font-cinzel text-sm font-semibold text-foreground">{t.s6BuildTitle}</span>
          <span className="block text-xs text-muted-foreground">{t.s6BuildSub}</span>
        </span>
        <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"><Plus className="w-4 h-4" /></span>
      </button>

      <ReadingStatsChart />
    </div>
  );
}