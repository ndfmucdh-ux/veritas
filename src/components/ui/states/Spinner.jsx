import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = { xs: "w-3 h-3", sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6", xl: "w-8 h-8" };

/**
 * Accessible spinning loader icon.
 * Use inside buttons or inline. For full panel loads, prefer <LoadingState>.
 *
 * Props:
 * - size: "xs" | "sm" | "md" | "lg" | "xl" (default "md")
 * - color: CSS color for the icon (default cyan token)
 * - label: screen-reader text (default "Loading")
 * - className: extra classes
 */
export default function Spinner({ size = "md", color = "#00f5ff", label = "Loading", className }) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn("animate-spin", SIZES[size] || SIZES.md, className)}
      style={{ color }}
    />
  );
}