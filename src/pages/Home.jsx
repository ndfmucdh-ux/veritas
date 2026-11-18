import { motion } from "framer-motion";
import HeroVerseSlider from "@/components/home/HeroVerseSlider.jsx";
import CategoryCards from "@/components/home/CategoryCards.jsx";
import MorningInspiration from "@/components/home/MorningInspiration.jsx";
import MorningReminder from "@/components/home/MorningReminder.jsx";
import DailyGoalBar from "@/components/home/DailyGoalBar.jsx";
import DailyReflectionCard from "@/components/home/DailyReflectionCard.jsx";
import HomeGreeting from "@/components/home/HomeGreeting.jsx";
import HomeSectionHeader from "@/components/home/HomeSectionHeader.jsx";
import ContinueReadingCard from "@/components/home/ContinueReadingCard.jsx";
import QuickActionsGrid from "@/components/home/QuickActionsGrid.jsx";
import TodayActionsGrid from "@/components/home/TodayActionsGrid.jsx";
import RecentlyRead from "@/components/home/RecentlyRead.jsx";
import VersePreviewCard from "@/components/home/VersePreviewCard.jsx";
import StartReadingBooks from "@/components/home/StartReadingBooks.jsx";
import { FEATURED_VERSES } from "@/lib/sampleVerses";

import { pageTransition } from "@/hooks/useAnimations";
import { useLang } from "@/lib/LanguageContext";

export default function Home() {
  const { t, tr } = useLang();

  return (
    <motion.div {...pageTransition} className="md:ml-16 min-h-screen bg-background">
      <div className="px-4 pt-5 pb-28 space-y-8 max-w-2xl md:max-w-4xl mx-auto">
        <HomeGreeting />

        {/* Verse of the Day — large card */}
        <HeroVerseSlider />

        {/* Quick actions: Today's Reading, Plans, Prayer */}
        <TodayActionsGrid />

        {/* Recently read */}
        <section>
          <HomeSectionHeader label={tr("home_recentlyRead")} />
          <RecentlyRead />
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <MorningReminder />
          <DailyGoalBar />
        </div>

        <DailyReflectionCard />
        <ContinueReadingCard />

        <section>
          <HomeSectionHeader label={t.forYou} />
          <CategoryCards />
        </section>

        <section>
          <HomeSectionHeader label={t.quickAccess} />
          <QuickActionsGrid />
        </section>

        <section>
          <HomeSectionHeader label={t.belovedVerses} linkTo="/search" linkLabel={t.search} />
          <div className="grid gap-3 md:grid-cols-2">
            {(t.featuredVerses || FEATURED_VERSES).slice(0, 5).map((v) => (
              <VersePreviewCard key={v.ref} verse={v} />
            ))}
          </div>
        </section>

        <section>
          <HomeSectionHeader label={t.startReading} linkTo="/read" linkLabel={t.allBooks} />
          <StartReadingBooks />
        </section>

        <MorningInspiration />
      </div>
    </motion.div>
  );
}