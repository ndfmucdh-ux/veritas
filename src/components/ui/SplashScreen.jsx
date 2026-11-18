import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState("in"); // "in" | "hold" | "out"

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase("out"), 2800);
    const doneTimer = setTimeout(() => onComplete(), 3500);
    return () => { clearTimeout(holdTimer); clearTimeout(doneTimer); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "out" ? (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "hsl(var(--background))" }}
        >
          {/* Subtle radial amber glow behind the ring */}
          <div
            className="absolute"
            style={{
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(180,130,0,0.18) 0%, transparent 70%)",
            }}
          />

          {/* Ring + Text container */}
          <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>

            {/* Faint inner ring */}
            <svg className="absolute inset-0" width="260" height="260" viewBox="0 0 260 260" fill="none">
              <circle cx="130" cy="130" r="108" stroke="rgba(180,130,0,0.2)" strokeWidth="1" />
            </svg>

            {/* Main animated gold arc — spins and draws in */}
            <motion.svg
              className="absolute inset-0"
              width="260"
              height="260"
              viewBox="0 0 260 260"
              fill="none"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <defs>
                <linearGradient id="arcGrad" x1="0" y1="0" x2="260" y2="260" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
                  <stop offset="30%" stopColor="#fbbf24" stopOpacity="1" />
                  <stop offset="70%" stopColor="#f59e0b" stopOpacity="1" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* ~270° arc — leaves a gap like in the photo */}
              <circle
                cx="130"
                cy="130"
                r="118"
                stroke="url(#arcGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="555 185"
                strokeDashoffset="0"
                style={{ filter: "drop-shadow(0 0 6px rgba(251,191,36,0.7))" }}
              />
            </motion.svg>

            {/* Glowing dot that travels along the ring */}
            <motion.div
              className="absolute"
              style={{ width: 260, height: 260 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#fbbf24",
                  boxShadow: "0 0 10px 4px rgba(251,191,36,0.9), 0 0 20px 8px rgba(251,191,36,0.4)",
                }}
              />
            </motion.div>

            {/* VERITAS text — fades in after ring appears */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 font-cinzel font-bold tracking-[0.3em] select-none"
              style={{
                fontSize: "clamp(28px, 8vw, 38px)",
                background: "linear-gradient(160deg, #fde68a 10%, #f59e0b 50%, #92400e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 18px rgba(251,191,36,0.55))",
              }}
            >
              VERITAS
            </motion.h1>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}