import { Tag } from "lucide-react";

export default function TagFilterBar({ tags, activeTag, onSelect }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-inter transition-all"
        style={{
          background: !activeTag ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)",
          color: !activeTag ? "#00f5ff" : "rgba(255,255,255,0.4)",
          border: !activeTag ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.07)"
        }}
      >
        All
      </button>
      {tags.map(tag => (
        <button
          type="button"
          key={tag}
          onClick={() => onSelect(tag === activeTag ? null : tag)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-inter transition-all"
          style={{
            background: activeTag === tag ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)",
            color: activeTag === tag ? "#00f5ff" : "rgba(255,255,255,0.4)",
            border: activeTag === tag ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.07)"
          }}
        >
          <Tag className="w-3 h-3" />
          {tag}
        </button>
      ))}
    </div>
  );
}