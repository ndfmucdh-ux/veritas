import { useState, useRef } from "react";
import { useLang } from "@/lib/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import jsPDF from "jspdf";
import AudioPlaylists from "@/components/audio/AudioPlaylists";
import AudioOverviewTab from "@/components/audio/AudioOverviewTab";
import AudioHistoryTab from "@/components/audio/AudioHistoryTab";
import AudioBookmarksTab from "@/components/audio/AudioBookmarksTab";
import AudioSettingsTab from "@/components/audio/AudioSettingsTab";
import useAudioDashboard from "@/hooks/useAudioDashboard";

const SLEEP_TIMER_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

const formatCountdown = (secs) => {
  if (!secs) return "";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export default function AudioDashboard() {
  const { t } = useLang();
  const { audioHistory, streak, notifPrefs, setNotifPrefs, saveNotifPrefs } = useAudioDashboard();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [timestampBookmarks, setTimestampBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("veritas_audio_bookmarks") || "[]"); } catch { return []; }
  });
  const [bookmarkSaved, setBookmarkSaved] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [sleepCountdown, setSleepCountdown] = useState(null);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef(null);

  const startSleepTimer = (minutes) => {
    setSleepTimer(minutes);
    setSleepCountdown(minutes * 60);
    setShowSleepPicker(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSleepCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setSleepTimer(null); return null; }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSleepTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSleepTimer(null);
    setSleepCountdown(null);
  };

  const saveTimestampBookmark = (audioEntry) => {
    const bookmark = {
      id: Date.now(), book: audioEntry.book, chapter: audioEntry.chapter, translation: audioEntry.translation,
      timestamp_seconds: audioEntry.timestamp_seconds || 0, saved_at: new Date().toISOString(),
      label: `${audioEntry.book} ${audioEntry.chapter}`,
    };
    const updated = [bookmark, ...timestampBookmarks].slice(0, 50);
    setTimestampBookmarks(updated);
    localStorage.setItem("veritas_audio_bookmarks", JSON.stringify(updated));
    setBookmarkSaved(audioEntry.id);
    setTimeout(() => setBookmarkSaved(null), 2000);
  };

  const deleteTimestampBookmark = (id) => {
    const updated = timestampBookmarks.filter(b => b.id !== id);
    setTimestampBookmarks(updated);
    localStorage.setItem("veritas_audio_bookmarks", JSON.stringify(updated));
  };

  const exportCSV = async () => {
    setBusy(true);
    try {
      const res = await base44.functions.invoke("exportAudioHistory", { format: "csv" });
      const blob = new Blob([res.data || ""], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "audio-history.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setBusy(false);
  };

  const exportPDF = async () => {
    setBusy(true);
    try {
      const res = await base44.functions.invoke("exportAudioHistory", { format: "pdf" });
      const data = res.data;
      if (data) {
        const doc = new jsPDF();
        doc.setFontSize(20); doc.setTextColor(0, 245, 255);
        doc.text("Veritas — Audio Listening Report", 20, 20);
        doc.setFontSize(11); doc.setTextColor(60, 60, 80);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
        doc.setFontSize(13); doc.setTextColor(30, 30, 50);
        doc.text("Summary", 20, 45);
        doc.setFontSize(10); doc.setTextColor(60, 60, 80);
        doc.text(`Total Chapters Started: ${data.summary?.total_chapters_started || 0}`, 20, 55);
        doc.text(`Chapters Completed: ${data.summary?.total_completed || 0}`, 20, 63);
        doc.text(`Total Listening Time: ${data.summary?.total_listening_hours || 0} hours`, 20, 71);
        let y = 85;
        doc.setFontSize(13); doc.setTextColor(30, 30, 50);
        doc.text("Progress by Book", 20, y); y += 10;
        for (const [book, info] of Object.entries(data.by_book || {})) {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.setFontSize(10); doc.setTextColor(60, 60, 80);
          doc.text(`${book}: ${info.completed}/${info.total} chapters completed`, 20, y);
          y += 8;
        }
        doc.save("audio-history.pdf");
      }
    } catch {}
    setBusy(false);
  };

  const shareProgress = async () => {
    setBusy(true);
    try {
      const completed = audioHistory.filter(a => a.completed).length;
      const text = `🎧 I've listened to ${completed} Bible chapters on Veritas with a ${streak}-day streak! Join me: https://app.veritas.com`;
      if (navigator.share) await navigator.share({ title: t.s1ShareTitle, text });
      else { await navigator.clipboard.writeText(text); alert(t.s1Copied); }
    } catch {}
    setBusy(false);
  };

  // Stats
  const completed = audioHistory.filter(a => a.completed).length;
  const totalMinutes = Math.round(audioHistory.reduce((s, a) => s + (a.timestamp_seconds || 0), 0) / 60);
  const booksCompleted = new Set(audioHistory.filter(a => a.completed).map(a => a.book)).size;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = audioHistory.filter(a => a.completed && (a.updated_date || a.created_date)?.startsWith(todayStr)).length;

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
      <div className="relative h-44 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80" alt="Audio" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(10,14,26,0.92))" }} />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <h1 className="font-cinzel text-3xl font-semibold text-foreground">{t.s1AudioTitle}</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgb(var(--ink) / 0.4)" }}>{t.s1AudioSub}</p>
        </div>
      </div>

      <AnimatePresence>
        {sleepTimer && (
          <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
            className="mx-4 mt-3 px-4 py-3 rounded-2xl flex items-center justify-between"
            style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)" }}>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" style={{ color: "#a78bfa" }} />
              <span className="font-cinzel text-sm" style={{ color: "#a78bfa" }}>Sleep timer: {formatCountdown(sleepCountdown)}</span>
            </div>
            <button aria-label="Cancel sleep timer" onClick={cancelSleepTimer} className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "var(--fill-3)", color: "rgb(var(--ink) / 0.4)" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1.5 px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
        {[
          ["dashboard", "📊 Overview"],
          ["history", "📖 History"],
          ["bookmarks", "🔖 Bookmarks"],
          ["playlists", "🎵 Playlists"],
          ["settings", "⚙️ Settings"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex-shrink-0 px-4 py-2 rounded-xl font-cinzel text-xs transition-all"
            style={{
              background: activeTab === id ? "rgba(0,245,255,0.12)" : "rgb(var(--ink) / 0.04)",
              color: activeTab === id ? "#00f5ff" : "rgb(var(--ink) / 0.4)",
              border: activeTab === id ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgb(var(--ink) / 0.07)",
            }}>
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-4">
        {activeTab === "dashboard" && (
          <AudioOverviewTab
            completed={completed} streak={streak} booksCompleted={booksCompleted} totalMinutes={totalMinutes}
            todayCount={todayCount} goal={notifPrefs.goal} weeklyData={weeklyData} maxWeekly={maxWeekly}
            onSleepTimer={() => setShowSleepPicker(true)} onShare={shareProgress}
            onExportCSV={exportCSV} onExportPDF={exportPDF} busy={busy}
          />
        )}

        {activeTab === "history" && (
          <AudioHistoryTab audioHistory={audioHistory} completed={completed} bookmarkSaved={bookmarkSaved} onSaveBookmark={saveTimestampBookmark} />
        )}

        {activeTab === "bookmarks" && (
          <AudioBookmarksTab bookmarks={timestampBookmarks} onDelete={deleteTimestampBookmark} />
        )}

        {activeTab === "playlists" && <AudioPlaylists />}

        {activeTab === "settings" && (
          <AudioSettingsTab
            notifPrefs={notifPrefs} setNotifPrefs={setNotifPrefs} onSavePrefs={saveNotifPrefs}
            sleepTimer={sleepTimer} sleepCountdownLabel={formatCountdown(sleepCountdown)}
            onStartSleepTimer={startSleepTimer} onCancelSleepTimer={cancelSleepTimer}
          />
        )}
      </div>

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
              style={{ background: "var(--popover-surface)", border: "1px solid rgba(167,139,250,0.2)" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="font-cinzel text-base font-bold text-white">{t.s1Sleep}</p>
                <button onClick={() => setShowSleepPicker(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--fill-3)", color: "rgb(var(--ink) / 0.4)" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-inter mb-4" style={{ color: "rgb(var(--ink) / 0.4)" }}>{t.s1SleepNote}</p>
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