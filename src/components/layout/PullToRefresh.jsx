import { useEffect, useRef, useState } from "react";
import { ArrowDown, Loader2 } from "lucide-react";
import { getRefreshHandler } from "@/lib/pullRefresh";

const THRESHOLD = 64;
const MAX = 96;

const scrolledAncestor = (el) => {
  for (let n = el; n && n !== document.body; n = n.parentElement) if (n.scrollTop > 0) return true;
  return false;
};

// Pull down from the top of a screen to reload it. Shows just below the sticky header.
export default function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const [top, setTop] = useState(0);
  const startY = useRef(null);
  const pullRef = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    const onStart = (e) => {
      if (busyRef.current || !getRefreshHandler() || e.touches.length !== 1 || window.scrollY > 0) return;
      if (e.target.closest?.('[role="dialog"], [data-no-pull]') || scrolledAncestor(e.target)) return;
      startY.current = e.touches[0].clientY;
      setTop(document.querySelector("header")?.getBoundingClientRect().bottom || 0);
    };
    const onMove = (e) => {
      if (startY.current == null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (window.scrollY > 0) startY.current = null;
      pullRef.current = dy > 0 && startY.current != null ? Math.min(MAX, dy * 0.5) : 0;
      setPull(pullRef.current);
    };
    const onEnd = async () => {
      if (startY.current == null) return;
      startY.current = null;
      const go = pullRef.current >= THRESHOLD;
      pullRef.current = 0;
      if (!go) { setPull(0); return; }
      busyRef.current = true;
      setBusy(true);
      setPull(THRESHOLD);
      try {
        await getRefreshHandler()?.();
      } finally {
        busyRef.current = false;
        setBusy(false);
        setPull(0);
      }
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  if (!pull && !busy) return null;
  const ready = pull >= THRESHOLD;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={busy ? "Refreshing" : "Pull to refresh"}
      className="fixed left-0 right-0 z-[60] flex justify-center pointer-events-none"
      style={{ top: `max(${top}px, env(safe-area-inset-top))`, transform: `translateY(${pull * 0.6 - 8}px)`, opacity: Math.min(1, pull / THRESHOLD) }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border shadow-lg text-primary">
        {busy
          ? <Loader2 className="w-5 h-5 animate-spin" />
          : <ArrowDown className="w-5 h-5 transition-transform" style={{ transform: ready ? "rotate(180deg)" : "none" }} />}
      </div>
    </div>
  );
}