import { useEffect, useState, useCallback } from "react";

const KEY = "veritas_theme";
export const THEMES = ["light", "dark", "system"];

export const getThemePref = () => {
  const v = localStorage.getItem(KEY);
  return THEMES.includes(v) ? v : "system";
};

const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

/** Applies a preference to <html> and the browser theme-color. */
export function applyTheme(pref) {
  const dark = pref === "dark" || (pref === "system" && systemDark());
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#1C1917" : "#FAF6F0");
}

/** Shared theme state: any component can read or change the theme and all stay in sync. */
export function useTheme() {
  const [pref, setPrefState] = useState(getThemePref);

  useEffect(() => {
    const sync = () => setPrefState(getThemePref());
    window.addEventListener("veritas-theme", sync);
    return () => window.removeEventListener("veritas-theme", sync);
  }, []);

  // Follow the operating system while on "system".
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const setPref = useCallback((next) => {
    localStorage.setItem(KEY, next);
    applyTheme(next);
    window.dispatchEvent(new Event("veritas-theme"));
  }, []);

  return { pref, setPref };
}