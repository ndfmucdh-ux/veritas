import { Plus, MessageSquare } from "lucide-react";

function getDateLabel(value) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function groupConversations(conversations) {
  return conversations.reduce((acc, conversation) => {
    const dateLabel = getDateLabel(conversation.conversation_date || conversation.created_date);
    const semanticGroup = conversation.semantic_group || "Daily Reflection";
    acc[dateLabel] ||= {};
    acc[dateLabel][semanticGroup] ||= [];
    acc[dateLabel][semanticGroup].push(conversation);
    return acc;
  }, {});
}

export default function ConversationHistoryPanel({ conversations, activeId, onSelect, onNew }) {
  const grouped = groupConversations(conversations || []);

  return (
    <aside className="w-40 md:w-48 flex-shrink-0 border-r overflow-y-auto scrollbar-hide"
      style={{ borderColor: "rgb(var(--ink) / 0.07)", background: "var(--fill-1)" }}>
      <div className="p-3 sticky top-0 z-10" style={{ background: "var(--popover-surface)" }}>
        <button onClick={onNew}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-cinzel"
          style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.24)" }}>
          <Plus className="w-3 h-3" /> New
        </button>
      </div>

      <div className="px-3 pb-3 space-y-4">
        {Object.keys(grouped).length === 0 && (
          <div className="rounded-xl p-3 text-center" style={{ background: "var(--fill-1)" }}>
            <MessageSquare className="w-4 h-4 mx-auto mb-2" style={{ color: "rgb(var(--ink) / 0.25)" }} />
            <p className="text-[10px] font-inter" style={{ color: "rgb(var(--ink) / 0.35)" }}>No saved conversations yet</p>
          </div>
        )}

        {Object.entries(grouped).map(([dateLabel, semanticGroups]) => (
          <section key={dateLabel} className="space-y-2">
            <p className="text-[9px] font-cinzel uppercase tracking-widest" style={{ color: "rgb(var(--ink) / 0.25)" }}>{dateLabel}</p>
            {Object.entries(semanticGroups).map(([semanticGroup, items]) => (
              <div key={semanticGroup} className="space-y-1.5">
                <p className="text-[10px] font-inter" style={{ color: "#fbbf24" }}>{semanticGroup}</p>
                {items.map(conversation => (
                  <button key={conversation.id} onClick={() => onSelect(conversation)}
                    className="w-full rounded-xl px-2.5 py-2 text-left transition-colors"
                    style={{
                      background: activeId === conversation.id ? "rgba(0,245,255,0.1)" : "rgb(var(--ink) / 0.035)",
                      border: activeId === conversation.id ? "1px solid rgba(0,245,255,0.22)" : "1px solid rgb(var(--ink) / 0.055)",
                    }}>
                    <p className="text-[11px] font-inter leading-snug line-clamp-2" style={{ color: "rgb(var(--ink) / 0.78)" }}>{conversation.title}</p>
                    <p className="text-[9px] font-inter mt-1" style={{ color: "rgb(var(--ink) / 0.28)" }}>
                      {new Date(conversation.last_message_at || conversation.created_date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </button>
                ))}
              </div>
            ))}
          </section>
        ))}
      </div>
    </aside>
  );
}