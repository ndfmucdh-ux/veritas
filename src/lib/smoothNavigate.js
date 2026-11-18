import { flushSync } from "react-dom";

/**
 * Runs a navigation inside a View Transition when supported, so the old screen
 * stays painted until the new one is committed (no blank frame in between).
 * flushSync guarantees React commits the route change inside the transition callback.
 */
export function smoothNavigate(updateCallback) {
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (typeof document.startViewTransition === "function" && !reduce) {
    document.startViewTransition(() => {
      flushSync(updateCallback);
    });
  } else {
    updateCallback();
  }
}