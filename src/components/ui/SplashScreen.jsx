import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 700);
    }, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: "radial-gradient(ellipse at center, hsl(222,47%,9%) 0%, hsl(222,47%,4%) 100%)",
          }}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(251,191,36,0.07) 0%, transparent 70%)",
            }}
          />

          {/* Ring + Logo container */}
          <div className="relative flex items-center justify-center mb-10" style={{ width: 220, height: 220 }}>
            {/* Outer rotating ring */}
            <motion.svg
              className="absolute inset-0"
              width="220"
              height="220"
              viewBox="0 0 220 220"
              fill="none"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              <circle
                cx="110"
                cy="110"
                r="100"
                stroke="url(#goldRingGrad)"
                strokeWidth="2.5"
                strokeDasharray="628"
                strokeDashoffset="0"
                strokeLinecap="round"
                opacity="0.6"
              />
              <defs>
                <linearGradient id="goldRingGrad" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
                  <stop offset="40%" stopColor="#fbbf24" stopOpacity="1" />
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity="1" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </linearGradient>
              </defs>
            </motion.svg>

            {/* Inner counter-rotating subtle ring */}
            <motion.svg
              className="absolute inset-0"
              width="220"
              height="220"
              viewBox="0 0 220 220"
              fill="none"
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <circle
                cx="110"
                cy="110"
                r="88"
                stroke="rgba(251,191,36,0.15)"
                strokeWidth="1"
                strokeDasharray="8 14"
                strokeLinecap="round"
              />
            </motion.svg>

            {/* Glowing dot orbiting the ring */}
            <motion.div
              className="absolute"
              style={{ width: 220, height: 220, top: 0, left: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#fbbf24",
                  boxShadow: "0 0 12px 4px rgba(251,191,36,0.8), 0 0 24px 8px rgba(251,191,36,0.4)",
                }}
              />
            </motion.div>

            {/* Center logo glow */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex flex-col items-center justify-center"
            >
              {/* Cross icon */}
              <motion.div
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: 56,
                  height: 56,
                  marginBottom: 12,
                  filter: "drop-shadow(0 0 16px rgba(251,191,36,0.6))",
                }}
              >
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <rect x="24" y="4" width="8" height="48" rx="3" fill="url(#crossGold)" />
                  <rect x="8" y="16" width="40" height="8" rx="3" fill="url(#crossGold)" />
                  <defs>
                    <linearGradient id="crossGold" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#fde68a" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          </div>

          {/* VERITAS wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <h1
              className="font-cinzel font-black tracking-[0.35em] mb-3"
              style={{
                fontSize: "clamp(36px, 10vw, 52px)",
                background: "linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #d97706 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 20px rgba(251,191,36,0.5))",
              }}
            >
              VERITAS
            </h1>

            {/* Divider line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: 1,
                background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent)",
                marginBottom: 14,
              }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="font-cinzel tracking-[0.22em] uppercase"
              style={{
                fontSize: "clamp(11px, 3vw, 14px)",
                color: "rgba(251,191,36,0.7)",
                letterSpacing: "0.25em",
              }}
            >
              Know the Truth. Live the Truth.
            </motion.p>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="absolute bottom-16 flex gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{ width: 5, height: 5, background: "rgba(251,191,36,0.5)" }}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}