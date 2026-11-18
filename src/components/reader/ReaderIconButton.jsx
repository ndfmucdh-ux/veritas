import { motion } from "framer-motion";

export default function ReaderIconButton({ children, onClick, active, title }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={title}
      aria-pressed={active === undefined ? undefined : active}
      title={title}
      className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
        active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </motion.button>
  );
}