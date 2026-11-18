import { motion } from "framer-motion";
import HeroDailyVerse from "@/components/home/HeroDailyVerse.jsx";
import HomeTiles from "@/components/home/HomeTiles.jsx";
import CategoryCards from "@/components/home/CategoryCards.jsx";
import MorningInspiration from "@/components/home/MorningInspiration.jsx";
import MorningReminder from "@/components/home/MorningReminder.jsx";
import DailyGoalBar from "@/components/home/DailyGoalBar.jsx";
import DailyReflectionCard from "@/components/home/DailyReflectionCard.jsx";
import HomeAmbientBackground from "@/components/home/HomeAmbientBackground.jsx";
import HomeGreeting from "@/components/home/HomeGreeting.jsx";
import HomeSectionHeader from "@/components/home/HomeSectionHeader.jsx";
import ContinueReadingCard from "@/components/home/ContinueReadingCard.jsx";
import QuickActionsGrid from "@/components/home/QuickActionsGrid.jsx";
import VersePreviewCard from "@/components/home/VersePreviewCard.jsx";
import StartReadingBooks from "@/components/home/StartReadingBooks.jsx";
import { FEATURED_VERSES } from "@/lib/sampleVerses";

import { pageTransition } from "@/hooks/useAnimations";
import { useLang } from "@/lib/LanguageContext";

export default function Home() {
  const { t } = useLang();

  return (
    <motion.div {...pageTransition} className="md:ml-16 min-h-screen">
      <HomeAmbientBackground />

      <div className="relative z-10 px-4 md:px-8 pt-6 pb-28 space-y-6 max-w-3xl mx-auto">

        <HomeGreeting />

        <HeroDailyVerse />

        <HomeTiles />

        <ContinueReadingCard />

        <MorningReminder />

        <DailyReflectionCard />

        {/* Category Cards */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}>
          <HomeSectionHeader label={t.forYou} />
          <CategoryCards />
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <HomeSectionHeader label={t.quickAccess} />
          <QuickActionsGrid />
        </motion.div>

        {/* Beloved Verses */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <HomeSectionHeader label={t.belovedVerses} linkTo="/search" linkLabel={t.search} />
          <div className="space-y-2">
            {(t.featuredVerses || FEATURED_VERSES).slice(0, 5).map((v, i) => (
              <motion.div key={v.ref} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.07 }}>
                <VersePreviewCard verse={v} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick start books */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <HomeSectionHeader label={t.startReading} linkTo="/read" linkLabel={t.allBooks} />
          <StartReadingBooks />
        </motion.div>

        {/* Morning Inspiration — bottom of page */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <MorningInspiration />
        </motion.div>

        {/* Daily Reading Goal — compact, at the bottom */}
        <DailyGoalBar />
      </div>
    </motion.div>
  );
}