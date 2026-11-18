import { useEffect, useState } from "react";

const isLightNow = () => typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "light";

/** Tracks whether the light theme is active (re-renders on theme switch). */
export function useIsLight() {
  const [light, setLight] = useState(isLightNow);
  useEffect(() => {
    const obs = new MutationObserver(() => setLight(isLightNow()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return light;
}

// Darkens a #rrggbb color toward black so it stays readable (AA) on light surfaces.
const deepen = (hex, k = 0.5) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const ch = (v) => Math.round(v * k).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
};

/** Returns a function that maps a bright accent to a theme-safe one. */
export function useAccentTint() {
  const light = useIsLight();
  return (hex) => (light ? deepen(hex) : hex);
}