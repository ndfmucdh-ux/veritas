import { BookOpen, Bell, BookMarked, HeartHandshake, Flame, BarChart2, Mail, Info } from "lucide-react";
import { motion } from "framer-motion";

// The email types this app can actually send (backed by real backend functions).
const EMAIL_TYPES = [
  { id: "votd",       label: "Verse of the Day",  Icon: BookOpen,       color: "#c9a84c", fn: "sendVOTDNotification" },
  { id: "reading",    label: "Reading Reminder",  Icon: Bell,           color: "#00F5FF", fn: "sendReadingReminder" },
  { id: "devotional", label: "Devotional Plan",   Icon: BookMarked,     color: "#a78bfa", fn: "sendDevotionalReminder" },
  { id: "prayer",     label: "Prayer Journal",    Icon: HeartHandshake, color: "#f472b6", fn: "sendPrayerReminder" },
  { id: "milestone",  label: "Milestones",        Icon: Flame,          color: "#f97316", fn: "sendMilestoneEmail" },
  { id: "weekly",     label: "Weekly Report",     Icon: BarChart2,      color: "#34d399", fn: "weeklyEmailReport" },
];

export default function EmailEngagementDashboard() {
  return (
    <div className="space-y-4">
      {/* Info notice — honest about what is tracked */}
      <div className="rounded-2xl p-4 flex gap-3"
        style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.15)" }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#00f5ff" }} />
        <div>
          <p className="font-cinzel text-xs font-semibold mb-1" style={{ color: "#00f5ff" }}>
            Engagement tracking not yet available
          </p>
          <p className="font-inter text-[11px] leading-relaxed" style={{ color: "rgb(var(--ink) / 0.45)" }}>
            Open and click-through rates require an email provider webhook integration. Until that's connected,
            no engagement metrics are recorded. Below are the email types your app can send.
          </p>
        </div>
      </div>

      {/* Email types this app sends */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <Mail className="w-3.5 h-3.5" style={{ color: "rgb(var(--ink) / 0.4)" }} />
          <p className="font-cinzel text-[9px] uppercase tracking-widest" style={{ color: "rgb(var(--ink) / 0.3)" }}>
            Available Email Types
          </p>
        </div>
        {EMAIL_TYPES.map((e, i) => {
          const { Icon } = e;
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderTop: i > 0 ? "1px solid rgb(var(--ink) / 0.05)" : "none" }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${e.color}15`, border: `1px solid ${e.color}30` }}>
                <Icon className="w-4 h-4" style={{ color: e.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm" style={{ color: "rgb(var(--ink) / 0.75)" }}>{e.label}</p>
                <p className="font-inter text-[10px] mt-0.5" style={{ color: "rgb(var(--ink) / 0.25)" }}>{e.fn}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}