import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VirtualAssistant from "./VirtualAssistant";

export default function AssistantButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {open && <VirtualAssistant onClose={() => setOpen(false)} />}
      </AnimatePresence>

      {/* Backdrop when open on mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-6 w-14 h-14 rounded-2xl flex items-center justify-center z-50"
        style={{
          background: open
            ? "linear-gradient(135deg, rgba(251,191,36,0.3), rgba(167,139,250,0.2))"
            : "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(167,139,250,0.1))",
          border: "1.5px solid rgba(251,191,36,0.35)",
          boxShadow: "0 8px 32px rgba(251,191,36,0.25), 0 0 0 1px rgba(251,191,36,0.1)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <motion.span
          animate={{ rotate: open ? 15 : 0, scale: open ? 0.85 : 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className="text-2xl select-none"
        >
          ✝️
        </motion.span>

        {/* Pulse ring */}
        {!open && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ border: "1.5px solid rgba(251,191,36,0.4)" }}
          />
        )}
      </motion.button>
    </>
  );
}