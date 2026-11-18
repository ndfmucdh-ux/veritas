import { motion } from "framer-motion";
import Spinner from "./Spinner";
import { cn } from "@/lib/utils";

/**
 * Full-panel loading indicator with an accessible live region.
 * Announces to screen readers and reserves vertical space to prevent layout shift.
 *
 * Props:
 * - label: visible + announced text (default "Loading…")
 * - size: spinner size (default "md")
 * - color: spinner color
 * - minHeight: px to reserve while loading (default 160) — reduces layout shift / CLS
 * - inline: render as a compact inline row instead of a centered panel
 * - className: extra classes
 */
export default function LoadingState({
  label = "Loading…",
  size = "md",
  color = "#00f5ff",
  minHeight = 160,
  inline = false,
  className,
}) {
  if (inline) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn("flex items-center gap-2.5 py-3", className)}
      >
        <Spinner size={size} color={color} label={label} />
        <span className="text-sm font-cinzel" style={{ color: "rgb(var(--ink) / 0.4)" }}>{label}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("flex flex-col items-center justify-center gap-3 text-center", className)}
      style={{ minHeight }}
    >
      <Spinner size={size} color={color} label={label} />
      <p className="text-sm font-cinzel" style={{ color: "rgb(var(--ink) / 0.4)" }}>{label}</p>
    </motion.div>
  );
}