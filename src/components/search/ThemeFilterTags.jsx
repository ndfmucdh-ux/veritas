import { Tag, Waves, Heart, Compass, Zap, Cross, Flower2, Sunrise, Brain, Sparkles, Bird, Shield, Target } from "lucide-react";

const THEME_TAGS = [
  { id: "peace", label: "Peace", Icon: Waves, color: "#00f5ff" },
  { id: "healing", label: "Healing", Icon: Heart, color: "#34d399" },
  { id: "guidance", label: "Guidance", Icon: Compass, color: "#fbbf24" },
  { id: "strength", label: "Strength", Icon: Zap, color: "#f87171" },
  { id: "faith", label: "Faith", Icon: Sparkles, color: "#a78bfa" },
  { id: "love", label: "Love", Icon: Flower2, color: "#f472b6" },
  { id: "hope", label: "Hope", Icon: Sunrise, color: "#fb923c" },
  { id: "wisdom", label: "Wisdom", Icon: Brain, color: "#ec4899" },
  { id: "grace", label: "Grace", Icon: Sparkles, color: "#06b6d4" },
  { id: "forgiveness", label: "Forgiveness", Icon: Bird, color: "#8b5cf6" },
  { id: "protection", label: "Protection", Icon: Shield, color: "#22d3ee" },
  { id: "purpose", label: "Purpose", Icon: Target, color: "#ea580c" },
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
            <theme.Icon className="w-3.5 h-3.5" />
            {theme.label}
          </button>
        ))}
      </div>
    </div>
  );
}