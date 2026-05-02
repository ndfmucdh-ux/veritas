import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus, Highlighter, StickyNote, Bookmark, X } from "lucide-react";
import { Link } from "react-router-dom";

const ACTIONS = [
  { icon: Highlighter, label: "Highlight", color: "#FFD700", path: "/read" },
  { icon: StickyNote,  label: "Note",      color: "#00f5ff", path: "/library" },
  { icon: Bookmark,    label: "Bookmark",  color: "#a78bfa", path: "/library" },
];

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const shouldReduce = useReducedMotion();

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 flex flex-col items-end gap-3">
      {/* Sub-actions */}
      <AnimatePresence>
        {open && ACTIONS.map(({ icon: Icon, label, color, path }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 12 }}
            transition={{
              type: "spring", stiffness: 380, damping: 22,
              delay: shouldReduce ? 0 : (ACTIONS.length - 1 - i) * 0.06,
            }}
            className="flex items-center gap-2"
          >
            <span className="text-xs font-inter px-2.5 py-1 rounded-full"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {label}
            </span>
            <Link to={path} onClick={() => setOpen(false)}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.08 }}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{
                  background: `${color}18`,
                  border: `1px solid ${color}35`,
                  boxShadow: `0 4px 20px ${color}25`,
                }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileTap={shouldReduce ? {} : { scale: 0.88 }}
        whileHover={shouldReduce ? {} : { scale: 1.06 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        onClick={() => setOpen(v => !v)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: open
            ? "rgba(255,255,255,0.1)"
            : "linear-gradient(135deg, rgba(0,245,255,0.9), rgba(0,180,255,0.8))",
          boxShadow: open
            ? "0 4px 24px rgba(0,0,0,0.3)"
            : "0 4px 28px rgba(0,245,255,0.4), 0 0 0 1px rgba(0,245,255,0.2)",
          border: open ? "1px solid rgba(255,255,255,0.12)" : "none",
        }}
      >
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          {open
            ? <X className="w-6 h-6" style={{ color: "rgba(255,255,255,0.7)" }} />
            : <Plus className="w-6 h-6" style={{ color: "#0a0f1e" }} strokeWidth={2.5} />
          }
        </motion.div>
      </motion.button>
    </div>
  );
}