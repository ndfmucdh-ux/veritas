import { motion } from "framer-motion";

const DEPTHS = [
  { id: "overview", label: "Overview", icon: "📄" },
  { id: "detailed", label: "Detailed", icon: "📖" },
  { id: "advanced", label: "Advanced", icon: "🎓" },
];

export default function StudyDepthSelector({ depth, onChange }) {
  return (
    <div className="flex gap-2">
      {DEPTHS.map(d => (
        <motion.button
          type="button"
          key={d.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(d.id)}
          className="flex-1 py-4 rounded-xl text-sm font-cinzel transition-all font-semibold"
          style={{
            background: depth === d.id ? "rgba(0,245,255,0.15)" : "rgb(var(--ink) / 0.05)",
            color: depth === d.id ? "#00f5ff" : "rgb(var(--ink) / 0.4)",
            border: depth === d.id ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent",
          }}
        >
          {d.icon} {d.label}
        </motion.button>
      ))}
    </div>
  );
}