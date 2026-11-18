import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { smoothNavigate } from "@/lib/smoothNavigate";

/**
 * Routes every in-app <a>/<Link> click through smoothNavigate (View Transitions).
 * Back/forward (popstate, including mobile swipe) is left to the browser's native
 * animation so pages never animate twice.
 */
export default function ViewTransitionLinks() {
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const to = url.pathname + url.search + url.hash;
      if (to === window.location.pathname + window.location.search + window.location.hash) return;
      e.preventDefault();
      smoothNavigate(() => navigate(to));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [navigate]);

  return null;
}