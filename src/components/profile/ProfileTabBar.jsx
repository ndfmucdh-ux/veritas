import { BookOpen, BookMarked, TrendingUp, BarChart3, Mail, Shield } from "lucide-react";

const ALL_TABS = ["overview", "library", "insights", "stats", "emails", "settings"];
const TAB_LABELS = { overview: "Overview", library: "Library", insights: "Insights", stats: "Reading", emails: "Emails", settings: "Settings" };
const TAB_ICONS = { overview: BookOpen, library: BookMarked, insights: TrendingUp, stats: BarChart3, emails: Mail, settings: Shield };

export default function ProfileTabBar({ activeTab, onTabChange, isAdmin = false }) {
  const tabs = ALL_TABS.filter(tab => tab !== "emails" || isAdmin);

  return (
    <div className="flex gap-1.5 px-5 mb-5 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Profile sections">
      {tabs.map(tab => {
        const Icon = TAB_ICONS[tab];
        return (
          <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => onTabChange(tab)}
            className="flex-1 min-w-[4.25rem] flex flex-col items-center justify-center gap-1.5 py-3 px-1.5 rounded-xl text-[10px] font-cinzel uppercase tracking-wider transition-all min-h-14"
            style={{
              background: activeTab === tab ? "rgba(0,245,255,0.1)" : "rgb(var(--ink) / 0.03)",
              color: activeTab === tab ? "#00f5ff" : "rgb(var(--ink) / 0.35)",
              border: activeTab === tab ? "1px solid rgba(0,245,255,0.2)" : "1px solid rgb(var(--ink) / 0.06)",
            }}>
            <Icon className="w-5 h-5" />
            {TAB_LABELS[tab]}
          </button>
        );
      })}
    </div>
  );
}