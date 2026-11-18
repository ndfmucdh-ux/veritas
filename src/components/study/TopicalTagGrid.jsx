import { Tag } from "lucide-react";

export default function TopicalTagGrid({ tags, selectedTag, loading, onSelect, title }) {
  return (
    <div>
      <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3" style={{ color: "rgb(var(--ink) / 0.3)" }}>{title}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <button
            type="button"
            key={tag}
            onClick={() => onSelect(tag)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-inter capitalize transition-all"
            style={{
              background: selectedTag === tag ? "rgba(167,139,250,0.18)" : "rgb(var(--ink) / 0.05)",
              color: selectedTag === tag ? "#a78bfa" : "rgb(var(--ink) / 0.55)",
              border: selectedTag === tag ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgb(var(--ink) / 0.07)",
            }}
          >
            <Tag className="w-2.5 h-2.5" /> {tag}
          </button>
        ))}
      </div>
    </div>
  );
}