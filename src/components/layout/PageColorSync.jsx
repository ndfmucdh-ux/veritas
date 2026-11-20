import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Resolves the real page color (the --background token) as a hex value.
function readPageColor() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--background").trim();
  if (!v) return null;
  const probe = document.createElement("div");
  probe.style.color = `hsl(${v})`;
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color.match(/\d+/g) || [];
  probe.remove();
  if (rgb.length < 3) return null;
  return `#${rgb.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`;
}

// Publishes the exact page color on every theme or page change, so the iPhone shell
// (status bar, overscroll and pre-paint background) can follow it and never flash white.
function publish() {
  const color = readPageColor();
  if (!color) return;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
  window.__veritasPageColor = color;
  window.dispatchEvent(new CustomEvent("veritas:pagecolor", { detail: color }));
  window.webkit?.messageHandlers?.pageColor?.postMessage?.(color);
}

export default function PageColorSync() {
  const { pathname } = useLocation();

  useEffect(() => {
    const id = requestAnimationFrame(publish);
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    const again = () => requestAnimationFrame(publish);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    window.addEventListener("veritas:theme", again);
    window.addEventListener("pageshow", again);
    mq.addEventListener?.("change", again);
    return () => {
      window.removeEventListener("veritas:theme", again);
      window.removeEventListener("pageshow", again);
      mq.removeEventListener?.("change", again);
    };
  }, []);

  return null;
}