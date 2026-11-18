import { BookOpen, BookMarked, TrendingUp, BarChart3, Mail, Shield } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

const ALL_TABS = ["overview", "library", "insights", "stats", "emails", "settings"];
const TAB_LABELS = { overview: "s5TabOverview", library: "s5TabLibrary", insights: "s5TabInsights", stats: "s5TabReading", emails: "s5TabEmails", settings: "s5TabSettings" };
const TAB_ICONS = { overview: BookOpen, library: BookMarked, insights: TrendingUp, stats: BarChart3, emails: Mail, settings: Shield };

export default function ProfileTabBar({ activeTab, onTabChange, isAdmin = false }) {
  const { t } = useLang();
  const tabs = ALL_TABS.filter((tab) => tab !== "emails" || isAdmin);

  return (
    <div className="grid grid-cols-3 gap-2 px-5 mb-5" role="tablist">
      {tabs.map((tab) => {
        const Icon = TAB_ICONS[tab];
        const active = activeTab === tab;
        return (
          <button key={tab} type="button" role="tab" aria-selected={active} onClick={() => onTabChange(tab)}
            className="min-w-0 flex items-center justify-center gap-2 px-2 min-h-11 rounded-xl text-xs font-cinzel font-semibold transition-all"
            style={{
              background: active ? "hsl(var(--primary) / 0.16)" : "hsl(var(--card))",
              color: active ? "hsl(var(--primary))" : "rgb(var(--ink) / 0.75)",
              border: active ? "1px solid hsl(var(--primary) / 0.5)" : "1px solid var(--hairline)",
            }}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{t[TAB_LABELS[tab]]}</span>
          </button>
        );
      })}
    </div>
  );
}