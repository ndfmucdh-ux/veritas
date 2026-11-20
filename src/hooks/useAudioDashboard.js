import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getMyPrefs, savePrefs } from "@/lib/preferencesSync";

// Local-date key (YYYY-MM-DD) — avoids the UTC drift that breaks streaks for
// users in negative-UTC timezones listening near midnight.
function localDayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function calcStreak(audio) {
  // Parse each completed record's timestamp and bucket by LOCAL calendar day,
  // matching the same local-day comparison used in the loop below.
  const completedDates = new Set(
    (audio || [])
      .filter(a => a.completed)
      .map(a => {
        const ts = a.updated_date || a.created_date;
        return ts ? localDayKey(new Date(ts)) : null;
      })
      .filter(Boolean)
  );
  let s = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (completedDates.has(localDayKey(d))) s++;
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
          getMyPrefs(),
        ]);
        setAudioHistory(audio || []);
        if (prefs) {
          setNotifPrefs({
            enabled: prefs.notifications_enabled ?? true,
            time: prefs.daily_verse_time || "20:00",
            goal: prefs.daily_audio_goal || 1,
          });
        }
        setStreak(calcStreak(audio));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const saveNotifPrefs = async () => {
    await savePrefs({
      notifications_enabled: notifPrefs.enabled,
      daily_verse_time: notifPrefs.time,
      daily_audio_goal: notifPrefs.goal,
    });
  };

  return { audioHistory, loading, streak, notifPrefs, setNotifPrefs, saveNotifPrefs };
}

export function formatTime(secs) {
  if (!secs) return "0:00";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}