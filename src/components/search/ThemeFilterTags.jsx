import { Tag } from "lucide-react";
import { useState } from "react";

const THEME_TAGS = [
  { id: "peace", label: "Peace", icon: "☮️", color: "#00f5ff" },
  { id: "healing", label: "Healing", icon: "🩹", color: "#34d399" },
  { id: "guidance", label: "Guidance", icon: "🧭", color: "#fbbf24" },
  { id: "strength", label: "Strength", icon: "💪", color: "#f87171" },
  { id: "faith", label: "Faith", icon: "✝️", color: "#a78bfa" },
  { id: "love", label: "Love", icon: "💗", color: "#f472b6" },
  { id: "hope", label: "Hope", icon: "🌅", color: "#fb923c" },
  { id: "wisdom", label: "Wisdom", icon: "🧠", color: "#ec4899" },
  { id: "grace", label: "Grace", icon: "✨", color: "#06b6d4" },
  { id: "forgiveness", label: "Forgiveness", icon: "🕊️", color: "#8b5cf6" },
  { id: "protection", label: "Protection", icon: "🛡️", color: "#22d3ee" },
  { id: "purpose", label: "Purpose", icon: "🎯", color: "#ea580c" },
];

export default function ThemeFilterTags({ selectedTag, onTagSelect }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
        <p className="text-xs font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
          Filter by Theme
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {THEME_TAGS.map(theme => (
          <button
            key={theme.id}
            onClick={() => onTagSelect(theme.id === selectedTag ? null : theme.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter transition-all"
            style={{
              background: selectedTag === theme.id ? `${theme.color}22` : "rgba(255,255,255,0.05)",
              color: selectedTag === theme.id ? theme.color : "rgba(255,255,255,0.4)",
              border: selectedTag === theme.id ? `1px solid ${theme.color}44` : "1px solid rgba(255,255,255,0.07)"
            }}
          >
            <span className="text-sm">{theme.icon}</span>
            {theme.label}
          </button>
        ))}
      </div>
    </div>
  );
}