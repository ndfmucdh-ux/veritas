import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Animated SVG progress ring with stroke-dashoffset animation.
 */
export default function ProgressRing({
  value = 0,        // 0–100
  size = 64,
  strokeWidth = 5,
  color = "#00f5ff",
  trackColor = "rgba(255,255,255,0.07)",
  children,
  className = "",
}) {
  const shouldReduce = useReducedMotion();
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: shouldReduce ? offset : offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          style={{ strokeDashoffset: offset, filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}