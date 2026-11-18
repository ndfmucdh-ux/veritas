// One toggle for the whole app: fixed track and thumb sizes so it never stretches with other button rules.
export default function Toggle({ value, onChange, label, disabled = false }) {
  return (
    <button
      type="button" role="switch" aria-checked={!!value} aria-label={label} disabled={disabled} onClick={onChange}
      className="relative flex-shrink-0 rounded-full transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        width: 44, height: 26, minWidth: 44, minHeight: 26, padding: 0,
        background: value ? "hsl(var(--primary))" : "var(--fill-3)",
        border: "1px solid var(--hairline)",
      }}
    >
      <span
        aria-hidden="true"
        className="absolute rounded-full shadow transition-transform"
        style={{ top: 2, left: 2, width: 20, height: 20, background: "#fff", transform: `translateX(${value ? 18 : 0}px)` }}
      />
    </button>
  );
}