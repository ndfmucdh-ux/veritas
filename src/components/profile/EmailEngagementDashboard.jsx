import { useState } from "react";
import { Send, Eye, MousePointerClick, Clock, ChevronRight, BookOpen, Bell, BookMarked, HeartHandshake, Flame, BarChart2, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell } from "recharts";

const EMAIL_TYPES = [
  { id: "votd",       label: "Verse of the Day",   Icon: BookOpen,      color: "#c9a84c", sent: 42, opened: 35, clicked: 18, lastSent: "Today, 7:00 AM" },
  { id: "reading",    label: "Reading Reminder",   Icon: Bell,          color: "#00F5FF", sent: 28, opened: 19, clicked: 12, lastSent: "Today, 9:00 AM" },
  { id: "devotional", label: "Devotional Plan",    Icon: BookMarked,    color: "#a78bfa", sent: 21, opened: 16, clicked: 9,  lastSent: "Yesterday, 7:00 PM" },
  { id: "prayer",     label: "Prayer Journal",     Icon: HeartHandshake,color: "#f472b6", sent: 14, opened: 10, clicked: 6,  lastSent: "Yesterday, 8:00 PM" },
  { id: "milestone",  label: "Streak Milestones",  Icon: Flame,         color: "#f97316", sent: 7,  opened: 7,  clicked: 5,  lastSent: "3 days ago" },
  { id: "weekly",     label: "Weekly Report",      Icon: BarChart2,     color: "#34d399", sent: 6,  opened: 4,  clicked: 2,  lastSent: "Last Monday" },
];

function RateBar({ label, rate, color }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
        <span className="font-cinzel text-xs font-bold" style={{ color }}>{rate}%</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${rate}%` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "rgba(15,13,10,0.95)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10, padding: "8px 14px" }}>
        <p className="font-cinzel text-xs" style={{ color: payload[0].payload.color }}>{payload[0].payload.label}</p>
        <p className="font-inter text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Open {payload[0].payload.openRate}% · CTR {payload[0].payload.ctr}%</p>
      </div>
    );
  }
  return null;
};

export default function EmailEngagementDashboard() {
  const [selected, setSelected] = useState(null);

  const totalSent    = EMAIL_TYPES.reduce((s, e) => s + e.sent, 0);
  const totalOpened  = EMAIL_TYPES.reduce((s, e) => s + e.opened, 0);
  const totalClicked = EMAIL_TYPES.reduce((s, e) => s + e.clicked, 0);
  const avgOpenRate  = Math.round((totalOpened / totalSent) * 100);
  const avgCTR       = Math.round((totalClicked / totalSent) * 100);
  const engScore     = Math.round((avgOpenRate + avgCTR) / 2);

  // Data for bar chart
  const barData = EMAIL_TYPES.map(e => ({
    label: e.label.split(" ")[0],
    openRate: Math.round((e.opened / e.sent) * 100),
    ctr: Math.round((e.clicked / e.sent) * 100),
    color: e.color,
  }));

  // Radial chart data
  const radialData = [
    { name: "Engagement", value: engScore, fill: "#c9a84c" },
    { name: "Open Rate",  value: avgOpenRate, fill: "#00F5FF" },
    { name: "CTR",        value: avgCTR, fill: "#a78bfa" },
  ];

  return (
    <div className="space-y-4">

      {/* Top KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Sent", value: totalSent,         color: "rgba(255,255,255,0.5)", Icon: Send },
          { label: "Open Rate",  value: `${avgOpenRate}%`, color: "#00F5FF",          Icon: Eye },
          { label: "Click-Through", value: `${avgCTR}%`,   color: "#a78bfa",          Icon: MousePointerClick },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="rounded-2xl p-3 text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Icon className="w-3.5 h-3.5 mx-auto mb-1.5" style={{ color }} />
            <p className="font-cinzel text-lg font-bold leading-none" style={{ color }}>{value}</p>
            <p className="text-[9px] font-inter mt-1" style={{ color: "rgba(255,255,255,0.28)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Radial gauge + overall bars */}
      <div className="rounded-2xl p-4 flex gap-4 items-center"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ width: 100, height: 100, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="55%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "rgba(255,255,255,0.04)" }} />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-cinzel text-[9px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>Overall Performance</p>
          <RateBar label="Open Rate" rate={avgOpenRate} color="#00F5FF" />
          <RateBar label="Click-Through" rate={avgCTR} color="#a78bfa" />
          <RateBar label="Engagement Score" rate={engScore} color="#c9a84c" />
        </div>
      </div>

      {/* Bar chart — opens vs CTR by type */}
      <div className="rounded-2xl p-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="font-cinzel text-[9px] uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.25)" }}>Open Rate by Email Type</p>
        <div style={{ height: 110 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} barSize={14}>
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontFamily: "Cinzel" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.2)" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="openRate" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.75} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-type expandable list */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="font-cinzel text-[9px] uppercase tracking-widest px-4 pt-4 pb-2" style={{ color: "rgba(255,255,255,0.25)" }}>By Email Type</p>
        {EMAIL_TYPES.map((e, i) => {
          const openRate = Math.round((e.opened / e.sent) * 100);
          const ctr      = Math.round((e.clicked / e.sent) * 100);
          const isOpen   = selected === e.id;
          const { Icon } = e;
          return (
            <div key={e.id}>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                style={{
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background: isOpen ? "rgba(255,255,255,0.04)" : "transparent",
                }}
                onClick={() => setSelected(isOpen ? null : e.id)}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${e.color}15`, border: `1px solid ${e.color}30` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: e.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{e.label}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-cinzel text-[10px]" style={{ color: e.color }}>
                      <Eye className="w-2.5 h-2.5 inline mr-0.5" />{openRate}%
                    </span>
                    <span className="font-cinzel text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                      <MousePointerClick className="w-2.5 h-2.5 inline mr-0.5" />{ctr}%
                    </span>
                    <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>
                      <Clock className="w-2.5 h-2.5 inline mr-0.5" />{e.lastSent}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 transition-transform flex-shrink-0"
                  style={{ color: "rgba(255,255,255,0.2)", transform: isOpen ? "rotate(90deg)" : "none" }} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key="detail"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="px-4 pb-4 overflow-hidden"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
                      {[
                        { l: "Sent",    v: e.sent,    c: "rgba(255,255,255,0.45)" },
                        { l: "Opened",  v: e.opened,  c: e.color },
                        { l: "Clicked", v: e.clicked, c: "#a78bfa" },
                      ].map(s => (
                        <div key={s.l} className="rounded-xl p-3 text-center"
                          style={{ background: "rgba(255,255,255,0.04)" }}>
                          <p className="font-cinzel text-lg font-bold" style={{ color: s.c }}>{s.v}</p>
                          <p className="font-inter text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{s.l}</p>
                        </div>
                      ))}
                    </div>
                    <RateBar label="Open Rate" rate={openRate} color={e.color} />
                    <RateBar label="Click-Through Rate" rate={ctr} color="#a78bfa" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="text-center font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.15)" }}>
        Stats are illustrative. Live tracking requires an ESP webhook integration.
      </p>
    </div>
  );
}