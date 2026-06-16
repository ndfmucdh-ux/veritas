import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles, X } from "lucide-react";

export default function ExplainThisPanel({ value, onChange, onExplain, loading, result, onClearResult, placeholder }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4" style={{ color: "#fbbf24" }} />
        <p className="font-cinzel text-sm font-semibold text-white">Explain This</p>
        <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>AI theological summary</p>
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onExplain()}
          placeholder={placeholder}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
          style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(251,191,36,0.2)", color: "rgba(255,255,255,0.85)" }}
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={onExplain}
          disabled={!value.trim() || loading}
          className="px-4 py-2.5 rounded-xl font-cinzel text-sm font-semibold transition-all"
          style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", opacity: !value.trim() ? 0.5 : 1 }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Explain"}
        </motion.button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>{result}</p>
              <button type="button" onClick={onClearResult} className="flex-shrink-0"><X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}