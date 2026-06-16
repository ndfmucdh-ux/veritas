import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Reusable empty-state panel for "no data yet" situations.
 * Accepts either an emoji string or a Lucide icon component.
 *
 * Props:
 * - icon: emoji string (e.g. "🔖") OR a Lucide icon component (e.g. Bookmark)
 * - title: primary line (required)
 * - description: optional secondary line
 * - action: optional React node (e.g. a <button>) rendered below the text
 * - className: extra classes
 */
export default function EmptyState({ icon, title, description, action, className }) {
  const isComponentIcon = typeof icon === "function" || (typeof icon === "object" && icon?.render);
  const IconComp = isComponentIcon ? icon : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center text-center gap-3 py-16 px-6", className)}
    >
      {icon != null && (
        isComponentIcon ? (
          <IconComp className="w-10 h-10" style={{ color: "rgba(255,255,255,0.18)" }} aria-hidden="true" />
        ) : (
          <span className="text-5xl" aria-hidden="true">{icon}</span>
        )
      )}
      {title && (
        <p className="font-cinzel text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{title}</p>
      )}
      {description && (
        <p className="text-xs font-inter max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </motion.div>
  );
}