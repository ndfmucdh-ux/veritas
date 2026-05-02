import { cn } from "@/lib/utils";

export function SkeletonLine({ className }) {
  return (
    <div className={cn("rounded-lg bg-white/[0.06] animate-pulse", className)} />
  );
}

export function SkeletonVerse() {
  return (
    <div className="space-y-2 py-3">
      <SkeletonLine className="h-4 w-full" />
      <SkeletonLine className="h-4 w-[90%]" />
      <SkeletonLine className="h-4 w-[75%]" />
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn("rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5 space-y-3 animate-pulse", className)}>
      <SkeletonLine className="h-3 w-24" />
      <SkeletonLine className="h-5 w-full" />
      <SkeletonLine className="h-5 w-5/6" />
      <SkeletonLine className="h-5 w-3/4" />
      <SkeletonLine className="h-3 w-20 mt-2" />
    </div>
  );
}

export default function SkeletonPulse({ lines = 3, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}