import { useState, useEffect, useCallback } from "react";

const KEY = "veritas_sidenav_width";
export const NAV_MIN = 64;
export const NAV_MAX = 320;
export const NAV_FULL = 224;
export const NAV_COLLAPSE_BELOW = 120;

const autoWidth = () =>
  window.matchMedia("(min-width: 768px) and (max-width: 1023px) and (orientation: portrait)").matches ? NAV_MIN : NAV_FULL;

/** Side menu width: user-dragged (saved) or auto (icons-only on portrait tablets). Exposed as --sidenav-w. */
export default function useSideNavWidth() {
  const [saved, setSaved] = useState(() => Number(localStorage.getItem(KEY)) || null);
  const [auto, setAuto] = useState(autoWidth);
  const width = saved || auto;

  useEffect(() => {
    const onChange = () => setAuto(autoWidth());
    window.addEventListener("resize", onChange);
    return () => window.removeEventListener("resize", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--sidenav-w", `${width}px`);
  }, [width]);

  const setWidth = useCallback((w) => {
    const next = w < NAV_COLLAPSE_BELOW ? NAV_MIN : Math.min(NAV_MAX, Math.max(NAV_FULL - 48, w));
    localStorage.setItem(KEY, String(next));
    setSaved(next);
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(KEY);
    setSaved(null);
  }, []);

  return { width, collapsed: width < NAV_COLLAPSE_BELOW, setWidth, reset };
}