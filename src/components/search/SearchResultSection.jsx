export default function SearchResultSection({ title, icon: Icon, count, color, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <p className="text-[10px] font-cinzel uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.3)" }}>{title}</p>
        <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{count}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}