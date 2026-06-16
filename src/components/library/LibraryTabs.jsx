import { Bookmark, BookMarked, Clock, Folder, Headphones, Highlighter, StickyNote } from "lucide-react";

const TABS = [
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { id: "highlights", label: "Highlights", icon: Highlighter },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "collections", label: "Collections", icon: BookMarked },
  { id: "history", label: "History", icon: Clock },
  { id: "folders", label: "Folders", icon: Folder },
  { id: "audio", label: "Audio", icon: Headphones },
];

export default function LibraryTabs({ activeTab, onChange }) {
  return (
    <div className="flex gap-2 mb-6 glass rounded-xl p-1">
      {TABS.map(({ id, label, icon: TabIcon }) => (
        <button
          type="button"
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all ${
            activeTab === id ? "bg-cyan/20 text-cyan font-medium" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <TabIcon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}