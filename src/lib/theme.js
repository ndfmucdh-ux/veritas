// Theme manager: "light" | "dark" | "system". Mirrors the early script in index.html.
export const THEME_KEY = "theme";
const MODES = ["light", "dark", "system"];
const META_COLORS = { light: "#f7f3ee", dark: "#141413" };

const systemQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

export const getThemeMode = () => {
  const stored = localStorage.getItem(THEME_KEY);
  return MODES.includes(stored) ? stored : "light";
};

export const resolveTheme = (mode) =>
  mode === "system" ? (systemQuery().matches ? "dark" : "light") : mode;

export function applyTheme(mode, { animate = false } = {}) {
  const root = document.documentElement;
  const resolved = resolveTheme(mode);
  if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("theme-transition");
    setTimeout(() => root.classList.remove("theme-transition"), 250);
  }
  root.setAttribute("data-theme", resolved);
  root.setAttribute("data-theme-mode", mode);
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META_COLORS[resolved]);
  return resolved;
}

export function setThemeMode(mode) {
  if (!MODES.includes(mode)) return;
  localStorage.setItem(THEME_KEY, mode);
  applyTheme(mode, { animate: true });
  window.dispatchEvent(new CustomEvent("veritas:theme", { detail: mode }));
}