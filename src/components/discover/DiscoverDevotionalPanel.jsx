import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function DiscoverDevotionalPanel({ loading, devotional, selectedVerse, onClose }) {
  return (
    <AnimatePresence>
      {(loading || devotional) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-20 z-40 glass-strong rounded-2xl p-5 border border-purple/30 max-h-[70vh] overflow-y-auto scrollbar-hide shadow-2xl"
        >
          {loading ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 className="w-5 h-5 text-purple animate-spin" />
              <div>
                <p className="text-sm font-cinzel text-foreground">Generating devotional for {selectedVerse}...</p>
                <p className="text-xs text-muted-foreground mt-0.5">AI is crafting a personalized reflection</p>
              </div>
            </div>
          ) : devotional && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-foreground">{devotional.title}</h3>
                  <p className="text-xs text-purple mt-0.5">{devotional.key_verse}</p>
                </div>
                <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">×</button>
              </div>
              <p className="text-sm text-foreground/90 font-inter leading-relaxed">{devotional.reflection}</p>
              {devotional.insights?.length > 0 && (
                <div>
                  <p className="text-xs font-cinzel text-gold uppercase tracking-widest mb-2">Key Insights</p>
                  <ul className="space-y-1">
                    {devotional.insights.map((ins, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-gold">·</span>{ins}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {devotional.application && (
                <div className="glass rounded-xl p-3 border border-cyan/20">
                  <p className="text-xs font-cinzel text-cyan uppercase tracking-widest mb-1">Apply Today</p>
                  <p className="text-sm text-foreground/80">{devotional.application}</p>
                </div>
              )}
              {devotional.prayer && (
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-cinzel text-purple uppercase tracking-widest mb-2">Prayer</p>
                  <p className="text-sm text-foreground/80 font-playfair italic leading-relaxed">{devotional.prayer}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}