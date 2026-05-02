import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Zap, Trophy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getLevelForXP, LEVELS } from "@/lib/bibleData";

export default function XPStreakBar() {
  const [xpData, setXpData] = useState(null);

  useEffect(() => {
    loadXP();
  }, []);

  const loadXP = async () => {
    try {
      const records = await base44.entities.UserXP.list();
      if (records && records.length > 0) setXpData(records[0]);
    } catch (e) {
      setXpData({ total_xp: 0, streak_days: 0, level: "Seeker" });
    }
  };

  const xp = xpData?.total_xp || 0;
  const streak = xpData?.streak_days || 0;
  const level = getLevelForXP(xp);
  const nextLevel = LEVELS.find(l => l.minXP > xp);
  const progress = nextLevel
    ? ((xp - level.minXP) / (nextLevel.minXP - level.minXP)) * 100
    : 100;

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Streak */}
      <div className="glass rounded-xl p-4 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-400" />
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-cinzel text-foreground">{streak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
      </div>

      {/* XP */}
      <div className="glass rounded-xl p-4 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-cyan/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-cyan" />
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-cinzel text-foreground">{xp.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </div>
      </div>

      {/* Level */}
      <div className="glass rounded-xl p-4 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-purple/20 flex items-center justify-center">
          <span className="text-xl">{level.icon}</span>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold font-cinzel" style={{ color: level.color }}>{level.name}</p>
          <p className="text-xs text-muted-foreground">Level</p>
        </div>
      </div>

      {/* XP Progress Bar - full width */}
      {nextLevel && (
        <div className="col-span-3 glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-cinzel">{level.name}</span>
            <span className="text-xs text-muted-foreground">{xp} / {nextLevel.minXP} XP</span>
            <span className="text-xs font-cinzel" style={{ color: nextLevel.color }}>{nextLevel.name}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${level.color}, ${nextLevel.color})` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}