import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable error panel with an accessible alert role and optional retry.
 *
 * Props:
 * - title: primary line (default "Something went wrong")
 * - description: optional secondary line
 * - onRetry: optional callback — renders a "Try again" button when provided
 * - retryLabel: button text (default "Try again")
 * - className: extra classes
 */
export default function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  retryLabel = "Try again",
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      aria-live="assertive"
      className={cn("flex flex-col items-center justify-center text-center gap-3 py-12 px-6", className)}
    >
      <AlertTriangle className="w-8 h-8" style={{ color: "#f87171" }} aria-hidden="true" />
      <p className="font-cinzel text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{title}</p>
      {description && (
        <p className="text-xs font-inter max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
          {description}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-cinzel text-xs min-h-10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </motion.div>
  );
}