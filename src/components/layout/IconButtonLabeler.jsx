import { useEffect } from "react";

// Safety net: any button that holds only an icon and has no accessible name gets one
// (from its title, otherwise from the icon's name), so screen readers never hear "button".
const LABELS = {
  x: "Close", "trash-2": "Delete", trash: "Delete", pencil: "Edit", history: "History",
  "chevron-right": "Expand", "chevron-down": "Expand", "chevron-left": "Previous", "rotate-ccw": "Reset",
  "folder-plus": "Save to folder", tag: "Tags", sparkles: "AI insights", "share-2": "Share",
  play: "Play", pause: "Pause", eye: "Show password", "eye-off": "Hide password", image: "Change photo",
};

function nameOf(btn) {
  if (btn.hasAttribute("aria-label") || btn.hasAttribute("aria-labelledby")) return true;
  return !!btn.textContent.trim();
}

function label(btn) {
  if (nameOf(btn)) return;
  const svg = btn.querySelector("svg");
  if (!svg) return;
  const icon = [...svg.classList].find((c) => c.startsWith("lucide-") && c !== "lucide")?.slice(7);
  const text = btn.getAttribute("title") || LABELS[icon];
  if (text) btn.setAttribute("aria-label", text);
}

function scan(root) {
  if (root.nodeType !== 1) return;
  if (root.tagName === "BUTTON") label(root);
  root.querySelectorAll?.("button").forEach(label);
}

export default function IconButtonLabeler() {
  useEffect(() => {
    scan(document.body);
    const obs = new MutationObserver((records) => records.forEach((r) => r.addedNodes.forEach(scan)));
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);
  return null;
}