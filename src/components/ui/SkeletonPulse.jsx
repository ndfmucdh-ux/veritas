export function SkeletonVerse() {
  return (
    <div className="py-2 px-2 space-y-1.5 animate-pulse">
      <div className="h-4 rounded-full" style={{ background: "var(--fill-2)", width: "90%" }} />
      <div className="h-4 rounded-full" style={{ background: "var(--fill-2)", width: "75%" }} />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl p-4 animate-pulse" style={{ background: "var(--fill-2)" }}>
      <div className="h-4 rounded-full mb-3" style={{ background: "var(--fill-3)", width: "60%" }} />
      <div className="h-3 rounded-full mb-2" style={{ background: "var(--fill-2)", width: "90%" }} />
      <div className="h-3 rounded-full" style={{ background: "var(--fill-2)", width: "70%" }} />
    </div>
  );
}