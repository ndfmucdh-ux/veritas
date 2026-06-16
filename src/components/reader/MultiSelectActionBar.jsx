import { motion } from "framer-motion";
import { Check, Copy, FolderPlus, X } from "lucide-react";

export default function MultiSelectActionBar({ selectedCount, copied, onCopy, onSave, onCancel }) {
  if (!selectedCount) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-center gap-2 px-3 py-3 rounded-2xl max-w-[calc(100vw-24px)] flex-wrap"
      style={{ background: "rgba(8,13,26,0.97)", border: "1px solid rgba(0,245,255,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", backdropFilter: "blur(20px)" }}
    >
      <span className="font-cinzel text-sm" style={{ color: "#00f5ff" }}>{selectedCount} selected</span>
      <button
        onClick={onCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-cinzel whitespace-nowrap"
        style={{ background: copied ? "rgba(52,211,153,0.16)" : "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.28)" }}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? "Copied" : "Copy"}
      </button>
      <button
        onClick={onSave}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-cinzel whitespace-nowrap"
        style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.3)" }}
      >
        <FolderPlus className="w-4 h-4" /> <span className="sm:hidden">Save</span><span className="hidden sm:inline">Save to Folder</span>
      </button>
      <button
        onClick={onCancel}
        className="w-7 h-7 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}