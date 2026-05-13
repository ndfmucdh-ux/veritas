import { useState } from "react";
import { Mail, MousePointerClick, TrendingUp, Send, Eye, Clock, ChevronRight, Flame } from "lucide-react";
import { motion } from "framer-motion";

// Simulated email engagement stats — in a real setup these would come from an email provider webhook
const EMAIL_TYPES = [
  {
    id: "votd",
    label: "Verse of the Day",
    icon: "📖",
    color: "#c9a84c",
    sent: 42,
    opened: 35,
    clicked: 18,
    lastSent: "Today, 7:00 AM",
  },
  {
    id: "reading",
    label: "Reading Reminder",
    icon: "🔔",
    color: "#00F5FF",
    sent: 28,
    opened: 19,
    clicked: 12,
    lastSent: "Today, 9:00 AM",
  },
  {
    id: "devotional",
    label: "Devotional Plan",
    icon: "📚",
    color: "#a78bfa",
    sent: 21,
    opened: 16,
    clicked: 9,
    lastSent: "Yesterday, 7:00 PM",
  },
  {
    id: "prayer",
    label: "Prayer Journal",
    icon: "🙏",
    color: "#f472b6",
    sent: 14,
    opened: 10,
    clicked: 6,
    lastSent: "Yesterday, 8:00 PM",
  },
  {
    id: "milestone",
    label: "Streak Milestones",
    icon: "🔥",
    color: "#f97316",
    sent: 7,
    opened: 7,
    clicked: 5,
    lastSent: "3 days ago",
  },
  {
    id: "weekly",
    label: "Weekly Report",
    icon: "📊",
    color: "#34d399",
    sent: 6,
    opened: 4,
    clicked: 2,
    lastSent: "Last Monday",
  },
];

function StatPill({ label, value, color, icon: StatIcon }) {
  const Icon = StatIcon;
  return (
    <div className="rounded-2xl p-4 text-center flex-1"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <Icon className="w-4 h-4 mx-auto mb-2" style={{ color }} />
      <p className="font-cinzel text-xl font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] font-inter mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
    </div>
  );
}

function RateBar({ label, rate, color }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
        <span className="font-cinzel text-xs font-bold" style={{ color }}>{rate}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${rate}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

export default function EmailEngagementDashboard() {
  const [selected, setSelected] = useState(null);

  const totalSent    = EMAIL_TYPES.reduce((s, e) => s + e.sent, 0);
  const totalOpened  = EMAIL_TYPES.reduce((s, e) => s + e.opened, 0);
  const totalClicked = EMAIL_TYPES.reduce((s, e) => s + e.clicked, 0);
  const avgOpenRate  = Math.round((totalOpened / totalSent) * 100);
  const avgCTR       = Math.round((totalClicked / totalSent) * 100);

  const sel = selected ? EMAIL_TYPES.find(e => e.id === selected) : null;

  return (
    <div className="space-y-4">
      {/* Summary pills */}
      <div className="flex gap-3">
        <StatPill label="Emails Sent" value={totalSent} color="#c9a84c" icon={Send} />
        <StatPill label="Avg Open Rate" value={`${avgOpenRate}%`} color="#00F5FF" icon={Eye} />
        <StatPill label="Avg Click-Through" value={`${avgCTR}%`} color="#a78bfa" icon={MousePointerClick} />
      </div>

      {/* Overall rates */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="font-cinzel text-[10px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>Overall Performance</p>
        <RateBar label="Open Rate" rate={avgOpenRate} color="#c9a84c" />
        <RateBar label="Click-Through Rate" rate={avgCTR} color="#00F5FF" />
        <RateBar label="Engagement Score" rate={Math.round((avgOpenRate + avgCTR) / 2)} color="#a78bfa" />
      </div>

      {/* Per-type breakdown */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="font-cinzel text-[10px] uppercase tracking-widest px-4 pt-4 pb-2" style={{ color: "rgba(255,255,255,0.25)" }}>By Email Type</p>
        {EMAIL_TYPES.map((e, i) => {
          const openRate = Math.round((e.opened / e.sent) * 100);
          const ctr      = Math.round((e.clicked / e.sent) * 100);
          const isOpen   = selected === e.id;
          return (
            <div key={e.id}>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none", background: isOpen ? "rgba(255,255,255,0.04)" : "transparent" }}
                onClick={() => setSelected(isOpen ? null : e.id)}
              >
                <span className="text-base">{e.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{e.label}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-cinzel text-[10px]" style={{ color: e.color }}>
                      <Eye className="w-2.5 h-2.5 inline mr-0.5" />{openRate}%
                    </span>
                    <span className="font-cinzel text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                      <MousePointerClick className="w-2.5 h-2.5 inline mr-0.5" />{ctr}%
                    </span>
                    <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                      <Clock className="w-2.5 h-2.5 inline mr-0.5" />{e.lastSent}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 transition-transform flex-shrink-0"
                  style={{ color: "rgba(255,255,255,0.2)", transform: isOpen ? "rotate(90deg)" : "none" }} />
              </button>

              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
                    {[
                      { l: "Sent", v: e.sent, c: "rgba(255,255,255,0.5)" },
                      { l: "Opened", v: e.opened, c: e.color },
                      { l: "Clicked", v: e.clicked, c: "#a78bfa" },
                    ].map(s => (
                      <div key={s.l} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <p className="font-cinzel text-lg font-bold" style={{ color: s.c }}>{s.v}</p>
                        <p className="font-inter text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <RateBar label="Open Rate" rate={openRate} color={e.color} />
                  <RateBar label="Click-Through Rate" rate={ctr} color="#a78bfa" />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>
        * Stats are illustrative. Live tracking requires an ESP webhook integration.
      </p>
    </div>
  );
}