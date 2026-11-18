import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles, X } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

export default function ExplainThisPanel({ value, onChange, onExplain, loading, result, onClearResult, placeholder }) {
  const { t } = useLang();
  return (
    <div className="rounded-2xl p-4 bg-card border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-accent" />
        <p className="font-cinzel text-base font-semibold text-foreground">{t.explainThis}</p>
        <p className="text-xs text-muted-foreground">{t.explainSub}</p>
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onExplain()}
          placeholder={placeholder}
          className="flex-1 min-w-0 rounded-xl px-3 py-2.5 bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          style={{ fontSize: "16px" }}
        />
        <button
          type="button"
          onClick={onExplain}
          disabled={!value.trim() || loading}
          className="px-4 py-2.5 rounded-xl font-cinzel text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.explainBtn}
        </button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm leading-relaxed text-foreground/85">{result}</p>
              <button type="button" onClick={onClearResult} className="flex-shrink-0" aria-label="Clear"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}