import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

function calcStreak(audio) {
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
  return s;
}

export default function useAudioDashboard() {
  const [audioHistory, setAudioHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [notifPrefs, setNotifPrefs] = useState({ enabled: true, time: "20:00", goal: 1 });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [audio, , prefs] = await Promise.all([
          base44.entities.BibleAudioProgress.list("-updated_date", 500),
          base44.entities.UserXP.list("-updated_date", 1),
          base44.entities.UserPreferences.list("-updated_date", 1),
        ]);
        setAudioHistory(audio || []);
        if (prefs?.[0]) {
          setNotifPrefs({
            enabled: prefs[0].notifications_enabled ?? true,
            time: prefs[0].daily_verse_time || "20:00",
            goal: prefs[0].daily_audio_goal || 1,
          });
        }
        setStreak(calcStreak(audio));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const saveNotifPrefs = async () => {
    const existing = await base44.entities.UserPreferences.list("-updated_date", 1);
    const data = {
      notifications_enabled: notifPrefs.enabled,
      daily_verse_time: notifPrefs.time,
      daily_audio_goal: notifPrefs.goal,
    };
    if (existing?.[0]) await base44.entities.UserPreferences.update(existing[0].id, data);
    else await base44.entities.UserPreferences.create(data);
  };

  return { audioHistory, loading, streak, notifPrefs, setNotifPrefs, saveNotifPrefs };
}

export function formatTime(secs) {
  if (!secs) return "0:00";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}