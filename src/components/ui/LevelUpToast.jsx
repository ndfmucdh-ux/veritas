import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Full-screen level-up celebration overlay.
 * Call with show=true + level name to trigger.
 */
export default function LevelUpToast({ show, level, icon, color, onDone }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onDone, 3200);
      return () => clearTimeout(t);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)" }}
        >
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            {/* Ring burst */}
            <div className="relative flex items-center justify-center">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border"
                  style={{ borderColor: `${color}40` }}
                  initial={{ width: 80, height: 80, opacity: 0.8 }}
                  animate={{ width: 80 + i * 50, height: 80 + i * 50, opacity: 0 }}
                  transition={{ duration: 1.2, delay: i * 0.15, ease: "easeOut" }}
                />
              ))}
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl z-10"
                style={{
                  background: `radial-gradient(circle, ${color}30, ${color}10)`,
                  border: `2px solid ${color}60`,
                  boxShadow: `0 0 40px ${color}50`,
                }}
                animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {icon}
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-white/60 font-inter uppercase tracking-widest mb-1">Level Up!</p>
              <p className="font-cinzel text-3xl font-bold" style={{ color }}>
                {level}
              </p>
              <p className="text-white/50 text-sm mt-1 font-inter">You've reached a new level</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}