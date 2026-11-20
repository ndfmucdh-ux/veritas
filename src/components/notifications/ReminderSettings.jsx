import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import Toggle from "@/components/ui/Toggle";
import { Spinner } from "@/components/ui/states";
import DailyVerseEmailToggle from "@/components/profile/DailyVerseEmailToggle";
import ReminderRow from "@/components/notifications/ReminderRow";
import { useLang } from "@/lib/LanguageContext";
import { getMyPrefs, savePrefs } from "@/lib/preferencesSync";
import { REMINDER_COPY, REMINDER_DEFAULTS, REMINDER_KINDS } from "@/lib/reminderCopy";

const ICONS = { streak: "🔥", scripture: "📖", prayer: "🙏", followup: "🎧" };
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

const withDefaults = (saved = {}) => ({
  channels: { push: saved.channels?.push !== false, email: saved.channels?.email !== false },
  ...Object.fromEntries(REMINDER_KINDS.map((k) => [k, { ...REMINDER_DEFAULTS[k], ...(saved[k] || {}) }])),
});

// Every reminder the user can set. Changes save to their account by themselves, so nothing
// is lost when they leave the page or close the app.
export default function ReminderSettings() {
  const { lang } = useLang();
  const C = REMINDER_COPY[lang] || REMINDER_COPY.en;
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);
  const timer = useRef(null);
  const pending = useRef(null);

  useEffect(() => {
    getMyPrefs().then((p) => setSettings(withDefaults(p?.reminders))).catch(() => setSettings(withDefaults()));
    return () => {
      clearTimeout(timer.current);
      // Leaving the page right after a change must not lose it.
      if (pending.current) savePrefs({ reminders: pending.current, timezone: TZ });
    };
  }, []);

  const update = (next) => {
    setSettings(next);
    setSaved(false);
    pending.current = next;
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      pending.current = null;
      await savePrefs({ reminders: next, timezone: TZ });
      setSaved(true);
      timer.current = setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  if (!settings) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-cinzel font-semibold" style={{ color: "rgb(var(--ink) / 0.92)" }}>{C.title}</h2>
        <p className="text-xs font-inter mt-1" style={{ color: "rgb(var(--ink) / 0.6)" }}>{C.sub}</p>
        <p className="text-[11px] font-inter mt-1" style={{ color: "rgb(var(--ink) / 0.5)" }}>{C.tz}: {TZ}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {[["push", C.push, C.pushSub], ["email", C.email, C.emailSub]].map(([key, label, sub]) => (
          <div key={key} className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3" style={{ background: "var(--fill-1)", border: "1px solid var(--hairline)" }}>
            <div className="min-w-0">
              <p className="text-sm font-inter" style={{ color: "rgb(var(--ink) / 0.9)" }}>{label}</p>
              <p className="text-[11px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.55)" }}>{sub}</p>
            </div>
            <Toggle value={settings.channels[key]} label={label}
              onChange={() => update({ ...settings, channels: { ...settings.channels, [key]: !settings.channels[key] } })} />
          </div>
        ))}
      </div>

      {REMINDER_KINDS.map((kind) => (
        <ReminderRow key={kind} icon={ICONS[kind]} title={C[kind][0]} description={C[kind][1]} timeLabel={C.time}
          enabled={settings[kind].enabled} time={settings[kind].time}
          onChange={(patch) => update({ ...settings, [kind]: { ...settings[kind], ...patch } })} />
      ))}

      <DailyVerseEmailToggle />

      <p className="h-5 flex items-center gap-1.5 text-xs font-inter" style={{ color: "hsl(var(--success))" }} aria-live="polite">
        {saved && <><Check className="w-3.5 h-3.5" /> {C.saved}</>}
      </p>
    </div>
  );
}