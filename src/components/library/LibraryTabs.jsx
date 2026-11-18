import { Bookmark, BookMarked, Clock, Folder, Headphones, Highlighter, StickyNote } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

const TABS = [
  { id: "bookmarks", key: "tabBookmarks", icon: Bookmark },
  { id: "highlights", key: "tabHighlights", icon: Highlighter },
  { id: "notes", key: "tabNotes", icon: StickyNote },
  { id: "collections", key: "tabCollections", icon: BookMarked },
  { id: "history", key: "tabHistory", icon: Clock },
  { id: "folders", key: "tabFolders", icon: Folder },
  { id: "audio", key: "tabAudio", icon: Headphones },
];

export default function LibraryTabs({ activeTab, onChange }) {
  const { t } = useLang();
  return (
    <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto scrollbar-hide">
      {TABS.map(({ id, key, icon: TabIcon }) => (
        <button
          type="button"
          key={id}
          onClick={() => onChange(id)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-sm font-cinzel font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <TabIcon className="w-4 h-4" />
          <span>{t[key]}</span>
        </button>
      ))}
    </div>
  );
}