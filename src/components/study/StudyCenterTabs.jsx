import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

const TABS = [
  { id: "analysis", label: "Analysis", icon: "📖" },
  { id: "sidebyside", label: "Side by Side", icon: "⚡" },
  { id: "templates", label: "My Templates", icon: "📝" },
  { id: "memorize", label: "Memorize", icon: "🎯" },
  { id: "flashcards", label: "Flashcards", icon: "🃏" },
  { id: "notes", label: "My Notes", icon: "📓" },
  { id: "journey", label: "Journey", icon: "🗺️" },
];

export default function StudyCenterTabs({ activeTab, onTabChange, showCrossRef, onToggleCrossRef }) {
  return (
    <div className="flex gap-2">
      {TABS.map(tab => (
        <motion.button
          type="button"
          key={tab.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTabChange(tab.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-cinzel text-xs font-semibold transition-all"
          style={{
            background: activeTab === tab.id ? "rgba(0,245,255,0.12)" : "rgb(var(--ink) / 0.04)",
            color: activeTab === tab.id ? "#00f5ff" : "rgb(var(--ink) / 0.4)",
            border: activeTab === tab.id ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgb(var(--ink) / 0.07)",
          }}
        >
          <span>{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </motion.button>
      ))}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={onToggleCrossRef}
        className="px-3 py-3 rounded-xl font-cinzel text-xs font-semibold transition-all"
        style={{
          background: showCrossRef ? "rgba(124,58,237,0.12)" : "rgb(var(--ink) / 0.04)",
          color: showCrossRef ? "#7c3aed" : "rgb(var(--ink) / 0.4)",
          border: showCrossRef ? "1px solid rgba(124,58,237,0.25)" : "1px solid rgb(var(--ink) / 0.07)",
        }}
        title="Related Verses Panel"
      >
        <Lightbulb className="w-4 h-4" />
      </motion.button>
    </div>
  );
}