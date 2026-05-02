import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Search, ChevronRight } from "lucide-react";
import DailyVerseCard from "@/components/home/DailyVerseCard";
import XPStreakBar from "@/components/home/XPStreakBar";
import QuickAccessGrid from "@/components/home/QuickAccessGrid";
import { base44 } from "@/api/base44Client";
import { FEATURED_VERSES } from "@/lib/sampleVerses";
import { BIBLE_BOOKS } from "@/lib/bibleData";

export default function Home() {
  const [user, setUser] = useState(null);
  const [recentProgress, setRecentProgress] = useState([]);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
    base44.entities.ReadingProgress.list("-updated_date", 3)
      .then(p => setRecentProgress(p || []))
      .catch(() => {});
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="md:ml-16 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 pt-6 pb-4">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 opacity-10 pointer-events-none">
          <div className="w-full h-full rounded-full" style={{ background: "radial-gradient(circle, #00e5ff, transparent 70%)" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <h1 className="text-2xl font-cinzel font-bold text-foreground">
            {greeting()}{user ? `, ${user.full_name?.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-inter">
            "Know the Truth. Live the Truth."
          </p>
        </motion.div>
      </div>

      <div className="px-4 space-y-6 pb-8">
        {/* Daily Verse */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <DailyVerseCard />
        </motion.div>

        {/* Quick Read Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Link
            to="/read"
            className="flex items-center justify-between glass rounded-xl px-5 py-4 border border-cyan/20 hover:border-cyan/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan/20 flex items-center justify-center group-hover:bg-cyan/30 transition-colors">
                <BookOpen className="w-5 h-5 text-cyan" />
              </div>
              <div>
                <p className="font-cinzel text-sm font-semibold text-foreground">Continue Reading</p>
                <p className="text-xs text-muted-foreground">Pick up where you left off</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-cyan transition-colors" />
          </Link>
        </motion.div>

        {/* XP / Streak */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-3">Your Progress</h3>
          <XPStreakBar />
        </motion.div>

        {/* Quick Access */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <QuickAccessGrid />
        </motion.div>

        {/* Featured Verses */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase">Beloved Verses</h3>
            <Link to="/search" className="text-xs text-cyan hover:text-cyan/80 flex items-center gap-1">
              Search <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {FEATURED_VERSES.slice(0, 4).map((v, i) => (
              <motion.div
                key={v.ref}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="glass rounded-xl p-4 border border-border/50 hover:border-border transition-colors cursor-pointer"
                onClick={() => window.location.href = `/read?book=${v.ref.split(' ')[0]}&chapter=${v.ref.split(' ')[1]?.split(':')[0]}`}
              >
                <p className="font-playfair text-sm text-foreground/90 italic leading-relaxed mb-2">
                  "{v.text.length > 120 ? v.text.slice(0, 120) + "…" : v.text}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-cinzel text-gold">{v.ref}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{v.theme}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Books Quick Start */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase">Start Reading</h3>
            <Link to="/read" className="text-xs text-cyan hover:text-cyan/80 flex items-center gap-1">
              All books <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {["John", "Psalms", "Proverbs", "Romans", "Genesis", "Matthew", "Isaiah", "Revelation"].map(bookName => (
              <Link
                key={bookName}
                to={`/read?book=${bookName}&chapter=1`}
                className="flex-shrink-0 glass rounded-xl px-4 py-3 text-sm font-cinzel text-muted-foreground hover:text-cyan hover:border-cyan/30 border border-border/50 transition-colors whitespace-nowrap"
              >
                {bookName}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}