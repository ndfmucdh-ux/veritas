import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { smoothNavigate } from "@/lib/smoothNavigate";
import { prefetchRoute } from "@/lib/routeLoaders";

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
    // Start loading the target page's code the moment a finger/cursor lands on a link.
    const onPress = (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin === window.location.origin) prefetchRoute(url.pathname);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("pointerdown", onPress, { passive: true });
    document.addEventListener("touchstart", onPress, { passive: true });
    document.addEventListener("pointerover", onPress, { passive: true });
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerdown", onPress);
      document.removeEventListener("touchstart", onPress);
      document.removeEventListener("pointerover", onPress);
    };
  }, [navigate]);

  return null;
}