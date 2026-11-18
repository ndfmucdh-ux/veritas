import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Loader2, ChevronDown, Lightbulb, X } from "lucide-react";
import { LoadingState, EmptyState } from "@/components/ui/states";

export default function CrossReferencePanel({ book, chapter, activeVerses }) {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [selectedVerse, setSelectedVerse] = useState(null);

  useEffect(() => {
    if (activeVerses && activeVerses.length > 0) {
      loadCrossReferences(activeVerses[0]);
    }
  }, [activeVerses?.[0]]);

  const loadCrossReferences = async (verseText) => {
    if (!verseText) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateBibleOutline", {
        book,
        depth: "overview",
        language: "en"
      });
      const outline = res.data?.outline?.response || res.data?.outline;
      
      // Extract related verses from outline key_verses
      const relatedVerses = [];
      if (outline?.sections) {
        outline.sections.forEach(section => {
          (section.key_verses || []).slice(0, 3).forEach(v => {
            if (!relatedVerses.some(r => r.ref === v)) {
              relatedVerses.push({ ref: v, context: section.title });
            }
          });
        });
      }
      setReferences(relatedVerses.slice(0, 8));
    } catch (err) {
      console.error("Error loading cross-references:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className="fixed right-0 top-0 bottom-0 z-40 flex flex-col"
      style={{
        width: "min(320px, 85vw)",
        background: "var(--panel-surface)",
        backdropFilter: "blur(24px)",
        borderLeft: "1px solid rgba(124,58,237,0.15)",
        boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3.5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" style={{ color: "#7c3aed" }} />
            <span className="font-cinzel text-xs font-semibold text-white">Related Verses</span>
          </div>
        </div>
        <p className="text-[10px] font-inter mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          {book} {chapter}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-2">
        {loading ? (
          <LoadingState label="Finding related verses…" size="md" minHeight={120} />
        ) : references.length === 0 ? (
          <EmptyState icon={Lightbulb} title="No cross-references found" minHeight={120} />
        ) : (
          references.map((ref, i) => (
            <motion.div
              key={ref.ref}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl overflow-hidden"
              style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              <button
                onClick={() => setExpanded(e => ({ ...e, [ref.ref]: !e[ref.ref] }))}
                className="w-full text-left px-3 py-2.5 flex items-center justify-between transition-colors hover:bg-white/5"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-cinzel text-xs text-white truncate">{ref.ref}</p>
                  <p className="text-[9px] font-inter mt-0.5 truncate" style={{ color: "rgba(124,58,237,0.7)" }}>
                    {ref.context}
                  </p>
                </div>
                <ChevronDown
                  className="w-3.5 h-3.5 flex-shrink-0 ml-1 transition-transform"
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    transform: expanded[ref.ref] ? "rotate(0deg)" : "rotate(-90deg)"
                  }}
                />
              </button>

              <AnimatePresence>
                {expanded[ref.ref] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t"
                    style={{ borderColor: "rgba(124,58,237,0.1)" }}
                  >
                    <div className="px-3 py-2.5 text-[11px] font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                      <p>Tap to navigate to this verse for deeper study.</p>
                      <a
                        href={`/read?book=${encodeURIComponent(ref.ref.split(" ").slice(0, -1).join(" "))}&chapter=${ref.ref.split(":")[0]?.split(" ")?.slice(-1)[0] || 1}`}
                        className="block mt-2 text-xs font-cinzel px-2 py-1.5 rounded-lg text-center transition-all"
                        style={{ background: "rgba(124,58,237,0.15)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.3)" }}
                      >
                        Read Full Passage
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}