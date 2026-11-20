import Toggle from "@/components/ui/Toggle";

// One reminder: on/off and the time it should arrive (in the user's own time zone).
export default function ReminderRow({ icon, title, description, enabled, time, timeLabel, onChange }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--fill-1)", border: "1px solid var(--hairline)" }}>
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none mt-0.5" aria-hidden="true">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-cinzel font-semibold" style={{ color: "rgb(var(--ink) / 0.9)" }}>{title}</p>
          <p className="text-xs font-inter mt-1 leading-relaxed" style={{ color: "rgb(var(--ink) / 0.6)" }}>{description}</p>
        </div>
        <Toggle value={enabled} onChange={() => onChange({ enabled: !enabled })} label={title} />
      </div>
      {enabled && (
        <label className="flex items-center justify-between gap-3 mt-3 pt-3" style={{ borderTop: "1px solid var(--hairline)" }}>
          <span className="text-xs font-inter" style={{ color: "rgb(var(--ink) / 0.6)" }}>{timeLabel}</span>
          <input type="time" value={time} onChange={(e) => e.target.value && onChange({ time: e.target.value })}
            className="rounded-xl px-3 py-2 text-sm font-cinzel focus:outline-none"
            style={{ fontSize: 16, background: "var(--fill-2)", border: "1px solid var(--hairline)", color: "hsl(var(--primary))" }} />
        </label>
      )}
    </div>
  );
}