import { useState, useEffect } from "react";
import Toggle from "@/components/ui/Toggle";
import { motion } from "framer-motion";
import { BellOff, Bell, Clock, Check, AlarmClock } from "lucide-react";

const STORAGE_KEY = "veritas_quiet_mode";
const SNOOZE_KEY = "veritas_snooze_minutes";

export default function QuietModeSettings() {
  const [quietMode, setQuietMode] = useState(false);
  const [allowDailyReading, setAllowDailyReading] = useState(true);
  const [snoozeMinutes, setSnoozeMinutes] = useState(30);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (stored.enabled !== undefined) setQuietMode(stored.enabled);
      if (stored.allowDailyReading !== undefined) setAllowDailyReading(stored.allowDailyReading);
      const snooze = parseInt(localStorage.getItem(SNOOZE_KEY) || "30");
      setSnoozeMinutes(snooze);
    } catch {}
  }, []);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: quietMode, allowDailyReading }));
    localStorage.setItem(SNOOZE_KEY, String(snoozeMinutes));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const SNOOZE_OPTIONS = [5, 10, 15, 30, 60, 120];

  return (
    <div className="space-y-5">
      {/* Quiet Mode Toggle */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: quietMode ? "rgba(167,139,250,0.06)" : "rgb(var(--ink) / 0.03)", border: quietMode ? "1px solid rgba(167,139,250,0.2)" : "1px solid rgb(var(--ink) / 0.08)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: quietMode ? "rgba(167,139,250,0.15)" : "rgb(var(--ink) / 0.06)", border: `1px solid ${quietMode ? "rgba(167,139,250,0.3)" : "rgb(var(--ink) / 0.1)"}` }}>
              {quietMode ? <BellOff className="w-4 h-4" style={{ color: "#a78bfa" }} /> : <Bell className="w-4 h-4" style={{ color: "rgb(var(--ink) / 0.4)" }} />}
            </div>
            <div>
              <p className="font-cinzel text-sm font-semibold text-white">Quiet Mode</p>
              <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.4)" }}>
                Silence all notifications except your chosen essentials
              </p>
            </div>
          </div>
          <Toggle value={quietMode} onChange={() => setQuietMode(v => !v)} label="Quiet mode" />
        </div>

        {quietMode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden pt-2 space-y-3 border-t" style={{ borderColor: "rgba(167,139,250,0.15)" }}>
            <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgb(var(--ink) / 0.3)" }}>
              Allow through quiet mode
            </p>

            <div className="flex items-center justify-between px-3 py-3 rounded-xl"
              style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5" style={{ color: "#00f5ff" }} />
                <p className="text-sm font-inter" style={{ color: "rgb(var(--ink) / 0.75)" }}>Daily Reading Reminder</p>
              </div>
              <Toggle value={allowDailyReading} onChange={() => setAllowDailyReading(v => !v)} label="Daily Reading Reminder" />
            </div>

            {[
              "Prayer Journal Reminder",
              "Weekly Digest Email",
              "Devotional Plan Reminder",
              "Streak Alert",
            ].map(label => (
              <div key={label} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.05)" }}>
                <p className="text-sm font-inter" style={{ color: "rgb(var(--ink) / 0.45)" }}>{label}</p>
                <span className="text-[9px] font-cinzel px-2 py-0.5 rounded-full" style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                  Silenced
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Snooze Setting */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.12)" }}>
        <div className="flex items-center gap-3">
          <AlarmClock className="w-4 h-4" style={{ color: "#00f5ff" }} />
          <div>
            <p className="font-cinzel text-sm font-semibold text-white">Snooze Duration</p>
            <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.4)" }}>
              When you snooze a daily reminder, push it back by this amount
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SNOOZE_OPTIONS.map(mins => (
            <button key={mins} onClick={() => setSnoozeMinutes(mins)}
              className="py-3 rounded-xl text-sm font-cinzel transition-all"
              style={{
                background: snoozeMinutes === mins ? "rgba(0,245,255,0.15)" : "rgb(var(--ink) / 0.04)",
                color: snoozeMinutes === mins ? "#00f5ff" : "rgb(var(--ink) / 0.45)",
                border: snoozeMinutes === mins ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgb(var(--ink) / 0.07)",
              }}>
              {mins < 60 ? `${mins}m` : `${mins / 60}h`}
            </button>
          ))}
        </div>
        <p className="text-[10px] font-inter" style={{ color: "rgb(var(--ink) / 0.3)" }}>
          <Clock className="w-3 h-3 inline mr-1" />
          Your daily reading reminder will snooze for <strong style={{ color: "#00f5ff" }}>
            {snoozeMinutes < 60 ? `${snoozeMinutes} minutes` : `${snoozeMinutes / 60} hour${snoozeMinutes > 60 ? "s" : ""}`}
          </strong> when dismissed.
        </p>
      </div>

      {/* Save */}
      <button onClick={save}
        className="w-full py-3.5 rounded-2xl font-cinzel text-sm font-semibold flex items-center justify-center gap-2 transition-all"
        style={{ background: saved ? "rgba(52,211,153,0.15)" : "rgba(0,245,255,0.12)", color: saved ? "#34d399" : "#00f5ff", border: `1px solid ${saved ? "rgba(52,211,153,0.3)" : "rgba(0,245,255,0.25)"}` }}>
        {saved ? <><Check className="w-4 h-4" /> Saved</> : "Save Preferences"}
      </button>
    </div>
  );
}