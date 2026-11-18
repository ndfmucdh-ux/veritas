import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  angle: (i / 16) * 360,
  distance: 60 + Math.random() * 40,
  delay: Math.random() * 0.3,
}));

export default function LevelUpAnimation({ level, show, onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const t = setTimeout(() => { setVisible(false); onComplete?.(); }, 3800);
      return () => clearTimeout(t);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* Dark overlay */}
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />

          {/* Center burst */}
          <div className="relative flex items-center justify-center">
            {/* Outer glow ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0.7 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute w-24 h-24 rounded-full"
              style={{ background: `radial-gradient(circle, ${level?.color || "#fbbf24"}40, transparent)` }}
            />
            <motion.div
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.15 }}
              className="absolute w-24 h-24 rounded-full"
              style={{ border: `2px solid ${level?.color || "#fbbf24"}` }}
            />

            {/* Particles */}
            {PARTICLES.map(p => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                  y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.9, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
                className="absolute w-2 h-2 rounded-full"
                style={{ background: p.id % 3 === 0 ? "#fbbf24" : p.id % 3 === 1 ? level?.color || "#00f5ff" : "#ffffff" }}
              />
            ))}

            {/* Main card */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.1 }}
              className="relative flex flex-col items-center gap-3 px-10 py-8 rounded-3xl text-center"
              style={{
                background: `linear-gradient(135deg, ${level?.color || "#fbbf24"}15, var(--popover-surface))`,
                border: `1.5px solid ${level?.color || "#fbbf24"}45`,
                boxShadow: `0 0 60px ${level?.color || "#fbbf24"}25, 0 20px 60px rgba(0,0,0,0.6)`,
                minWidth: "240px",
              }}
            >
              {/* Level icon rotating */}
              <motion.div
                animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl"
              >
                {level?.icon || "⭐"}
              </motion.div>

              <div>
                <p className="text-[10px] font-cinzel uppercase tracking-widest mb-1"
                  style={{ color: "rgb(var(--ink) / 0.4)" }}>Level Up!</p>
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-cinzel text-2xl font-bold"
                  style={{ color: level?.color || "#fbbf24" }}
                >
                  {level?.name || "New Level"}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs font-inter mt-1"
                  style={{ color: "rgb(var(--ink) / 0.4)" }}
                >
                  You've reached {level?.minXP?.toLocaleString()} XP
                </motion.p>
              </div>

              {/* Shimmer bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "80%" }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="h-0.5 rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${level?.color || "#fbbf24"}, transparent)` }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}