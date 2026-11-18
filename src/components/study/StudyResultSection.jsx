export default function StudyResultSection({ label, color = "#00f5ff", children }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
      <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3" style={{ color }}>{label}</p>
      {children}
    </div>
  );
}