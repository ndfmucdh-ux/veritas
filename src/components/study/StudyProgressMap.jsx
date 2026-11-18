import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, Star, Flame, Trophy, Zap, BookOpen, ChevronRight, Loader2, Map } from "lucide-react";
import { loadPlanDashboard } from "@/lib/services/plansService";
import { LoadingState, EmptyState } from "@/components/ui/states";

const MILESTONE_INTERVAL = 5;
const MILESTONE_ICONS = ["🌱", "📖", "✨", "🔥", "⚡", "🏆", "👑", "💎"];
const getMilestoneIcon = (idx) => MILESTONE_ICONS[idx % MILESTONE_ICONS.length];

const PLAN_ACCENTS = {
  "New Believer Foundation": "#00f5ff",
  "Psalms of David": "#FFD700",
  "Warrior Men": "#60a5fa",
  "Proverbs 31 Woman": "#f472b6",
  "Youth Identity": "#f97316",
  "Fundamentos de la Fe": "#34d399",
  "Varón de Dios": "#818cf8",
  "Mujer de Virtud": "#f472b6",
  "Jóvenes en Cristo": "#fb923c",
  "Matrimonio Sagrado": "#f43f5e",
};

const KNOWN_DURATIONS = {
  "New Believer Foundation": 30, "Psalms of David": 30, "Warrior Men": 30,
  "Proverbs 31 Woman": 31, "Youth Identity": 21, "Fundamentos de la Fe": 30,
  "Varón de Dios": 30, "Mujer de Virtud": 31, "Jóvenes en Cristo": 21,
  "Matrimonio Sagrado": 30,
};

export default function StudyProgressMap() {
  const [progress, setProgress] = useState([]);
  const [customPlans, setCustomPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    loadPlanDashboard().then(({ progress, customPlans }) => {
      setProgress(progress);
      setCustomPlans(customPlans);
      setLoading(false);
    });
  }, []);

  const progressByPlan = {};
  (progress || []).forEach(p => {
    if (!p.plan_id) return;
    if (!progressByPlan[p.plan_id]) progressByPlan[p.plan_id] = [];
    progressByPlan[p.plan_id].push(p);
  });

  const startedPresetPlans = Object.entries(progressByPlan).map(([planId, sessions]) => ({
    id: planId, title: planId,
    completedDays: sessions.length,
    totalDays: KNOWN_DURATIONS[planId] || Math.max(30, sessions.length + 5),
    accent: PLAN_ACCENTS[planId] || "#00f5ff",
    type: "preset",
  }));

  const customPlanSummaries = customPlans.map(plan => ({
    id: plan.id,
    title: plan.title,
    icon: plan.icon || "📖",
    completedDays: (plan.completed_chapters || []).length,
    totalDays: plan.total_chapters || 0,
    accent: plan.accent_color || "#00f5ff",
    type: "custom",
  }));

  const allPlans = [...startedPresetPlans, ...customPlanSummaries].filter(p => p.totalDays > 0);

  if (loading) return <LoadingState label="Loading your journey…" size="lg" />;

  if (allPlans.length === 0) {
    return (
      <EmptyState
        icon="🗺️"
        title="No active reading plans yet"
        description="Start a reading plan to see your milestone journey here."
        action={
          <a href="/plans" className="px-4 py-2 rounded-xl text-xs font-cinzel min-h-9 inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.25)" }}>
            Browse Plans →
          </a>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {allPlans.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button onClick={() => setActivePlan(null)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-cinzel transition-all"
            style={{
              background: !activePlan ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.05)",
              color: !activePlan ? "#00f5ff" : "rgba(255,255,255,0.4)",
              border: !activePlan ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.07)",
            }}>All Plans</button>
          {allPlans.map(plan => (
            <button key={plan.id} onClick={() => setActivePlan(plan.id === activePlan ? null : plan.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-cinzel transition-all"
              style={{
                background: activePlan === plan.id ? `${plan.accent}18` : "rgba(255,255,255,0.05)",
                color: activePlan === plan.id ? plan.accent : "rgba(255,255,255,0.4)",
                border: activePlan === plan.id ? `1px solid ${plan.accent}40` : "1px solid rgba(255,255,255,0.07)",
              }}>
              {plan.title.length > 18 ? plan.title.slice(0, 18) + "…" : plan.title}
            </button>
          ))}
        </div>
      )}
      {allPlans.filter(p => !activePlan || p.id === activePlan).map(plan => (
        <PlanProgressMap key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

function PlanProgressMap({ plan }) {
  const { title, completedDays, totalDays, accent, icon } = plan;
  const pct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const milestones = [];
  for (let i = MILESTONE_INTERVAL; i <= totalDays; i += MILESTONE_INTERVAL) milestones.push(i);
  if (!milestones.includes(totalDays)) milestones.push(totalDays);
  const nodes = [0, ...milestones];

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--fill-1)", border: `1px solid ${accent}18` }}>
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: `1px solid ${accent}12` }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && <span className="text-xl flex-shrink-0">{icon}</span>}
            <div className="min-w-0">
              <h3 className="font-cinzel text-sm font-bold text-white truncate">{title}</h3>
              <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                {completedDays} of {totalDays} {plan.type === "custom" ? "chapters" : "days"} · {pct}%
              </p>
            </div>
          </div>
          <span className="font-cinzel text-lg font-bold flex-shrink-0" style={{ color: accent }}>{pct}%</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--fill-3)" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${accent}cc, ${accent})` }} />
        </div>
      </div>

      <div className="px-5 py-5">
        <p className="text-[9px] font-cinzel uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.25)" }}>
          Journey Milestones
        </p>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-start gap-0 min-w-max pb-2">
            {nodes.map((node, idx) => {
              if (idx === 0) return null;
              const milestone = node;
              const milestoneIdx = idx - 1;
              const isFinal = milestone === totalDays;
              const isDone = completedDays >= milestone;
              const isActive = !isDone && completedDays >= nodes[idx - 1];
              const segmentPct = isActive
                ? Math.round(((completedDays - nodes[idx - 1]) / (milestone - nodes[idx - 1])) * 100)
                : isDone ? 100 : 0;

              return (
                <div key={milestone} className="flex items-center">
                  <div className="relative" style={{ width: 60, height: 6, marginTop: isFinal ? 23 : 18 }}>
                    <div className="absolute inset-0 rounded-full" style={{ background: "var(--fill-3)" }} />
                    <motion.div className="absolute inset-y-0 left-0 rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${segmentPct}%` }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: milestoneIdx * 0.08 }}
                      style={{ background: `linear-gradient(90deg, ${accent}aa, ${accent})` }} />
                  </div>

                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: milestoneIdx * 0.08 + 0.1, type: "spring", stiffness: 300, damping: 20 }}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className="relative flex items-center justify-center rounded-full"
                      style={{
                        width: isFinal ? 52 : 42, height: isFinal ? 52 : 42,
                        background: isDone ? `linear-gradient(135deg, ${accent}33, ${accent}18)` : isActive ? `${accent}12` : "rgba(255,255,255,0.04)",
                        border: isDone ? `2px solid ${accent}70` : isActive ? `1.5px solid ${accent}40` : "1.5px solid rgba(255,255,255,0.1)",
                        boxShadow: isDone ? `0 0 16px ${accent}30` : isActive ? `0 0 8px ${accent}18` : "none",
                      }}>
                      {isFinal ? <span className="text-xl">{isDone ? "👑" : "🏆"}</span>
                        : isDone ? <span className="text-lg">{getMilestoneIcon(milestoneIdx)}</span>
                        : isActive ? (
                          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                            <Flame className="w-4 h-4" style={{ color: accent }} />
                          </motion.div>
                        ) : <Lock className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.18)" }} />
                      }
                      {isDone && (
                        <motion.div className="absolute inset-0 rounded-full"
                          animate={{ opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 2.5, repeat: Infinity, delay: milestoneIdx * 0.3 }}
                          style={{ border: `2px solid ${accent}`, borderRadius: "50%" }} />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-cinzel font-bold"
                        style={{ color: isDone ? accent : isActive ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)" }}>
                        {isFinal ? "Finish" : `Day ${milestone}`}
                      </p>
                      {isDone && !isFinal && <p className="text-[8px] font-inter" style={{ color: accent, opacity: 0.7 }}>✓ Done</p>}
                      {isActive && <p className="text-[8px] font-inter" style={{ color: accent, opacity: 0.8 }}>Active</p>}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-5">
          {[
            { label: "Completed", value: completedDays, icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "#34d399" },
            { label: "Remaining", value: Math.max(0, totalDays - completedDays), icon: <BookOpen className="w-3.5 h-3.5" />, color: accent },
            { label: "Milestones", value: `${milestones.filter(m => completedDays >= m).length}/${milestones.length}`, icon: <Star className="w-3.5 h-3.5" />, color: "#fbbf24" },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-3 flex flex-col items-center gap-1"
              style={{ background: "var(--fill-1)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: stat.color }}>{stat.icon}</div>
              <p className="font-cinzel text-base font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[9px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {pct < 100 && (() => {
          const nextMilestone = milestones.find(m => completedDays < m);
          if (!nextMilestone) return null;
          const remaining = nextMilestone - completedDays;
          return (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}>
              <Zap className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-cinzel font-semibold" style={{ color: accent }}>Next milestone: Day {nextMilestone}</p>
                <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {remaining} {plan.type === "custom" ? "chapter" : "day"}{remaining !== 1 ? "s" : ""} to go
                </p>
              </div>
              <a href="/plans" className="flex items-center gap-1 text-[10px] font-cinzel flex-shrink-0" style={{ color: accent }}>
                Go <ChevronRight className="w-3 h-3" />
              </a>
            </motion.div>
          );
        })()}

        {pct === 100 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl justify-center"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}>
            <Trophy className="w-5 h-5" style={{ color: "#fbbf24" }} />
            <p className="font-cinzel text-sm font-bold" style={{ color: "#fbbf24" }}>Plan Complete! 🎉</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}