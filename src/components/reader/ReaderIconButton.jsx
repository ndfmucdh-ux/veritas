import { motion } from "framer-motion";

export default function ReaderIconButton({ children, onClick, active, title }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={title}
      aria-pressed={active === undefined ? undefined : active}
      title={title}
      className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-cyan/70"
      style={{
        background: active ? "rgba(0,245,255,0.1)" : "rgb(var(--ink) / 0.05)",
        color: active ? "#00f5ff" : "rgb(var(--ink) / 0.4)",
        border: active ? "1px solid rgba(0,245,255,0.2)" : "1px solid transparent",
      }}
    >
      {children}
    </motion.button>
  );
}