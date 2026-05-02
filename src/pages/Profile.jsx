import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Zap, BookOpen, Highlighter, StickyNote, LogOut, Settings, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getLevelForXP, LEVELS, BADGES } from "@/lib/bibleData";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [xpData, setXpData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.UserXP.list("-updated_date", 1).catch(() => []),
    ]).then(([u, xp]) => {
      setUser(u);
      setXpData(xp?.[0] || null);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => base44.auth.logout();

  const xp = xpData?.total_xp || 0;
  const level = getLevelForXP(xp);
  const nextLevel = LEVELS.find(l => l.minXP > xp);
  const progress = nextLevel ? ((xp - level.minXP) / (nextLevel.minXP - level.minXP)) * 100 : 100;
  const earnedBadges = xpData?.badges || [];

  const stats = [
    { label: "Chapters Read", value: xpData?.chapters_read || 0, icon: BookOpen, color: "text-cyan" },
    { label: "Highlights", value: xpData?.verses_highlighted || 0, icon: Highlighter, color: "text-gold" },
    { label: "Notes", value: xpData?.notes_written || 0, icon: StickyNote, color: "text-purple" },
    { label: "Longest Streak", value: `${xpData?.longest_streak || 0}d`, icon: Flame, color: "text-orange-400" },
  ];

  if (loading) {
    return (
      <div className="md:ml-16 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="md:ml-16 min-h-screen px-4 pt-6 pb-8">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative"
      >
        {/* Avatar */}
        <div className="relative inline-block mb-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto"
            style={{ background: `linear-gradient(135deg, ${level.color}33, ${level.color}11)`, border: `2px solid ${level.color}44` }}
          >
            {user?.full_name?.[0] || "✝"}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-lg bg-background border-2 border-background">
            {level.icon}
          </div>
        </div>

        <h1 className="font-cinzel text-xl font-bold text-foreground">
          {user?.full_name || "Believer"}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">{user?.email}</p>
        <p className="font-cinzel text-sm mt-2 font-semibold" style={{ color: level.color }}>
          {level.name}
        </p>

        {/* XP Bar */}
        <div className="max-w-xs mx-auto mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{xp.toLocaleString()} XP</span>
            {nextLevel && <span>{nextLevel.minXP.toLocaleString()} XP to {nextLevel.name}</span>}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${level.color}, ${nextLevel?.color || level.color})` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="font-cinzel text-xl font-bold text-foreground">{xpData?.streak_days || 0}</span>
          <span className="text-sm text-muted-foreground">day streak</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        {stats.map(({ label, value, icon: StatIcon, color }, i) => (
          <div key={label} className="glass rounded-xl p-4">
            <StatIcon className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-2xl font-bold font-cinzel text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-6">
        <h3 className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-3 flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5" /> Achievements
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {BADGES.map(badge => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <div key={badge.id}
                className={`glass rounded-xl p-3 flex flex-col items-center gap-1 border transition-colors ${earned ? "border-gold/30 bg-gold/5" : "border-border/30 opacity-40"}`}
                title={badge.desc}
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-[10px] text-center text-muted-foreground leading-tight">{badge.name}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Level Roadmap */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-6">
        <h3 className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-3">Level Journey</h3>
        <div className="space-y-2">
          {LEVELS.map((l, i) => {
            const isCurrentLevel = l.name === level.name;
            const isPast = LEVELS.indexOf(l) < LEVELS.indexOf(level);
            return (
              <div key={l.name} className={`glass rounded-xl p-3 flex items-center gap-3 border transition-colors ${isCurrentLevel ? "border-gold/30" : "border-border/30"}`}>
                <span className="text-xl">{l.icon}</span>
                <div className="flex-1">
                  <p className="font-cinzel text-sm font-semibold" style={{ color: l.color }}>{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.minXP.toLocaleString()}+ XP</p>
                </div>
                {isCurrentLevel && <span className="text-xs text-gold font-cinzel">Current</span>}
                {isPast && <span className="text-xs text-green-400">✓</span>}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-2 mb-6">
        <h3 className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-3">Settings</h3>
        <a href="/preferences" className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-border/50 hover:border-border transition-colors">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm flex-1">Preferences</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </a>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 glass rounded-xl px-4 py-3 border border-border/50 hover:border-destructive/30 transition-colors text-left"
        >
          <LogOut className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Sign Out</span>
        </button>
      </motion.div>
    </div>
  );
}