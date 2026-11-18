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
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setOpen(true)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="assistant-fab fixed right-4 w-12 h-12 min-[1101px]:w-14 min-[1101px]:h-14 rounded-2xl flex items-center justify-center z-50"
            style={{
              background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(167,139,250,0.1))",
              border: "1.5px solid rgba(251,191,36,0.35)",
              boxShadow: "0 8px 32px rgba(251,191,36,0.25), 0 0 0 1px rgba(251,191,36,0.1)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <VeritasLogo size={56} className="w-full h-full" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{ scale: [1, 1.28, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ border: "1.5px solid rgba(251,191,36,0.45)" }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}