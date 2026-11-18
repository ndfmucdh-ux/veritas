export default function SourceFilterTabs({ tabs, activeSource, onChange, results, totalResults }) {
  const getCount = (id) => {
    if (id === "all") return totalResults;
    if (id === "bible") return results.bible.length;
    if (id === "notes") return results.notes.length;
    return results.prayers.length;
  };

  return (
    <div className="flex gap-1.5 mb-5 overflow-x-auto scrollbar-hide">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const count = getCount(tab.id);
        const active = activeSource === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-cinzel whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              background: active ? "rgba(0,245,255,0.1)" : "rgb(var(--ink) / 0.04)",
              color: active ? "#00f5ff" : "rgb(var(--ink) / 0.4)",
              border: active ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgb(var(--ink) / 0.07)",
            }}
          >
            <Icon className="w-3 h-3" />
            {tab.label}
            <span
              className="px-1.5 py-0.5 rounded-full text-[9px]"
              style={{ background: active ? "rgba(0,245,255,0.2)" : "rgb(var(--ink) / 0.08)", color: active ? "#00f5ff" : "rgb(var(--ink) / 0.4)" }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}