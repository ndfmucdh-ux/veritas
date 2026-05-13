import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Flame, Zap, BookOpen, Highlighter, StickyNote, Image,
  LogOut, ChevronRight, Bell, Moon, Shield, Download,
  TrendingUp, Calendar, Star, Award, Heart, Target,
  BarChart3, BookMarked, Edit3, Check, X, Camera, Loader2, Headphones, FileText, Users, Mail
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getLevelForXP, LEVELS, BADGES } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import OfflineBibleManager from "@/components/profile/OfflineBibleManager";
import ReadingPlanCacheSettings from "@/components/profile/ReadingPlanCacheSettings";
import LevelUpAnimation from "@/components/profile/LevelUpAnimation";
import AudioSummary from "@/components/profile/AudioSummary";
import DashboardSummary from "@/components/profile/DashboardSummary";
import DailyReadingRing from "@/components/profile/DailyReadingRing";
import EmblemBadges from "@/components/profile/EmblemBadges";
import MonthlyProgressChart from "@/components/profile/MonthlyProgressChart";
import ReadingCalendar from "@/components/profile/ReadingCalendar";
import SharedReadingPlan from "@/components/community/SharedReadingPlan";
import EmailEngagementDashboard from "@/components/profile/EmailEngagementDashboard";
import HighlightImageShare from "@/components/verse/HighlightImageShare";
import AccountSettings from "@/components/profile/AccountSettings";

// Default hero: beautiful deep-space starfield — keep this as the permanent default
const DEFAULT_HERO = "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80";

const ALL_TABS = ["overview", "library", "stats", "emails", "settings"];
const TAB_LABELS = { overview: "Overview", library: "Library", stats: "Growth", emails: "Emails", settings: "Settings" };
const TAB_ICONS = { overview: Award, library: BookMarked, stats: BarChart3, emails: Mail, settings: Shield };

// Fake reading data for the chart (last 7 days)
const buildChartData = (chapters) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((d, i) => ({ day: d, chapters: Math.max(0, Math.floor(Math.random() * 4) + (i === 6 ? 3 : 0)) }));
};

export default function Profile() {
  const { t } = useLang();
  const [user, setUser] = useState(null);
  const [xpData, setXpData] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [heroUrl, setHeroUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [shareHighlight, setShareHighlight] = useState(null);

  const avatarInputRef = useRef(null);
  const heroInputRef = useRef(null);

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.UserXP.list("-updated_date", 1).catch(() => []),
      base44.entities.Bookmark.list("-created_date", 20).catch(() => []),
      base44.entities.UserHighlight.list("-created_date", 20).catch(() => []),
      base44.entities.UserNote.list("-created_date", 20).catch(() => []),
      base44.entities.ReadingProgress.filter({ plan_id: { $exists: true } }).catch(() => []),
    ]).then(([u, xp, bm, hl, nt, rp]) => {
      setUser(u);
      const xpRecord = xp?.[0] || null;
      setXpData(xpRecord);
      // Check for level-up since last visit
      const lastXP = parseInt(sessionStorage.getItem("veritas_last_xp") || "0");
      const currentXP = xpRecord?.total_xp || 0;
      if (currentXP > lastXP) {
        sessionStorage.setItem("veritas_last_xp", String(currentXP));
        base44.functions.invoke("checkXPMilestones", { previous_xp: lastXP, current_xp: currentXP }).catch(() => {});
        // Show level-up animation if level changed
        const prevLevel = getLevelForXP(lastXP);
        const currLevel = getLevelForXP(currentXP);
        if (prevLevel.name !== currLevel.name && lastXP > 0) {
          setLevelUpData(currLevel);
          setShowLevelUp(true);
        }
      }
      setBookmarks(bm || []);
      setHighlights(hl || []);
      setNotes(nt || []);
      setPlans(rp || []);
      const savedName = sessionStorage.getItem("veritas_display_name") || u?.full_name || "";
      const savedAvatar = sessionStorage.getItem("veritas_avatar_url") || u?.avatar_url || null;
      setNameInput(savedName);
      setAvatarUrl(savedAvatar);
      setHeroUrl(u?.hero_url || null);
      // Keep session in sync with actual user data
      if (u?.full_name && !sessionStorage.getItem("veritas_display_name")) {
        sessionStorage.setItem("veritas_display_name", u.full_name);
      }
      if (u?.avatar_url && !sessionStorage.getItem("veritas_avatar_url")) {
        sessionStorage.setItem("veritas_avatar_url", u.avatar_url);
      }
      setLoading(false);
    });
  }, []);

  const handleLogout = () => base44.auth.logout();

  const handleDownloadLibrary = async () => {
    const res = await base44.functions.invoke("exportLibraryData", {});
    // res.data is the markdown text
    const blob = new Blob([res.data], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veritas-library-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveName = async () => {
    if (!nameInput.trim()) return;
    const trimmed = nameInput.trim();
    await base44.auth.updateMe({ full_name: trimmed });
    setUser(u => ({ ...u, full_name: trimmed }));
    sessionStorage.setItem("veritas_display_name", trimmed);
    setEditingName(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ avatar_url: file_url });
    setAvatarUrl(file_url);
    sessionStorage.setItem("veritas_avatar_url", file_url);
    setUploadingAvatar(false);
  };

  const handleHeroUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ hero_url: file_url });
    setHeroUrl(file_url);
    setUploadingHero(false);
  };



  // role may be at top-level or inside data sub-object depending on auth method
  const isAdmin = user?.role === "admin" || user?.data?.role === "admin";
  const TABS = ALL_TABS.filter(t => t !== "emails" || isAdmin);

  const xp = xpData?.total_xp || 0;
  const level = getLevelForXP(xp);
  const nextLevel = LEVELS.find(l => l.minXP > xp);
  const progress = nextLevel ? ((xp - level.minXP) / (nextLevel.minXP - level.minXP)) * 100 : 100;
  const earnedBadges = xpData?.badges || [];
  const chartData = buildChartData(xpData?.chapters_read || 0);

  if (loading) {
    return (
      <div className="md:ml-16 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="md:ml-16 min-h-screen pb-28">
      <LevelUpAnimation level={levelUpData} show={showLevelUp} onComplete={() => setShowLevelUp(false)} />
      <AnimatePresence>
        {shareHighlight && <HighlightImageShare highlight={shareHighlight} onClose={() => setShareHighlight(null)} />}
      </AnimatePresence>
      {/* ── Hero Header ── */}
      {/* Default hero is the beautiful deep-space starfield photo — users can replace with their own */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={heroUrl || DEFAULT_HERO}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(8,12,24,0.92) 80%, rgb(8,12,24) 100%)" }} />

        {/* Hero upload button */}
        <button
          onClick={() => heroInputRef.current?.click()}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-inter"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
        >
          {uploadingHero ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          Change Cover
        </button>
        <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />

        {/* Avatar + name */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 flex items-end gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="relative flex-shrink-0"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-2xl object-cover"
                style={{ border: `2px solid ${level.color}55`, boxShadow: `0 0 24px ${level.color}33` }} />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
                style={{ background: `linear-gradient(135deg, ${level.color}44, ${level.color}11)`, border: `2px solid ${level.color}55`, boxShadow: `0 0 24px ${level.color}33` }}
              >
                {user?.full_name?.[0]?.toUpperCase() || "✝"}
              </div>
            )}
            {/* Always-visible camera button */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center z-10"
              style={{ background: "rgba(10,15,30,0.95)", border: `1.5px solid ${level.color}55`, boxShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
            >
              {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5" style={{ color: level.color }} />}
            </button>
            <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-sm bg-background border-2 border-background">
              {level.icon}
            </div>
          </motion.div>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

          <div className="flex-1 min-w-0 pb-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveName()}
                  className="bg-transparent border-b border-white/40 text-white font-cinzel text-lg font-bold focus:outline-none flex-1 min-w-0"
                  autoFocus
                />
                <button onClick={saveName} className="text-white/60 hover:text-white transition-colors"><Check className="w-4 h-4" /></button>
                <button onClick={() => { setNameInput(user?.full_name || ""); setEditingName(false); }} className="text-white/40"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-lg font-bold text-white truncate">{sessionStorage.getItem("veritas_display_name") || user?.full_name || "Believer"}</h1>
                <button onClick={() => setEditingName(true)}>
                  <Edit3 className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
                </button>
              </div>
            )}
            <p className="text-xs font-inter truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{user?.email}</p>
            <p className="font-cinzel text-xs font-semibold mt-0.5" style={{ color: level.color }}>{level.icon} {level.name}</p>
          </div>
        </div>
      </div>

      {/* ── XP Bar ── */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex justify-between text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
          <span className="font-inter">{xp.toLocaleString()} XP</span>
          {nextLevel && <span className="font-inter">{nextLevel.minXP.toLocaleString()} → <span style={{ color: level.color }}>{nextLevel.name}</span></span>}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${level.color}, ${nextLevel?.color || "#fbbf24"})` }}
          />
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-4 gap-3 px-5 mb-4">
        {[
          { label: "Streak", value: `${xpData?.streak_days || 0}d`, icon: Flame, color: "#f97316" },
          { label: "Chapters", value: xpData?.chapters_read || 0, icon: BookOpen, color: "#00f5ff" },
          { label: "Notes", value: notes.length, icon: StickyNote, color: "#a78bfa" },
          { label: "Saved", value: bookmarks.length, icon: Heart, color: "#f472b6" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color }} />
            <p className="font-cinzel text-lg font-bold text-white">{value}</p>
            <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-2 px-5 mb-5">
        {TABS.map(tab => {
          const Icon = TAB_ICONS[tab];
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-[10px] font-cinzel uppercase tracking-wider transition-all min-h-14"
              style={{
                background: activeTab === tab ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.03)",
                color: activeTab === tab ? "#00f5ff" : "rgba(255,255,255,0.35)",
                border: activeTab === tab ? "1px solid rgba(0,245,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
              }}>
              <Icon className="w-5 h-5" />
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div className="px-5 space-y-5">
              {/* Daily Reading Ring */}
              <Section label="Today's Reading Goal" icon={Target}>
                <motion.div className="flex justify-center py-2 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.location.href = "/plans"}>
                  <DailyReadingRing chaptersReadToday={0} />
                </motion.div>
              </Section>

              {/* Reading Calendar */}
              <ReadingCalendar />

              {/* Monthly Progress Chart */}
              <MonthlyProgressChart />

              {/* Community Reading Plans */}
              <Section label="Join the Community" icon={Users}>
                <SharedReadingPlan />
              </Section>

              {/* Emblem Badges */}
              <Section label="Emblems & Honours" icon={Star}>
                <EmblemBadges
                  streak={xpData?.streak_days || 0}
                  highlightCount={highlights.length}
                  noteCount={notes.length}
                />
              </Section>

              {/* Badges */}
              <Section label="Achievements" icon={Trophy}>
                <div className="grid grid-cols-4 gap-2.5">
                  {BADGES.map(badge => {
                    const earned = earnedBadges.includes(badge.id);
                    return (
                      <motion.div key={badge.id} whileTap={{ scale: 0.93 }}
                        className="rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all"
                        style={{ background: earned ? `rgba(251,191,36,0.07)` : "rgba(255,255,255,0.03)", border: earned ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(255,255,255,0.06)", opacity: earned ? 1 : 0.38 }}
                        title={badge.desc}>
                        <span className="text-2xl">{badge.icon}</span>
                        <span className="text-[9px] font-inter text-center leading-tight" style={{ color: earned ? "#fbbf24" : "rgba(255,255,255,0.3)" }}>{badge.name}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </Section>

              {/* Level journey */}
              <Section label="Level Journey" icon={Target}>
                <div className="space-y-2">
                  {LEVELS.map((l) => {
                    const isCurrent = l.name === level.name;
                    const isPast = LEVELS.indexOf(l) < LEVELS.indexOf(level);
                    return (
                      <div key={l.name} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{ background: isCurrent ? `${l.color}0d` : "rgba(255,255,255,0.025)", border: isCurrent ? `1px solid ${l.color}33` : "1px solid transparent" }}>
                        <span className="text-xl w-8 text-center">{l.icon}</span>
                        <div className="flex-1">
                          <p className="font-cinzel text-sm font-semibold" style={{ color: l.color }}>{l.name}</p>
                          <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>{l.minXP.toLocaleString()}+ XP</p>
                        </div>
                        {isCurrent && <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full" style={{ background: `${l.color}22`, color: l.color }}>Current</span>}
                        {isPast && <Check className="w-3.5 h-3.5" style={{ color: "#34d399" }} />}
                      </div>
                    );
                  })}
                </div>
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
                        <Zap className="w-3.5 h-3.5" style={{ color: "#00f5ff" }} />
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

          {/* ── STATS TAB ── */}
          {activeTab === "stats" && (
            <div className="px-5 space-y-5">
              {/* Dashboard Summary */}
              <Section label="My Progress Summary" icon={TrendingUp}>
                <DashboardSummary xpData={xpData} readingProgress={plans.length} />
              </Section>

              {/* Audio Summary */}
              <Section label="Audio Listening" icon={Headphones}>
                <AudioSummary />
              </Section>

              {/* Reading chart */}
              <Section label="Reading Activity (Last 7 Days)" icon={TrendingUp}>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <defs>
                        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00f5ff" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#00f5ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: "rgba(10,15,30,0.95)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 12, fontSize: 12, fontFamily: "Cinzel" }}
                        labelStyle={{ color: "#00f5ff" }}
                        itemStyle={{ color: "rgba(255,255,255,0.7)" }}
                      />
                      <Area type="monotone" dataKey="chapters" stroke="#00f5ff" strokeWidth={2} fill="url(#cg)" dot={{ fill: "#00f5ff", r: 3, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Section>

              {/* Detailed stats */}
              <Section label="All-Time Stats" icon={Star}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total XP", value: xp.toLocaleString(), color: "#fbbf24", icon: "⚡" },
                    { label: "Day Streak", value: `${xpData?.streak_days || 0}`, color: "#f97316", icon: "🔥" },
                    { label: "Longest Streak", value: `${xpData?.longest_streak || 0}d`, color: "#f472b6", icon: "📈" },
                    { label: "Chapters Read", value: xpData?.chapters_read || 0, color: "#00f5ff", icon: "📖" },
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
                {/* Download Library Button */}
                <button onClick={handleDownloadLibrary}
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
                <button onClick={handleLogout}
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

/* ── Sub-components ── */
function Section({ label, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
        <p className="text-[10px] font-cinzel uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
      </div>
      {children}
    </div>
  );
}

function LibraryRow({ verseRef, sub, href, color }) {
  return (
    <a href={href} className="flex items-center gap-3 py-2.5 border-b transition-colors hover:opacity-80" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <p className="font-cinzel text-sm text-white truncate">{verseRef}</p>
        <p className="text-[10px] font-inter capitalize" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />
    </a>
  );
}

function ToggleRow({ icon: Icon, label, value, onChange, color }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
      <p className="flex-1 text-sm font-inter" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</p>
      <motion.button onClick={onChange}
        className="w-11 h-6 rounded-full relative flex items-center px-1"
        style={{ background: value ? "rgba(0,245,255,0.25)" : "rgba(255,255,255,0.08)" }}>
        <motion.span animate={{ x: value ? 18 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </motion.button>
    </div>
  );
}

function SettingLink({ icon: Icon, label, sub, color, tag }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.75)" }}>{label}</p>
        {sub && <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>}
      </div>
      {tag
        ? <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>{tag}</span>
        : <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} />
      }
    </div>
  );
}

function NotifTimeRow({ label, settingKey, defaultTime }) {
  const [time, setTime] = useState(() => localStorage.getItem(`veritas_notif_${settingKey}`) || defaultTime);
  const handleChange = (e) => {
    setTime(e.target.value);
    localStorage.setItem(`veritas_notif_${settingKey}`, e.target.value);
  };
  return (
    <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <p className="flex-1 text-sm font-inter" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</p>
      <input
        type="time"
        value={time}
        onChange={handleChange}
        className="text-xs font-cinzel px-3 py-1.5 rounded-xl focus:outline-none"
        style={{ background: "rgba(0,245,255,0.07)", border: "1px solid rgba(0,245,255,0.2)", color: "#00f5ff" }}
      />
    </div>
  );
}

function EmptyMsg({ icon, text }) {
  return (
    <div className="flex items-center gap-2 py-4" style={{ color: "rgba(255,255,255,0.25)" }}>
      <span className="text-lg">{icon}</span>
      <p className="text-sm font-inter">{text}</p>
    </div>
  );
}

function SeeAll({ to }) {
  return (
    <a href={to} className="flex items-center gap-1 text-xs font-cinzel mt-2" style={{ color: "#00f5ff" }}>
      See all <ChevronRight className="w-3 h-3" />
    </a>
  );
}