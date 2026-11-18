import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function MoreSheet({ open, onClose, items, pathname, title }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(30,25,15,0.4)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog" aria-label={title}
            className="fixed left-0 right-0 bottom-0 z-[61] rounded-t-3xl px-4 pt-4"
            style={{ background: "hsl(var(--card))", borderTop: "1px solid var(--hairline)", paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="font-cinzel text-xl font-semibold text-foreground">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--fill-2)" }}>
                <X className="w-5 h-5" style={{ color: "rgb(var(--ink) / 0.7)" }} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2.5 max-h-[60vh] overflow-y-auto">
              {items.map(({ path, icon: Icon, label }) => {
                const active = pathname === path;
                return (
                  <Link key={path} to={path} onClick={onClose}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl px-2 py-4 min-h-[88px] text-center"
                    style={{ background: active ? "hsl(var(--primary) / 0.14)" : "var(--fill-1)", border: "1px solid var(--hairline)" }}>
                    <Icon className="w-6 h-6" style={{ color: active ? "var(--t-green)" : "var(--t-gold)" }} strokeWidth={1.6} />
                    <span className="font-cinzel text-sm font-semibold text-foreground leading-tight break-words">{label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}