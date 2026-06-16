import { useState } from "react";
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
                  border: notifPrefs.goal === n ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.07)",
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={savingPrefs}
          className="w-full py-3 rounded-2xl font-cinzel text-sm transition-all"
          style={{ background: savedPrefs ? "rgba(52,211,153,0.2)" : "rgba(0,245,255,0.12)", color: savedPrefs ? "#34d399" : "#00f5ff", border: savedPrefs ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(0,245,255,0.25)" }}>
          {savedPrefs ? "✓ Saved!" : savingPrefs ? "Saving…" : "Save Preferences"}
        </motion.button>
      </div>

      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(0,0,0,0.3))", border: "1px solid rgba(201,168,76,0.25)", boxShadow: "0 0 32px rgba(201,168,76,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)" }}>
            <span className="text-base">⚡</span>
          </div>
          <div>
            <p className="font-cinzel text-sm font-bold" style={{ color: "#c9a84c" }}>Playback Speed</p>
            <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>Adjust listening pace</p>
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
                  background: isActive ? "linear-gradient(135deg, rgba(201,168,76,0.3), rgba(201,168,76,0.15))" : "rgba(255,255,255,0.04)",
                  color: isActive ? "#c9a84c" : "rgba(255,255,255,0.4)",
                  border: isActive ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isActive ? "0 0 18px rgba(201,168,76,0.2), inset 0 1px 0 rgba(201,168,76,0.2)" : "none",
                }}>
                <span className="relative z-10">{speed}x</span>
              </motion.button>
            );
          })}
        </div>
        <p className="text-[10px] font-inter text-center" style={{ color: "rgba(255,255,255,0.25)" }}>Speed is saved and applied to all audio playback</p>
      </div>

      <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="font-cinzel text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Sleep Timer</p>
        <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.45)" }}>Auto-stop audio after selected duration</p>
        <div className="grid grid-cols-4 gap-2">
          {SLEEP_TIMER_OPTIONS.map(m => (
            <button key={m} onClick={() => onStartSleepTimer(m)}
              className="py-2 rounded-xl font-cinzel text-xs transition-all"
              style={{
                background: sleepTimer === m ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
                color: sleepTimer === m ? "#a78bfa" : "rgba(255,255,255,0.4)",
                border: sleepTimer === m ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.07)",
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