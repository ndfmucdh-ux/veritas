import { Lightbulb, BookOpen, Columns2, FileText, Target, Layers, StickyNote, Map } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

const TABS = [
  { id: "analysis", key: "tabAnalysis", Icon: BookOpen },
  { id: "sidebyside", key: "tabSideBySide", Icon: Columns2 },
  { id: "templates", key: "tabTemplates", Icon: FileText },
  { id: "memorize", key: "tabMemorize", Icon: Target },
  { id: "flashcards", key: "tabFlashcards", Icon: Layers },
  { id: "notes", key: "tabMyNotes", Icon: StickyNote },
  { id: "journey", key: "tabJourney", Icon: Map },
];

export default function StudyCenterTabs({ activeTab, onTabChange, showCrossRef, onToggleCrossRef }) {
  const { t } = useLang();
  return (
    <div className="flex items-center gap-1 border-b border-border">
      <div className="flex-1 flex gap-1 overflow-x-auto scrollbar-hide">
        {TABS.map(({ id, key, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              type="button"
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-sm font-cinzel font-semibold border-b-2 -mb-px transition-colors ${
                active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t[key]}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onToggleCrossRef}
        aria-label="Related verses"
        title="Related verses"
        className={`flex-shrink-0 p-2 rounded-lg transition-colors ${showCrossRef ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground"}`}
      >
        <Lightbulb className="w-4 h-4" />
      </button>
    </div>
  );
}