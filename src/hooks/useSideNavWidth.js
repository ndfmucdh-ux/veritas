import { useState, useEffect, useCallback } from "react";

/** A width the user can drag to change; remembered in localStorage. */
export function useResizableWidth(key, def, min, max) {
  const [width, setWidthState] = useState(() => Number(localStorage.getItem(key)) || def);
  const setWidth = useCallback((w) => {
    const next = Math.round(Math.min(max, Math.max(min, w)));
    localStorage.setItem(key, String(next));
    setWidthState(next);
  }, [key, min, max]);
  const reset = useCallback(() => {
    localStorage.removeItem(key);
    setWidthState(def);
  }, [key, def]);
  return { width, setWidth, reset };
}

export const NAV_FULL = 224;
export const NAV_ICONS = 72;
const NAV_COLLAPSE_BELOW = 140;

/**
 * Side menu width. Only the reader lets the user resize it (drag below ~140px = icons only);
 * every other page keeps the full menu. Exposed as the --sidenav-w CSS variable.
 */
export default function useSideNavWidth(isReader) {
  const { width: saved, setWidth: save, reset } = useResizableWidth("veritas_sidenav_width", NAV_FULL, NAV_ICONS, 320);
  const width = isReader ? saved : NAV_FULL;

  useEffect(() => {
    document.documentElement.style.setProperty("--sidenav-w", `${width}px`);
  }, [width]);

  const setWidth = useCallback((w) => save(w < NAV_COLLAPSE_BELOW ? NAV_ICONS : Math.max(w, NAV_FULL - 40)), [save]);

  return { width, collapsed: width < NAV_COLLAPSE_BELOW, setWidth, reset };
}