export function SkeletonVerse() {
  return (
    <div className="py-2 px-2 space-y-1.5 animate-pulse">
      <div className="h-4 rounded-full" style={{ background: "rgba(255,255,255,0.05)", width: "90%" }} />
      <div className="h-4 rounded-full" style={{ background: "rgba(255,255,255,0.04)", width: "75%" }} />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl p-4 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }}>
      <div className="h-4 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.06)", width: "60%" }} />
      <div className="h-3 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.04)", width: "90%" }} />
      <div className="h-3 rounded-full" style={{ background: "rgba(255,255,255,0.04)", width: "70%" }} />
    </div>
  );
}