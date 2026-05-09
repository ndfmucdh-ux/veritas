import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Columns, Plus, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ALL_TRANSLATIONS = [
  // English
  { code: "KJV", label: "KJV 🇬🇧" },
  { code: "NIV", label: "NIV 🇬🇧" },
  { code: "ESV", label: "ESV 🇬🇧" },
  { code: "NLT", label: "NLT 🇬🇧" },
  { code: "NKJV", label: "NKJV 🇬🇧" },
  { code: "MSG", label: "MSG 🇺🇸" },
  { code: "ASV", label: "ASV 🇺🇸" },
  { code: "NASB", label: "NASB 🇺🇸" },
  { code: "CSB", label: "CSB 🇺🇸" },
  // Spanish
  { code: "RVR1960", label: "RVR1960 🇲🇽" },
  { code: "NVI", label: "NVI 🇲🇽" },
  { code: "PDDPT", label: "PDT 🇲🇽" },
  { code: "NTV", label: "NTV 🇲🇽" },
  { code: "LBLA", label: "LBLA 🇲🇽" },
  // Portuguese
  { code: "ARA", label: "ARA 🇧🇷" },
  // French
  { code: "LSG", label: "LSG 🇫🇷" },
];

async function fetchTranslation(book, chapter, translation) {
  // Try backend first
  try {
    const res = await base44.functions.invoke("getChapter", { translation, book, chapter });
    if (res.data?.verses?.length > 0) return res.data.verses;
  } catch {}
  // Fallback to public API (KJV only)
  const slug = book.toLowerCase().replace(/\s+/g, "+");
  const r = await fetch(`https://bible-api.com/${slug}+${chapter}?translation=kjv`);
  if (r.ok) {
    const d = await r.json();
    return (d.verses || []).map(v => ({ verse: v.verse, text: v.text.trim() }));
  }
  return [];
}

export default function ParallelPanel({ book, chapter, primaryTranslation, primaryVerses, onClose }) {
  const [secondTranslation, setSecondTranslation] = useState(
    ALL_TRANSLATIONS.find(t => t.code !== primaryTranslation)?.code || "NIV"
  );
  const [secondVerses, setSecondVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const syncingRef = useRef(false);

  const handleLeftScroll = () => {
    if (syncingRef.current || !leftScrollRef.current || !rightScrollRef.current) return;
    syncingRef.current = true;
    const maxScroll = leftScrollRef.current.scrollHeight - leftScrollRef.current.clientHeight || 1;
    const ratio = leftScrollRef.current.scrollTop / maxScroll;
    const rightMaxScroll = rightScrollRef.current.scrollHeight - rightScrollRef.current.clientHeight;
    rightScrollRef.current.scrollTop = ratio * rightMaxScroll;
    syncingRef.current = false;
  };

  const handleRightScroll = () => {
    if (syncingRef.current || !leftScrollRef.current || !rightScrollRef.current) return;
    syncingRef.current = true;
    const maxScroll = rightScrollRef.current.scrollHeight - rightScrollRef.current.clientHeight || 1;
    const ratio = rightScrollRef.current.scrollTop / maxScroll;
    const leftMaxScroll = leftScrollRef.current.scrollHeight - leftScrollRef.current.clientHeight;
    leftScrollRef.current.scrollTop = ratio * leftMaxScroll;
    syncingRef.current = false;
  };

  useEffect(() => {
    if (!secondTranslation) return;
    setLoading(true);
    fetchTranslation(book, chapter, secondTranslation)
      .then(setSecondVerses)
      .finally(() => setLoading(false));
  }, [book, chapter, secondTranslation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#06080f" }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(6,10,20,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <Columns className="w-4 h-4" style={{ color: "#00f5ff" }} />
          <span className="font-cinzel text-sm font-semibold text-white/80">Parallel View</span>
          <span className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>{book} {chapter}</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2.5">
             <button onClick={() => setFontSize(f => Math.max(12, f - 1))} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
               style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>−</button>
             <span className="text-sm font-cinzel px-3" style={{ color: "rgba(255,255,255,0.3)" }}>{fontSize}</span>
             <button onClick={() => setFontSize(f => Math.min(26, f + 1))} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
               style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>+</button>
           </div>
           <select
             value={secondTranslation}
             onChange={e => setSecondTranslation(e.target.value)}
             className="text-xs font-cinzel px-4 py-2 rounded-xl focus:outline-none"
             style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
           >
             {ALL_TRANSLATIONS.filter(t => t.code !== primaryTranslation).map(t => (
               <option key={t.code} value={t.code}>{t.label}</option>
             ))}
           </select>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.07)" }}>
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-px"
        style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-4 py-2 text-center">
          <span className="text-[10px] font-cinzel uppercase tracking-widest font-bold" style={{ color: "#fbbf24" }}>{primaryTranslation}</span>
        </div>
        <div className="px-4 py-2 text-center">
          <span className="text-[10px] font-cinzel uppercase tracking-widest font-bold" style={{ color: "#00f5ff" }}>{secondTranslation}</span>
        </div>
      </div>

      {/* Parallel columns */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00f5ff" }} />
          <p className="text-sm font-cinzel" style={{ color: "rgba(255,255,255,0.35)" }}>Loading {secondTranslation}…</p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 divide-x h-full" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {/* Left column — primary */}
            <div ref={leftScrollRef} className="px-3 py-4 space-y-3 overflow-y-auto scrollbar-hide will-change-scroll" onScroll={handleLeftScroll}>
              {primaryVerses.map(v => (
                <div key={v.verse} className="flex gap-1.5">
                  <span className="font-cinzel flex-shrink-0 pt-1 w-5 text-right select-none" style={{ color: "rgba(255,255,255,0.2)", fontSize: `${fontSize - 3}px` }}>{v.verse}</span>
                  <p className="font-playfair leading-relaxed" style={{
                    fontSize: `${fontSize}px`,
                    color: v.red_letter ? "#f87171" : "rgba(255,255,255,0.82)",
                    textShadow: v.red_letter ? "0 0 12px rgba(248,113,113,0.4)" : "none",
                  }}>{v.text}</p>
                </div>
              ))}
            </div>
            {/* Right column — secondary */}
            <div ref={rightScrollRef} className="px-3 py-4 space-y-3 overflow-y-auto scrollbar-hide will-change-scroll" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }} onScroll={handleRightScroll}>
              {secondVerses.map(v => (
                <div key={v.verse} className="flex gap-1.5">
                  <span className="font-cinzel flex-shrink-0 pt-1 w-5 text-right select-none" style={{ color: "rgba(255,255,255,0.2)", fontSize: `${fontSize - 3}px` }}>{v.verse}</span>
                  <p className="font-playfair leading-relaxed" style={{ fontSize: `${fontSize}px`, color: "rgba(255,255,255,0.72)" }}>{v.text}</p>
                </div>
              ))}
              {secondVerses.length === 0 && (
                <p className="text-xs text-center py-8" style={{ color: "rgba(255,255,255,0.25)" }}>No data for {secondTranslation}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}