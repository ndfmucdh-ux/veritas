import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock } from "lucide-react";

export default function PlanTimeline({ plan, completedDays, onSelectDay, selectedDay }) {
  const totalDays = plan.duration_days;
  const progressPct = Math.round((completedDays / totalDays) * 100);

  return (
    <div className="px-4 pb-4">
      {/* Compact progress summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-cinzel" style={{ color: "rgba(255,255,255,0.4)" }}>
          {completedDays} / {totalDays} days
        </p>
        <p className="font-cinzel text-sm font-bold" style={{ color: plan.accent }}>{progressPct}%</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5"
          style={{ background: "var(--fill-3)" }} />
        {/* Progress fill */}
        <motion.div
          className="absolute left-5 top-5 w-0.5"
          initial={{ height: 0 }}
          animate={{ height: `${progressPct}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: `linear-gradient(180deg, ${plan.accent}, ${plan.accent}55)` }}
        />

        <div className="space-y-2">
          {plan.days.map((day, idx) => {
            const done = completedDays >= day.day;
            const isCurrent = completedDays === day.day - 1;
            const isOpen = selectedDay?.day === day.day;
            const isLocked = day.day > completedDays + 1;

            return (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
              >
                <button
                  className="w-full flex items-center gap-4 text-left"
                  onClick={() => !isLocked && onSelectDay(isOpen ? null : day)}
                  disabled={isLocked}
                >
                  {/* Node */}
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 relative"
                    animate={isCurrent ? { boxShadow: [`0 0 0 0 ${plan.accent}55`, `0 0 0 8px transparent`] } : {}}
                    transition={isCurrent ? { duration: 2, repeat: Infinity } : {}}
                    style={{
                      background: done
                        ? `linear-gradient(135deg, ${plan.accent}33, ${plan.accent}11)`
                        : isCurrent
                        ? `linear-gradient(135deg, ${plan.accent}22, ${plan.accent}0a)`
                        : "rgba(255,255,255,0.04)",
                      border: done
                        ? `1.5px solid ${plan.accent}55`
                        : isCurrent
                        ? `1.5px solid ${plan.accent}44`
                        : "1.5px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4" style={{ color: plan.accent }} />
                    ) : isLocked ? (
                      <Lock className="w-3 h-3" style={{ color: "rgba(255,255,255,0.15)" }} />
                    ) : (
                      <span className="text-[11px] font-cinzel font-bold"
                        style={{ color: isCurrent ? plan.accent : "rgba(255,255,255,0.3)" }}>
                        {day.day}
                      </span>
                    )}
                  </motion.div>

                  {/* Content */}
                  <div
                    className="flex-1 py-3 px-4 rounded-xl transition-all"
                    style={{
                      background: isOpen
                        ? `${plan.accent}0a`
                        : done
                        ? "rgba(255,255,255,0.025)"
                        : isCurrent
                        ? `${plan.accent}07`
                        : "transparent",
                      border: isOpen
                        ? `1px solid ${plan.accent}25`
                        : isCurrent
                        ? `1px solid ${plan.accent}18`
                        : "1px solid transparent",
                      opacity: isLocked ? 0.35 : 1,
                    }}
                  >
                    <p className="text-[10px] font-inter mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Day {day.day}
                    </p>
                    <p className="font-cinzel text-sm font-semibold"
                      style={{ color: done ? plan.accent : isCurrent ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)" }}>
                      {day.title}
                    </p>
                    {day.verses?.length > 0 && (
                      <p className="text-[10px] font-inter mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                        {day.verses[0]}{day.verses.length > 1 ? ` +${day.verses.length - 1}` : ""}
                      </p>
                    )}
                    {isCurrent && !done && (
                      <span className="inline-block mt-1 text-[9px] font-cinzel px-2 py-0.5 rounded-full"
                        style={{ background: `${plan.accent}18`, color: plan.accent }}>
                        Up Next
                      </span>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}