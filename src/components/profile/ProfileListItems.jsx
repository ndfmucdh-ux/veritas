import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export function Section({ label, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
        <p className="text-[10px] font-cinzel uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
      </div>
      {children}
    </div>
  );
}

export function LibraryRow({ verseRef, sub, href, color }) {
  return (
    <a href={href} className="flex items-center gap-3 py-2.5 border-b transition-colors hover:opacity-80" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <p className="font-cinzel text-sm text-white truncate">{verseRef}</p>
        <p className="text-[10px] font-inter capitalize" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />
    </a>
  );
}

export function ToggleRow({ icon: Icon, label, value, onChange, color }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
      <p className="flex-1 text-sm font-inter" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</p>
      <motion.button onClick={onChange}
        className="w-11 h-6 rounded-full relative flex items-center px-1"
        style={{ background: value ? "rgba(0,245,255,0.25)" : "rgba(255,255,255,0.08)" }}>
        <motion.span animate={{ x: value ? 18 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </motion.button>
    </div>
  );
}

export function SettingLink({ icon: Icon, label, sub, color, tag }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.75)" }}>{label}</p>
        {sub && <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>}
      </div>
      {tag
        ? <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>{tag}</span>
        : <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} />
      }
    </div>
  );
}

export function NotifTimeRow({ label, settingKey, defaultTime }) {
  const [time, setTime] = useState(() => localStorage.getItem(`veritas_notif_${settingKey}`) || defaultTime);
  const handleChange = (e) => {
    setTime(e.target.value);
    localStorage.setItem(`veritas_notif_${settingKey}`, e.target.value);
  };
  return (
    <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <p className="flex-1 text-sm font-inter" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</p>
      <input
        type="time"
        value={time}
        onChange={handleChange}
        className="text-xs font-cinzel px-3 py-1.5 rounded-xl focus:outline-none"
        style={{ background: "rgba(0,245,255,0.07)", border: "1px solid rgba(0,245,255,0.2)", color: "#00f5ff" }}
      />
    </div>
  );
}

export function EmptyMsg({ icon, text }) {
  return (
    <div className="flex items-center gap-2 py-4" style={{ color: "rgba(255,255,255,0.25)" }}>
      <span className="text-lg">{icon}</span>
      <p className="text-sm font-inter">{text}</p>
    </div>
  );
}

export function SeeAll({ to }) {
  return (
    <a href={to} className="flex items-center gap-1 text-xs font-cinzel mt-2" style={{ color: "#00f5ff" }}>
      See all <ChevronRight className="w-3 h-3" />
    </a>
  );
}