export default function StudyTabs({ tabs, labels, activeTab, onChange }) {
  return (
    <div className="flex gap-1 px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
      {tabs.map(tab => (
        <button
          type="button"
          key={tab}
          onClick={() => onChange(tab)}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-cinzel uppercase tracking-wide transition-all"
          style={{
            background: activeTab === tab ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.04)",
            color: activeTab === tab ? "#00f5ff" : "rgba(255,255,255,0.4)",
            border: activeTab === tab ? "1px solid rgba(0,245,255,0.28)" : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {labels[tab]}
        </button>
      ))}
    </div>
  );
}