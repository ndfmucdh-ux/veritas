import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VirtualAssistant from "./VirtualAssistant";
import VeritasLogo from "@/components/ui/VeritasLogo";

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
        <motion.div
          animate={{ scale: open ? 0.88 : 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className="rounded-xl overflow-hidden"
          style={{ boxShadow: "0 0 14px rgba(251,191,36,0.3)" }}
        >
          <VeritasLogo size={36} />
        </motion.div>

        {/* Pulse ring */}
        {!open && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{ scale: [1, 1.28, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ border: "1.5px solid rgba(251,191,36,0.45)" }}
          />
        )}
      </motion.button>
    </>
  );
}