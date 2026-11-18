import { useState } from "react";
import Toggle from "@/components/ui/Toggle";
import { useLang } from "@/lib/LanguageContext";
import { motion } from "framer-motion";

const SLEEP_TIMER_OPTIONS = [5, 10, 15, 20, 30, 45, 60];
const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

export default function AudioSettingsTab({
  notifPrefs, setNotifPrefs, onSavePrefs,
  sleepTimer, sleepCountdownLabel, onStartSleepTimer, onCancelSleepTimer,
}) {
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedPrefs, setSavedPrefs] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(() => parseFloat(localStorage.getItem("veritas_audio_speed") || "1"));

  const { t } = useLang();
  const handleSave = async () => {
    setSavingPrefs(true);
    try {
      await onSavePrefs();
      setSavedPrefs(true);
      setTimeout(() => setSavedPrefs(false), 2000);
    } catch {}
    setSavingPrefs(false);
  };

  const applySpeed = (speed) => {
    setPlaybackSpeed(speed);
    localStorage.setItem("veritas_audio_speed", String(speed));
    document.querySelectorAll("audio, video").forEach(el => { el.playbackRate = speed; });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 space-y-4" style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
        <p className="font-cinzel text-xs uppercase tracking-widest" style={{ color: "rgb(var(--ink) / 0.3)" }}>{t.s1ListenNotif}</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-cinzel text-sm text-white">{t.s1EnableRem}</p>
            <p className="text-[10px] font-inter" style={{ color: "rgb(var(--ink) / 0.35)" }}>{t.s1DailyPing}</p>
          </div>
          <Toggle value={notifPrefs.enabled} onChange={() => setNotifPrefs(p => ({ ...p, enabled: !p.enabled }))} label={t.s1EnableRem} />
        </div>

        <div>
          <p className="font-cinzel text-xs text-white mb-2">{t.s1RemTime}</p>
          <input type="time" value={notifPrefs.time}
            onChange={e => setNotifPrefs(p => ({ ...p, time: e.target.value }))}
            className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
            style={{ background: "var(--fill-3)", border: "1px solid rgb(var(--ink) / 0.1)", color: "rgb(var(--ink) / 0.85)" }} />
        </div>

        <div>
          <p className="font-cinzel text-xs text-white mb-2">{t.s1DailyGoal}: <span style={{ color: "#00f5ff" }}>{notifPrefs.goal}</span></p>
          <div className="flex gap-2">
            {[1, 2, 3, 5].map(n => (
              <button key={n} onClick={() => setNotifPrefs(p => ({ ...p, goal: n }))}
                className="flex-1 py-2 rounded-xl font-cinzel text-sm transition-all"
                style={{
                  background: notifPrefs.goal === n ? "rgba(0,245,255,0.15)" : "rgb(var(--ink) / 0.05)",
                  color: notifPrefs.goal === n ? "#00f5ff" : "rgb(var(--ink) / 0.4)",
                  border: notifPrefs.goal === n ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgb(var(--ink) / 0.07)",
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={savingPrefs}
          className="w-full py-3 rounded-2xl font-cinzel text-sm transition-all"
          style={{ background: savedPrefs ? "rgba(52,211,153,0.2)" : "rgba(0,245,255,0.12)", color: savedPrefs ? "#34d399" : "#00f5ff", border: savedPrefs ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(0,245,255,0.25)" }}>
          {savedPrefs ? t.s1Saved : savingPrefs ? t.s1Saving : t.s1SavePrefs}
        </motion.button>
      </div>

      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(0,0,0,0.3))", border: "1px solid rgba(201,168,76,0.25)", boxShadow: "0 0 32px rgba(201,168,76,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)" }}>
            <span className="text-base">⚡</span>
          </div>
          <div>
            <p className="font-cinzel text-sm font-bold" style={{ color: "#c9a84c" }}>{t.s1Speed}</p>
            <p className="text-[10px] font-inter" style={{ color: "rgb(var(--ink) / 0.35)" }}>{t.s1SpeedSub}</p>
          </div>
          <div className="ml-auto px-3 py-1 rounded-full font-cinzel text-sm font-bold" style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.3)" }}>
            {playbackSpeed}x
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {SPEED_OPTIONS.map(speed => {
            const isActive = playbackSpeed === speed;
            return (
              <motion.button key={speed} whileTap={{ scale: 0.9 }} onClick={() => applySpeed(speed)}
                className="py-3 rounded-xl font-cinzel font-bold text-sm transition-all relative overflow-hidden"
                style={{
                  background: isActive ? "linear-gradient(135deg, rgba(201,168,76,0.3), rgba(201,168,76,0.15))" : "rgb(var(--ink) / 0.04)",
                  color: isActive ? "#c9a84c" : "rgb(var(--ink) / 0.4)",
                  border: isActive ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgb(var(--ink) / 0.08)",
                  boxShadow: isActive ? "0 0 18px rgba(201,168,76,0.2), inset 0 1px 0 rgba(201,168,76,0.2)" : "none",
                }}>
                <span className="relative z-10">{speed}x</span>
              </motion.button>
            );
          })}
        </div>
        <p className="text-[10px] font-inter text-center" style={{ color: "rgb(var(--ink) / 0.25)" }}>{t.s1SpeedNote}</p>
      </div>

      <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
        <p className="font-cinzel text-xs uppercase tracking-widest" style={{ color: "rgb(var(--ink) / 0.3)" }}>{t.s1Sleep}</p>
        <p className="text-xs font-inter" style={{ color: "rgb(var(--ink) / 0.45)" }}>{t.s1SleepSub}</p>
        <div className="grid grid-cols-4 gap-2">
          {SLEEP_TIMER_OPTIONS.map(m => (
            <button key={m} onClick={() => onStartSleepTimer(m)}
              className="py-2 rounded-xl font-cinzel text-xs transition-all"
              style={{
                background: sleepTimer === m ? "rgba(167,139,250,0.2)" : "rgb(var(--ink) / 0.04)",
                color: sleepTimer === m ? "#a78bfa" : "rgb(var(--ink) / 0.4)",
                border: sleepTimer === m ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgb(var(--ink) / 0.07)",
              }}>
              {m}m
            </button>
          ))}
        </div>
        {sleepTimer && (
          <button onClick={onCancelSleepTimer}
            className="w-full py-2 rounded-xl font-cinzel text-xs"
            style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
            Cancel Timer ({sleepCountdownLabel})
          </button>
        )}
      </div>
    </div>
  );
}