import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Headphones, Download, Share2, Timer, Flame, BarChart2,
  CheckCircle2, BookOpen, Clock, Target, Trophy, ChevronLeft,
  X, Play, Pause, Settings, Bell, BellOff
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import jsPDF from "jspdf";

const SLEEP_TIMER_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export default function AudioDashboard() {
  const [audioHistory, setAudioHistory] = useState([]);
  const [xpData, setXpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sleepTimer, setSleepTimer] = useState(null);
  const [sleepCountdown, setSleepCountdown] = useState(null);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ enabled: true, time: "20:00", goal: 1 });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedPrefs, setSavedPrefs] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadData();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [audio, xp, prefs] = await Promise.all([
        base44.entities.BibleAudioProgress.list("-updated_date", 500),
        base44.entities.UserXP.list("-updated_date", 1),
        base44.entities.UserPreferences.list("-updated_date", 1),
      ]);
      setAudioHistory(audio || []);
      setXpData(xp?.[0] || null);
      if (prefs?.[0]) {
        setNotifPrefs({
          enabled: prefs[0].notifications_enabled ?? true,
          time: prefs[0].daily_verse_time || "20:00",
          goal: prefs[0].daily_audio_goal || 1,
        });
      }
      // Calculate streak
      const completedDates = new Set(
        (audio || []).filter(a => a.completed).map(a => (a.updated_date || a.created_date)?.slice(0, 10)).filter(Boolean)
      );
      let s = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (completedDates.has(d.toISOString().slice(0, 10))) s++;
        else if (i > 0) break;
      }
      setStreak(s);
    } catch {}
    setLoading(false);
  };

  const startSleepTimer = (minutes) => {
    setSleepTimer(minutes);
    setSleepCountdown(minutes * 60);
    setShowSleepPicker(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSleepCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setSleepTimer(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSleepTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSleepTimer(null);
    setSleepCountdown(null);
  };

  const formatCountdown = (secs) => {
    if (!secs) return "";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const saveNotifPrefs = async () => {
    setSavingPrefs(true);
    try {
      const existing = await base44.entities.UserPreferences.list("-updated_date", 1);
      const data = {
        notifications_enabled: notifPrefs.enabled,
        daily_verse_time: notifPrefs.time,
        daily_audio_goal: notifPrefs.goal,
      };
      if (existing?.[0]) {
        await base44.entities.UserPreferences.update(existing[0].id, data);
      } else {
        await base44.entities.UserPreferences.create(data);
      }
      setSavedPrefs(true);
      setTimeout(() => setSavedPrefs(false), 2000);
    } catch {}
    setSavingPrefs(false);
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const res = await base44.functions.invoke("exportAudioHistory", { format: "csv" });
      // The function returns CSV — trigger download via blob
      const blob = new Blob([res.data || ""], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "audio-history.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setExporting(false);
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const res = await base44.functions.invoke("exportAudioHistory", { format: "pdf" });
      const data = res.data;
      if (!data) return;

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(0, 245, 255);
      doc.text("Veritas — Audio Listening Report", 20, 20);
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 80);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);

      doc.setFontSize(13);
      doc.setTextColor(30, 30, 50);
      doc.text("Summary", 20, 45);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 80);
      doc.text(`Total Chapters Started: ${data.summary?.total_chapters_started || 0}`, 20, 55);
      doc.text(`Chapters Completed: ${data.summary?.total_completed || 0}`, 20, 63);
      doc.text(`Total Listening Time: ${data.summary?.total_listening_hours || 0} hours`, 20, 71);

      let y = 85;
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 50);
      doc.text("Progress by Book", 20, y);
      y += 10;

      for (const [book, info] of Object.entries(data.by_book || {})) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 80);
        doc.text(`${book}: ${info.completed}/${info.total} chapters completed`, 20, y);
        y += 8;
      }

      doc.save("audio-history.pdf");
    } catch {}
    setExporting(false);
  };

  const shareProgress = async () => {
    setShareLoading(true);
    try {
      const completed = audioHistory.filter(a => a.completed).length;
      const text = `🎧 I've listened to ${completed} Bible chapters on Veritas with a ${streak}-day streak! Join me: https://app.veritas.com`;
      if (navigator.share) {
        await navigator.share({ title: "My Veritas Audio Progress", text });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Progress copied to clipboard!");
      }
    } catch {}
    setShareLoading(false);
  };

  // Stats
  const completed = audioHistory.filter(a => a.completed).length;
  const totalMinutes = Math.round(audioHistory.reduce((s, a) => s + (a.timestamp_seconds || 0), 0) / 60);
  const booksCompleted = new Set(audioHistory.filter(a => a.completed).map(a => a.book)).size;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = audioHistory.filter(a => a.completed && (a.updated_date || a.created_date)?.startsWith(todayStr)).length;

  // Weekly progress (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const count = audioHistory.filter(a => a.completed && (a.updated_date || a.created_date)?.startsWith(key)).length;
    return { day: d.toLocaleDateString("en-US", { weekday: "short" }), count };
  });
  const maxWeekly = Math.max(...weeklyData.map(d => d.count), 1);

  return (
    <div className="md:ml-16 min-h-screen pb-28">
      {/* Header */}
      <div className="relative h-44 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80" alt="Audio" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(8,12,24,0.97))" }} />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <h1 className="font-cinzel text-2xl font-bold text-white">Audio Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Your scripture listening journey</p>
        </div>
      </div>

      {/* Sleep Timer Banner */}
      <AnimatePresence>
        {sleepTimer && (
          <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
            className="mx-4 mt-3 px-4 py-3 rounded-2xl flex items-center justify-between"
            style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)" }}>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" style={{ color: "#a78bfa" }} />
              <span className="font-cinzel text-sm" style={{ color: "#a78bfa" }}>Sleep timer: {formatCountdown(sleepCountdown)}</span>
            </div>
            <button onClick={cancelSleepTimer} className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
        {[
          ["dashboard", "📊 Overview"],
          ["history", "📖 History"],
          ["settings", "⚙️ Settings"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex-shrink-0 px-4 py-2 rounded-xl font-cinzel text-xs transition-all"
            style={{
              background: activeTab === id ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.04)",
              color: activeTab === id ? "#00f5ff" : "rgba(255,255,255,0.4)",
              border: activeTab === id ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.07)"
            }}>
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-4">

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🎧", label: "Chapters Done", value: completed, color: "#00f5ff" },
                { icon: "🔥", label: "Day Streak", value: streak, color: "#fb923c" },
                { icon: "📚", label: "Books Heard", value: booksCompleted, color: "#a78bfa" },
                { icon: "⏱️", label: "Total Minutes", value: totalMinutes, color: "#34d399" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-5 text-center"
                  style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <p className="font-cinzel text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] font-inter mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Today's goal */}
            <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-cinzel text-sm text-white flex items-center gap-2"><Target className="w-4 h-4 text-gold" /> Today's Goal</p>
                <span className="font-cinzel text-xs" style={{ color: todayCount >= notifPrefs.goal ? "#34d399" : "#00f5ff" }}>
                  {todayCount}/{notifPrefs.goal} chapters
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                <motion.div initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (todayCount / notifPrefs.goal) * 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: todayCount >= notifPrefs.goal ? "#34d399" : "#00f5ff" }} />
              </div>
              {todayCount >= notifPrefs.goal && (
                <p className="text-xs font-inter mt-2" style={{ color: "#34d399" }}>✅ Goal reached today!</p>
              )}
            </div>

            {/* Weekly bar chart */}
            <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="font-cinzel text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>This Week</p>
              <div className="flex items-end gap-2 h-24">
                {weeklyData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.count / maxWeekly) * 80}px` }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      className="w-full rounded-t-lg"
                      style={{ background: d.count > 0 ? "rgba(0,245,255,0.4)" : "rgba(255,255,255,0.06)", minHeight: 4 }} />
                    <span className="text-[9px] font-cinzel" style={{ color: "rgba(255,255,255,0.3)" }}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowSleepPicker(true)}
                className="flex items-center gap-2.5 px-4 py-4 rounded-2xl font-cinzel text-sm transition-all"
                style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                <Timer className="w-5 h-5" /> Sleep Timer
              </button>
              <button onClick={shareProgress} disabled={shareLoading}
                className="flex items-center gap-2.5 px-4 py-4 rounded-2xl font-cinzel text-sm transition-all"
                style={{ background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
                <Share2 className="w-5 h-5" /> Share Progress
              </button>
              <button onClick={exportCSV} disabled={exporting}
                className="flex items-center gap-2.5 px-4 py-4 rounded-2xl font-cinzel text-sm transition-all"
                style={{ background: "rgba(0,245,255,0.06)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.15)" }}>
                <Download className="w-5 h-5" /> Export CSV
              </button>
              <button onClick={exportPDF} disabled={exporting}
                className="flex items-center gap-2.5 px-4 py-4 rounded-2xl font-cinzel text-sm transition-all"
                style={{ background: "rgba(52,211,153,0.06)", color: "#34d399", border: "1px solid rgba(52,211,153,0.15)" }}>
                <Download className="w-5 h-5" /> Export PDF
              </button>
            </div>

            {/* Achievement card */}
            <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(167,139,250,0.06))", border: "1px solid rgba(251,191,36,0.2)" }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
                  {streak >= 7 ? "🏆" : streak >= 3 ? "⚡" : streak >= 1 ? "🔥" : "🎯"}
                </div>
                <div>
                  <p className="font-cinzel text-sm font-bold text-white">
                    {streak >= 7 ? "Streak Champion!" : streak >= 3 ? "On Fire!" : streak >= 1 ? "Building Momentum" : "Start Your Streak"}
                  </p>
                  <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {streak >= 7 ? `${streak} days of consistent listening` : streak >= 3 ? `${streak} days — keep going!` : streak >= 1 ? "Day 1 complete!" : "Listen today to begin"}
                  </p>
                </div>
              </div>
              {streak > 0 && (
                <div className="mt-3 text-xs font-cinzel" style={{ color: "#fbbf24" }}>
                  +{streak >= 7 ? 50 : streak >= 3 ? 25 : 15} bonus XP earned for streak!
                </div>
              )}
            </div>
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div className="space-y-2">
            <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
              {completed} chapters completed
            </p>
            {audioHistory.length === 0 && (
              <div className="py-16 flex flex-col items-center gap-3">
                <Headphones className="w-12 h-12" style={{ color: "rgba(255,255,255,0.15)" }} />
                <p className="font-cinzel text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No listening history yet</p>
              </div>
            )}
            {audioHistory.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: a.completed ? "1px solid rgba(52,211,153,0.2)" : "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: a.completed ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)" }}>
                  {a.completed ? <CheckCircle2 className="w-4 h-4" style={{ color: "#34d399" }} /> : <Headphones className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-cinzel text-sm text-white">{a.book} {a.chapter}</p>
                  <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {a.translation} · {(a.updated_date || a.created_date)?.slice(0, 10)}
                  </p>
                </div>
                {a.timestamp_seconds > 0 && (
                  <span className="text-[10px] font-inter flex-shrink-0" style={{ color: "#00f5ff" }}>
                    {Math.round(a.timestamp_seconds / 60)}m
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4 space-y-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="font-cinzel text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Listening Goal Notifications</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-cinzel text-sm text-white">Enable Reminders</p>
                  <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>Daily ping if goal not met</p>
                </div>
                <button onClick={() => setNotifPrefs(p => ({ ...p, enabled: !p.enabled }))}
                  className="w-12 h-6 rounded-full relative flex items-center px-1 transition-colors"
                  style={{ background: notifPrefs.enabled ? "rgba(0,245,255,0.3)" : "rgba(255,255,255,0.1)" }}>
                  <motion.span animate={{ x: notifPrefs.enabled ? 24 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 24 }}
                    className="w-4 h-4 rounded-full bg-white" />
                </button>
              </div>

              <div>
                <p className="font-cinzel text-xs text-white mb-2">Reminder Time</p>
                <input type="time" value={notifPrefs.time}
                  onChange={e => setNotifPrefs(p => ({ ...p, time: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }} />
              </div>

              <div>
                <p className="font-cinzel text-xs text-white mb-2">Daily Chapter Goal: <span style={{ color: "#00f5ff" }}>{notifPrefs.goal}</span></p>
                <div className="flex gap-2">
                  {[1, 2, 3, 5].map(n => (
                    <button key={n} onClick={() => setNotifPrefs(p => ({ ...p, goal: n }))}
                      className="flex-1 py-2 rounded-xl font-cinzel text-sm transition-all"
                      style={{
                        background: notifPrefs.goal === n ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)",
                        color: notifPrefs.goal === n ? "#00f5ff" : "rgba(255,255,255,0.4)",
                        border: notifPrefs.goal === n ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.07)"
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={saveNotifPrefs} disabled={savingPrefs}
                className="w-full py-3 rounded-2xl font-cinzel text-sm transition-all"
                style={{ background: savedPrefs ? "rgba(52,211,153,0.2)" : "rgba(0,245,255,0.12)", color: savedPrefs ? "#34d399" : "#00f5ff", border: savedPrefs ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(0,245,255,0.25)" }}>
                {savedPrefs ? "✓ Saved!" : savingPrefs ? "Saving…" : "Save Preferences"}
              </motion.button>
            </div>

            {/* Sleep timer settings */}
            <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="font-cinzel text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Sleep Timer</p>
              <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.45)" }}>Auto-stop audio after selected duration</p>
              <div className="grid grid-cols-4 gap-2">
                {SLEEP_TIMER_OPTIONS.map(m => (
                  <button key={m} onClick={() => startSleepTimer(m)}
                    className="py-2 rounded-xl font-cinzel text-xs transition-all"
                    style={{
                      background: sleepTimer === m ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
                      color: sleepTimer === m ? "#a78bfa" : "rgba(255,255,255,0.4)",
                      border: sleepTimer === m ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.07)"
                    }}>
                    {m}m
                  </button>
                ))}
              </div>
              {sleepTimer && (
                <button onClick={cancelSleepTimer}
                  className="w-full py-2 rounded-xl font-cinzel text-xs"
                  style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                  Cancel Timer ({formatCountdown(sleepCountdown)})
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sleep Timer Picker Modal */}
      <AnimatePresence>
        {showSleepPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowSleepPicker(false)}>
            <motion.div initial={{ y: 60, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 60, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl p-6"
              style={{ background: "rgba(8,13,26,0.99)", border: "1px solid rgba(167,139,250,0.2)" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="font-cinzel text-base font-bold text-white">Sleep Timer</p>
                <button onClick={() => setShowSleepPicker(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-inter mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Audio will automatically pause after the selected time</p>
              <div className="grid grid-cols-3 gap-3">
                {SLEEP_TIMER_OPTIONS.map(m => (
                  <button key={m} onClick={() => startSleepTimer(m)}
                    className="py-3 rounded-2xl font-cinzel text-sm transition-all"
                    style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                    {m} min
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}