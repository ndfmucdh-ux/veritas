import { motion } from "framer-motion";
import { Trophy, Flame, Star, Award, Target, Heart, BookOpen, Zap } from "lucide-react";

const MILESTONES = [
  { id: "first_prayer_week", name: "Prayer Warrior", icon: "🙏", color: "#a78bfa", unlockedAt: 7, description: "7 days of consistent prayer" },
  { id: "reading_month", name: "Bible Scholar", icon: "📖", color: "#00f5ff", unlockedAt: 30, description: "30 days of Bible reading" },
  { id: "streak_21", name: "Unstoppable", icon: "🔥", color: "#f97316", unlockedAt: 21, description: "21-day reading streak" },
  { id: "streak_100", name: "Century Club", icon: "💯", color: "#fbbf24", unlockedAt: 100, description: "100-day reading streak" },
  { id: "prayer_50", name: "Intercessor", icon: "✝️", color: "#f472b6", unlockedAt: 50, description: "50 prayer journal entries" },
  { id: "highlights_100", name: "Verse Collector", icon: "⭐", color: "#34d399", unlockedAt: 100, description: "100 verses highlighted" },
  { id: "notes_50", name: "Reflection Master", icon: "✍️", color: "#a78bfa", unlockedAt: 50, description: "50 study notes" },
  { id: "audio_days_14", name: "Audio Explorer", icon: "🎧", color: "#00f5ff", unlockedAt: 14, description: "14 days of audio listening" },
];

export default function MilestoneBadges({ streak = 0, prayerCount = 0, highlightCount = 0, noteCount = 0, audioDays = 0 }) {
  const unlockedBadges = MILESTONES.filter(m => {
    if (m.id === "first_prayer_week" || m.id === "prayer_50") return prayerCount >= m.unlockedAt;
    if (m.id === "reading_month") return streak >= m.unlockedAt;
    if (m.id === "streak_21" || m.id === "streak_100") return streak >= m.unlockedAt;
    if (m.id === "highlights_100") return highlightCount >= m.unlockedAt;
    if (m.id === "notes_50") return noteCount >= m.unlockedAt;
    if (m.id === "audio_days_14") return audioDays >= m.unlockedAt;
    return false;
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4" style={{ color: "#fbbf24" }} />
        <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgb(var(--ink) / 0.3)" }}>Milestone Achievements</p>
        <span className="text-xs font-cinzel px-2 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
          {unlockedBadges.length}/{MILESTONES.length}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {MILESTONES.map((badge) => {
          const unlocked = unlockedBadges.find(b => b.id === badge.id);
          return (
            <motion.div
              key={badge.id}
              whileHover={unlocked ? { scale: 1.08 } : {}}
              className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-all"
              style={{
                background: unlocked ? `${badge.color}15` : "rgb(var(--ink) / 0.03)",
                border: unlocked ? `1px solid ${badge.color}40` : "1px solid rgb(var(--ink) / 0.06)",
                opacity: unlocked ? 1 : 0.5,
              }}
              title={badge.description}
            >
              <span className="text-2xl">{badge.icon}</span>
              <p className="text-[9px] font-cinzel text-center leading-tight" style={{ color: unlocked ? badge.color : "rgb(var(--ink) / 0.25)" }}>
                {badge.name}
              </p>
              {!unlocked && (
                <p className="text-[8px] font-inter text-center" style={{ color: "rgb(var(--ink) / 0.2)" }}>
                  {badge.unlockedAt} to unlock
                </p>
              )}
              {unlocked && (
                <span className="text-xs" style={{ color: badge.color }}>✓</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}