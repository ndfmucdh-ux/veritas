import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Reusable glassmorphic card with optional glow accent.
 * glow: "cyan" | "gold" | "purple" | "red" | none
 */
export default function GlassCard({
  children, className, glow, onClick, animate = true, noBorder = false, ...props
}) {
  const glowMap = {
    cyan:   "shadow-[0_0_32px_rgba(0,245,255,0.12)] border-cyan-400/15",
    gold:   "shadow-[0_0_32px_rgba(255,215,0,0.14)] border-yellow-400/20",
    purple: "shadow-[0_0_32px_rgba(167,139,250,0.13)] border-purple-400/15",
    red:    "shadow-[0_0_32px_rgba(255,59,92,0.13)] border-red-400/15",
  };

  const base = cn(
    "relative overflow-hidden rounded-2xl",
    "bg-white/[0.04] backdrop-blur-xl",
    noBorder ? "" : `border border-white/[0.07] ${glow ? glowMap[glow] : ""}`,
    className
  );

  const Tag = animate ? motion.div : "div";
  const animProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  } : {};

  return (
    <Tag className={base} onClick={onClick} {...animProps} {...props}>
      {/* Subtle inner shine */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)" }} />
      {children}
    </Tag>
  );
}