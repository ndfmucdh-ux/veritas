import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle2, Circle, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PRESET_PLANS = [
  {
    title: "New Believer Foundation",
    description: "A 30-day journey through the essentials of Christian faith",
    duration_days: 30,
    category: "new_believer",
    emoji: "🌱",
    days: [
      { day: 1, title: "Who Is God?", verses: ["John 1:1-14"], devotional: "In the beginning was the Word. God has always existed and created everything from nothing. Today, reflect on the eternal nature of God." },
      { day: 2, title: "God's Love for You", verses: ["John 3:16-17", "Romans 5:8"], devotional: "Before you did anything to deserve it, God loved you. His love is unconditional and sacrificial." },
      { day: 3, title: "The Gift of Salvation", verses: ["Ephesians 2:8-9", "Romans 10:9-10"], devotional: "Salvation is a gift — not earned by works but received by faith. Today, simply thank God for grace." },
    ]
  },
  {
    title: "Psalms of David",
    description: "Journey through the heart of worship in 30 days",
    duration_days: 30,
    category: "general",
    emoji: "🎵",
    days: [
      { day: 1, title: "The Blessed Life", verses: ["Psalm 1"], devotional: "The blessed life begins with delight in God's Word." },
      { day: 2, title: "God as Shepherd", verses: ["Psalm 23"], devotional: "The Lord is your shepherd — you lack nothing in His care." },
      { day: 3, title: "Crying Out to God", verses: ["Psalm 22"], devotional: "Even in our darkest hour, God hears our cry." },
    ]
  },
  {
    title: "Warrior Men",
    description: "30 days of strength, integrity, and godly manhood",
    duration_days: 30,
    category: "men",
    emoji: "⚔️",
    days: [
      { day: 1, title: "Be Strong & Courageous", verses: ["Joshua 1:1-9"], devotional: "True courage is not the absence of fear, but choosing to act in obedience to God despite it." },
      { day: 2, title: "The Heart of a Leader", verses: ["1 Samuel 16:1-13"], devotional: "God looks at the heart, not outward appearances. What does your heart look like today?" },
    ]
  },
  {
    title: "Proverbs 31 Woman",
    description: "A 31-day devotional journey through noble womanhood",
    duration_days: 31,
    category: "women",
    emoji: "🌸",
    days: [
      { day: 1, title: "A Noble Character", verses: ["Proverbs 31:10-12"], devotional: "Virtue is more precious than gold. Today, reflect on what makes a life truly noble." },
    ]
  },
  {
    title: "Youth Identity",
    description: "Who am I? 21 days discovering your identity in Christ",
    duration_days: 21,
    category: "youth",
    emoji: "🔥",
    days: [
      { day: 1, title: "Made in His Image", verses: ["Genesis 1:26-27", "Psalm 139:13-14"], devotional: "You are not an accident. You were deliberately crafted by God in His image." },
    ]
  },
];

export default function Plans() {
  const [activePlan, setActivePlan] = useState(null);
  const [progress, setProgress] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.entities.ReadingProgress.filter({ plan_id: { $exists: true } })
      .then(p => setProgress(p || []))
      .catch(() => {});
  }, []);

  const getCompletedDays = (planTitle) => {
    return progress.filter(p => p.plan_id === planTitle).length;
  };

  const isDayComplete = (planTitle, day) => {
    return progress.some(p => p.plan_id === planTitle && p.chapter === day);
  };

  const completeDay = async (planTitle, day) => {
    if (isDayComplete(planTitle, day)) return;
    try {
      await base44.entities.ReadingProgress.create({
        plan_id: planTitle,
        book: "Plan",
        chapter: day,
        translation: "KJV",
        completed_at: new Date().toISOString()
      });
      base44.functions.invoke("updateXP", { action: "COMPLETE_PLAN_DAY", xp_amount: 25 });
      setProgress(prev => [...prev, { plan_id: planTitle, chapter: day }]);
    } catch (e) {}
  };

  if (activePlan) {
    const completed = getCompletedDays(activePlan.title);
    const pct = Math.round((completed / activePlan.duration_days) * 100);

    return (
      <div className="md:ml-16 min-h-screen px-4 pt-6">
        <button onClick={() => setActivePlan(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
          ← Back to Plans
        </button>
        <div className="mb-6">
          <div className="text-4xl mb-2">{activePlan.emoji}</div>
          <h1 className="font-cinzel text-2xl font-bold">{activePlan.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{activePlan.description}</p>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{completed} of {activePlan.duration_days} days</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan to-purple" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        <div className="space-y-3 pb-8">
          {activePlan.days.map(day => {
            const done = isDayComplete(activePlan.title, day.day);
            const active = !done;
            return (
              <motion.div key={day.day} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: day.day * 0.03 }}
                className={`glass rounded-xl p-4 border transition-colors cursor-pointer ${done ? "border-green-500/30" : "border-border/50 hover:border-cyan/30"}`}
                onClick={() => setSelectedDay(selectedDay?.day === day.day ? null : day)}
              >
                <div className="flex items-center gap-3">
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Day {day.day}</p>
                    <p className="font-cinzel text-sm font-semibold text-foreground">{day.title}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {day.verses.map(v => (
                        <span key={v} className="text-xs px-1.5 py-0.5 rounded bg-cyan/10 text-cyan">{v}</span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${selectedDay?.day === day.day ? "rotate-90" : ""}`} />
                </div>

                {selectedDay?.day === day.day && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-foreground/80 font-inter leading-relaxed mb-4">{day.devotional}</p>
                    {!done && (
                      <button
                        onClick={(e) => { e.stopPropagation(); completeDay(activePlan.title, day.day); }}
                        className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-cyan/20 text-cyan hover:bg-cyan/30 transition-colors font-cinzel"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark Complete
                      </button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {activePlan.days.length < activePlan.duration_days && (
            <div className="glass rounded-xl p-8 text-center border border-dashed border-border/50">
              <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">More days available in the full plan</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{activePlan.duration_days - activePlan.days.length} more days of scripture and devotions</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="md:ml-16 min-h-screen px-4 pt-6">
      <div className="mb-6">
        <h1 className="font-cinzel text-2xl font-bold mb-1">Reading Plans</h1>
        <p className="text-muted-foreground text-sm">Structured journeys through Scripture</p>
      </div>

      <div className="space-y-4 pb-8">
        {PRESET_PLANS.map((plan, i) => {
          const completed = getCompletedDays(plan.title);
          const pct = Math.round((completed / plan.duration_days) * 100);
          const started = completed > 0;

          return (
            <motion.div key={plan.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              onClick={() => setActivePlan(plan)}
              className="glass rounded-xl p-5 border border-border/50 hover:border-cyan/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{plan.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-cinzel text-base font-bold text-foreground">{plan.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{plan.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{plan.category}</span>
                    <span className="text-xs text-muted-foreground">{plan.duration_days} days</span>
                    {started && <span className="text-xs text-cyan">{pct}% complete</span>}
                  </div>
                  {started && (
                    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan to-purple" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}