import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Highlighter, StickyNote, Image,
  LogOut, Bell, Moon, Shield, Download,
  TrendingUp, Calendar, Target,
  BookMarked, Headphones, FileText, Users, Mail, Sparkles
} from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import WeeklyActivityChart from "@/components/profile/WeeklyActivityChart";
import OfflineBibleManager from "@/components/profile/OfflineBibleManager";
import ReadingPlanCacheSettings from "@/components/profile/ReadingPlanCacheSettings";
import AudioSummary from "@/components/profile/AudioSummary";
import DashboardSummary from "@/components/profile/DashboardSummary";
import DailyReadingRing from "@/components/profile/DailyReadingRing";
import MonthlyProgressChart from "@/components/profile/MonthlyProgressChart";
import ReadingCalendar from "@/components/profile/ReadingCalendar";
import SharedReadingPlan from "@/components/community/SharedReadingPlan";
import EmailEngagementDashboard from "@/components/profile/EmailEngagementDashboard";
import HighlightImageShare from "@/components/verse/HighlightImageShare";
import AccountSettings from "@/components/profile/AccountSettings";
import ReadingGoals from "@/components/profile/ReadingGoals";
import DailySummaryCard from "@/components/profile/DailySummaryCard";
import ProfileInsights from "@/components/profile/ProfileInsights";
import ReadingStatsOverview from "@/components/profile/ReadingStatsOverview";
import CalendarSyncPanel from "@/components/profile/CalendarSyncPanel";
import PersonalizedDevotionalPanel from "@/components/profile/PersonalizedDevotionalPanel";
import ProfileStatsRow from "@/components/profile/ProfileStatsRow";
import ProfileTabBar from "@/components/profile/ProfileTabBar";
import ProfileHeroHeader from "@/components/profile/ProfileHeroHeader";
import { base44 } from "@/api/base44Client";
import useProfileData from "@/hooks/useProfileData";
import { LoadingState } from "@/components/ui/states";
import {
  Section, LibraryRow, ToggleRow, SettingLink, NotifTimeRow, EmptyMsg, SeeAll,
} from "@/components/profile/ProfileListItems";

export default function Profile() {
  const { t } = useLang();
  const {
    user, bookmarks, highlights, notes, plans, loading,
    saveName, uploadAvatar, uploadHero, downloadLibrary,
  } = useProfileData();
  const [activeTab, setActiveTab] = useState("overview");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [heroUrl, setHeroUrl] = useState(null);
  const [shareHighlight, setShareHighlight] = useState(null);

  const isAdmin = user?.role === "admin" || user?.data?.role === "admin";

  const handleAvatarFile = async (file) => setAvatarUrl(await uploadAvatar(file));
  const handleHeroFile = async (file) => setHeroUrl(await uploadHero(file));

  if (loading) {
    return (
      <div className="md:ml-16 min-h-screen flex items-center justify-center">
        <LoadingState label="Loading your profile…" size="xl" minHeight={0} />
      </div>
    );
  }

  const resolvedAvatar = avatarUrl ?? (sessionStorage.getItem("veritas_avatar_url") || user?.avatar_url || null);
  const resolvedHero = heroUrl ?? (user?.hero_url || null);

  return (
    <div className="md:ml-16 min-h-screen pb-28">
      <AnimatePresence>
        {shareHighlight && <HighlightImageShare highlight={shareHighlight} onClose={() => setShareHighlight(null)} />}
      </AnimatePresence>

      <ProfileHeroHeader
        user={user}
        avatarUrl={resolvedAvatar}
        heroUrl={resolvedHero}
        onSaveName={saveName}
        onAvatarFile={handleAvatarFile}
        onHeroFile={handleHeroFile}
      />

      <ProfileStatsRow
        sessions={plans.length}
        highlights={highlights.length}
        notes={notes.length}
        saved={bookmarks.length}
      />

      <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} />

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div className="px-5 space-y-5">
              <DailySummaryCard />

              <Section label="Today's Reading Goal" icon={Target}>
                <motion.div className="flex justify-center py-2 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.location.href = "/plans"}>
                  <DailyReadingRing chaptersReadToday={0} />
                </motion.div>
              </Section>

              <Section label="Reading Goals" icon={Target}>
                <ReadingGoals />
              </Section>

              <ReadingCalendar />

              <MonthlyProgressChart />

              <Section label="Join the Community" icon={Users}>
                <SharedReadingPlan />
              </Section>
            </div>
          )}

          {/* ── LIBRARY TAB ── */}
          {activeTab === "library" && (
            <div className="px-5 space-y-5">
              <Section label={`Bookmarks (${bookmarks.length})`} icon={BookMarked}>
                {bookmarks.length === 0
                  ? <EmptyMsg icon="🔖" text="No bookmarks yet" />
                  : bookmarks.slice(0, 6).map(bm => (
                    <LibraryRow key={bm.id} verseRef={bm.verse_ref} sub={bm.translation} href={`/read?book=${bm.book}&chapter=${bm.chapter}`} color="#fbbf24" />
                  ))
                }
                {bookmarks.length > 6 && <SeeAll to="/library" />}
              </Section>

              <Section label={`Highlights (${highlights.length})`} icon={Highlighter}>
                {highlights.length === 0
                  ? <EmptyMsg icon="✨" text="No highlights yet" />
                  : highlights.slice(0, 6).map(hl => (
                    <div key={hl.id} className="flex items-center gap-2">
                      <LibraryRow verseRef={hl.verse_ref} sub={`${hl.color} · ${hl.translation}`} href={`/read?book=${hl.book}&chapter=${hl.chapter}`} color="#00f5ff" />
                      <button onClick={() => setShareHighlight(hl)}
                        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(0,245,255,0.07)", border: "1px solid rgba(0,245,255,0.15)" }}
                        title="Create verse art">
                        <Image className="w-3.5 h-3.5" style={{ color: "#00f5ff" }} />
                      </button>
                    </div>
                  ))
                }
                {highlights.length > 6 && <SeeAll to="/library" />}
              </Section>

              <Section label={`Notes (${notes.length})`} icon={StickyNote}>
                {notes.length === 0
                  ? <EmptyMsg icon="✍️" text="No notes yet" />
                  : notes.slice(0, 4).map(n => (
                    <div key={n.id} className="rounded-xl p-3 mb-2" style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}>
                      <p className="font-cinzel text-xs mb-1" style={{ color: "#a78bfa" }}>{n.verse_ref}</p>
                      <p className="text-sm font-inter leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.7)" }}>{n.note_text}</p>
                    </div>
                  ))
                }
                {notes.length > 4 && <SeeAll to="/library" />}
              </Section>
            </div>
          )}

          {/* ── INSIGHTS TAB ── */}
          {activeTab === "insights" && (
            <div className="px-5 space-y-5">
              <ProfileInsights
                highlights={highlights}
                bookmarks={bookmarks}
                notes={notes}
                readingProgress={plans}
              />
            </div>
          )}

          {/* ── STATS TAB ── */}
          {activeTab === "stats" && (
            <div className="px-5 space-y-5">
              <Section label="Reading Stats & Activity" icon={TrendingUp}>
                <ReadingStatsOverview />
              </Section>

              <Section label="Sync with Calendar" icon={Calendar}>
                <CalendarSyncPanel />
              </Section>

              <Section label="AI Personalized Devotional" icon={Sparkles}>
                <PersonalizedDevotionalPanel />
              </Section>

              <Section label="Reading Summary" icon={TrendingUp}>
                <DashboardSummary readingProgress={plans.length} notesCount={notes.length} highlightsCount={highlights.length} />
              </Section>

              <Section label="Audio Listening" icon={Headphones}>
                <AudioSummary />
              </Section>

              <Section label="Reading Activity (Last 7 Days)" icon={TrendingUp}>
                <WeeklyActivityChart />
              </Section>

              <Section label="Library Metrics" icon={BookOpen}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Reading Sessions", value: plans.length, color: "#00f5ff", icon: "📖" },
                    { label: "Bookmarks", value: bookmarks.length, color: "#f472b6", icon: "🔖" },
                    { label: "Verses Highlighted", value: highlights.length, color: "#a78bfa", icon: "✨" },
                    { label: "Notes Written", value: notes.length, color: "#34d399", icon: "✍️" },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-xl mb-1">{s.icon}</p>
                      <p className="font-cinzel text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* ── EMAILS TAB ── */}
          {activeTab === "emails" && (
            <div className="px-5 space-y-5">
              <Section label="Email Engagement" icon={Mail}>
                <EmailEngagementDashboard />
              </Section>
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === "settings" && (
            <div className="px-5 space-y-5">
              <Section label="Account Settings" icon={Shield}>
                <AccountSettings user={user} />
              </Section>

              <Section label="Preferences" icon={Bell}>
                <ToggleRow icon={Bell} label="Daily Verse Notifications" value={notifEnabled} onChange={() => setNotifEnabled(v => !v)} color="#fbbf24" />
                <ToggleRow icon={Moon} label="Dark Theme" value={darkMode} onChange={() => setDarkMode(v => !v)} color="#a78bfa" />
                <NotifTimeRow label="🙏 Prayer Journal Reminder" settingKey="prayer_reminder_time" defaultTime="20:00" />
                <NotifTimeRow label="📖 Devotional Plan Reminder" settingKey="devotional_reminder_time" defaultTime="19:00" />
              </Section>

              <Section label="Data & Privacy" icon={Shield}>
                <div className="mb-3 space-y-3">
                  <OfflineBibleManager />
                  <ReadingPlanCacheSettings />
                </div>
                <SettingLink icon={Shield} label="Private Notes" sub="All notes are encrypted by default" color="#34d399" tag="On" />
                <button onClick={downloadLibrary}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-inter text-left transition-colors border-b"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <FileText className="w-4 h-4 flex-shrink-0" style={{ color: "#00f5ff" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.75)" }}>Download My Library</p>
                    <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Bookmarks, highlights &amp; notes as a beautiful Markdown file
                    </p>
                  </div>
                  <Download className="w-4 h-4 flex-shrink-0" style={{ color: "#00f5ff" }} />
                </button>
                <SettingLink icon={StickyNote} label="Export Raw Data" sub="Download all data as plain text" color="#a78bfa" />
              </Section>

              <Section label="Account" icon={LogOut}>
                <button onClick={() => base44.auth.logout()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-inter text-left transition-colors"
                  style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", color: "#f87171" }}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </Section>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}