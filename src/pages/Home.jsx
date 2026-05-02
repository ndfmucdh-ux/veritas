import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import HeroDailyVerse from "@/components/home/HeroDailyVerse";
import StreakCounter from "@/components/home/StreakCounter";
import QuickSections from "@/components/home/QuickSections";
import { base44 } from "@/api/base44Client";
import { FEATURED_VERSES } from "@/lib/sampleVerses";
import { getLevelForXP, LEVELS } from "@/lib/bibleData";
import { pageTransition } from "@/hooks/useAnimations";

const GREETING_EMOJIS = { morning: "🌅", afternoon: "☀️", evening: "🌙" };

export default function Home() {
  const [user, setUser] = useState(null);
  const [xpData, setXpData] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.UserXP.list("-updated_date", 1).catch(() => []),
    ]).then(([u, xp]) => {
      setUser(u);
      setXpData(xp?.[0] || null);
    });
  }, []);

  const hour = new Date().getHours();
  const period = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const greeting = `Good ${period}`;
  const emoji = GREETING_EMOJIS[period];
  const firstName = user?.full_name?.split(" ")[0];

  const xp = xpData?.total_xp || 0;
  const level = getLevelForXP(xp);
  const nextLevel = LEVELS.find(l => l.minXP > xp);

  return (
    <motion.div {...pageTransition} className="md:ml-16 min-h-screen">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
          style={{ background: "radial-gradient(ellipse, rgba(0,245,255,0.04) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px]"
          style={{ background: "radial-gradient(ellipse, rgba(255,215,0,0.03) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 px-4 pt-7 pb-28 space-y-7 max-w-2xl mx-auto">

        {/* Personalized greeting */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2.5 mb-1">
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 8, -4, 0] }}
              transition={{ duration: 1.5, delay: 0.5 }}
            >
              {emoji}
            </motion.span>
            <h1 className="font-cinzel font-bold text-white"
              style={{ fontSize: "clamp(20px, 5vw, 26px)" }}>
              {greeting}{firstName ? `, ${firstName}` : ""}
            </h1>
          </div>
          <p className="font-inter text-sm pl-9" style={{ color: "rgba(255,255,255,0.3)" }}>
            "Know the Truth. Live the Truth."
          </p>
        </motion.div>

        {/* Hero Daily Verse */}
        <HeroDailyVerse />

        {/* Continue Reading CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
        >
          <Link to="/read">
            <motion.div
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(0,245,255,0.07), rgba(0,245,255,0.03))",
                border: "1px solid rgba(0,245,255,0.14)",
                boxShadow: "0 0 24px rgba(0,245,255,0.05)",
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(0,245,255,0.12)", border: "1px solid rgba(0,245,255,0.2)" }}>
                <BookOpen className="w-5 h-5" style={{ color: "#00f5ff" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-cinzel text-sm font-semibold text-white/90">Continue Reading</p>
                <p className="font-inter text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Pick up where you left off
                </p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(0,245,255,0.5)" }} />
            </motion.div>
          </Link>
        </motion.div>

        {/* Streak + XP + Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <SectionHeader label="Your Progress" />
          <StreakCounter
            streak={xpData?.streak_days || 0}
            xp={xp}
            level={level.name}
            nextLevelXp={nextLevel?.minXP || 5000}
            chapters={xpData?.chapters_read || 0}
          />
        </motion.div>

        {/* Quick Section Cards */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <QuickSections />
        </motion.div>

        {/* Beloved Verses */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <SectionHeader label="Beloved Verses" linkTo="/search" linkLabel="Search" />
          <div className="space-y-3">
            {FEATURED_VERSES.slice(0, 5).map((v, i) => (
              <motion.div
                key={v.ref}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <VersePreviewCard verse={v} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick start books */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <SectionHeader label="Start Reading" linkTo="/read" linkLabel="All books" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {["John", "Psalms", "Proverbs", "Romans", "Genesis", "Matthew", "Isaiah"].map((name, i) => (
              <Link key={name} to={`/read?book=${name}&chapter=1`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.04 }}
                  whileTap={{ scale: 0.93 }}
                  className="flex-shrink-0 px-4 py-2.5 rounded-xl font-cinzel text-sm whitespace-nowrap transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {name}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

function SectionHeader({ label, linkTo, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-[10px] font-inter uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.3)" }}>
        {label}
      </p>
      {linkTo && (
        <Link to={linkTo}
          className="flex items-center gap-1 text-xs font-inter transition-colors"
          style={{ color: "#00f5ff" }}>
          {linkLabel} <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function VersePreviewCard({ verse }) {
  const parts = verse.ref.split(" ");
  const chapter = parts[parts.length - 1]?.split(":")[0];
  const book = parts.slice(0, -1).join(" ");

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      onClick={() => window.location.href = `/read?book=${encodeURIComponent(book)}&chapter=${chapter}`}
      className="rounded-2xl p-4 cursor-pointer transition-all"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <p className="font-playfair italic leading-relaxed mb-2.5"
        style={{ fontSize: "15px", color: "rgba(255,255,255,0.82)" }}>
        "{verse.text.length > 130 ? verse.text.slice(0, 130) + "…" : verse.text}"
      </p>
      <div className="flex items-center justify-between">
        <span className="font-cinzel text-xs" style={{ color: "#FFD700" }}>{verse.ref}</span>
        <span className="text-[10px] font-inter px-2 py-0.5 rounded-full capitalize"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
          {verse.theme}
        </span>
      </div>
    </motion.div>
  );
}