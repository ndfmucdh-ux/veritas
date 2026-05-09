import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Columns } from "lucide-react";
import { base44 } from "@/api/base44Client";

const QUICK_TRANSLATIONS = [
  // English
  { code: "KJV", label: "KJV 🇬🇧" },
  { code: "NIV", label: "NIV 🇬🇧" },
  { code: "ESV", label: "ESV 🇬🇧" },
  { code: "NKJV", label: "NKJV 🇬🇧" },
  { code: "NLT", label: "NLT 🇬🇧" },
  { code: "MSG", label: "MSG 🇬🇧" },
  { code: "ASV", label: "ASV 🇺🇸" },
  { code: "YLT", label: "YLT 🇬🇧" },
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

export default function TranslationSplitView({ book, chapter }) {
  const [leftTrans, setLeftTrans] = useState("KJV");
  const [rightTrans, setRightTrans] = useState("NIV");
  const [leftVerses, setLeftVerses] = useState([]);
  const [rightVerses, setRightVerses] = useState([]);
  const [leftLoading, setLeftLoading] = useState(false);
  const [rightLoading, setRightLoading] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);

  const fetchVerses = async (translation, side) => {
    const setLoading = side === "left" ? setLeftLoading : setRightLoading;
    const setVerses = side === "left" ? setLeftVerses : setRightVerses;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("getChapter", { book, chapter, translation });
      setVerses(res.data?.verses || []);
    } catch {
      setVerses([]);
    } finally {
      setLoading(false);
    }
  };

  // Sync scroll between left and right
  const handleLeftScroll = () => {
    if (leftScrollRef.current && rightScrollRef.current) {
      const ratio = leftScrollRef.current.scrollTop / (leftScrollRef.current.scrollHeight - leftScrollRef.current.clientHeight);
      rightScrollRef.current.scrollTop = ratio * (rightScrollRef.current.scrollHeight - rightScrollRef.current.clientHeight);
    }
  };

  const handleRightScroll = () => {
    if (leftScrollRef.current && rightScrollRef.current) {
      const ratio = rightScrollRef.current.scrollTop / (rightScrollRef.current.scrollHeight - rightScrollRef.current.clientHeight);
      leftScrollRef.current.scrollTop = ratio * (leftScrollRef.current.scrollHeight - leftScrollRef.current.clientHeight);
    }
  };

  useEffect(() => { fetchVerses(leftTrans, "left"); }, [book, chapter, leftTrans]);
  useEffect(() => { fetchVerses(rightTrans, "right"); }, [book, chapter, rightTrans]);

  const TransPicker = ({ value, onChange }) => (
    <div className="flex gap-1 flex-wrap mb-3">
      {QUICK_TRANSLATIONS.map(t => (
        <button key={t.code} onClick={() => onChange(t.code)}
          className="px-2 py-1.5 rounded-lg text-[10px] font-cinzel transition-all"
          style={{
            background: value === t.code ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)",
            color: value === t.code ? "#00f5ff" : "rgba(255,255,255,0.4)",
            border: value === t.code ? "1px solid rgba(0,245,255,0.3)" : "1px solid transparent",
          }}>
          {t.label}
        </button>
      ))}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(0,245,255,0.15)", background: "rgba(0,245,255,0.03)" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2">
          <Columns className="w-4 h-4" style={{ color: "#00f5ff" }} />
          <p className="font-cinzel text-sm font-semibold" style={{ color: "#00f5ff" }}>
            {book} {chapter} — Side-by-Side
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setFontSize(f => Math.max(12, f - 1))} className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>−</button>
          <span className="text-xs font-cinzel px-2" style={{ color: "rgba(255,255,255,0.3)" }}>{fontSize}</span>
          <button onClick={() => setFontSize(f => Math.min(22, f + 1))} className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>+</button>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x" style={{ divideColor: "rgba(255,255,255,0.07)" }}>
        {/* Left */}
        <div ref={leftScrollRef} className="p-3 overflow-y-auto max-h-[60vh] scrollbar-hide" onScroll={handleLeftScroll}>
          <TransPicker value={leftTrans} onChange={setLeftTrans} side="left" />
          {leftLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00f5ff" }} /></div>
          ) : (
            <div className="space-y-2">
              {leftVerses.map(v => (
                <div key={v.verse} className="font-inter leading-relaxed" style={{ fontSize: `${fontSize}px`, color: v.red_letter ? "#f87171" : "rgba(255,255,255,0.8)" }}>
                  <span className="font-cinzel mr-1.5" style={{ color: "rgba(255,255,255,0.25)", verticalAlign: "super", fontSize: `${fontSize - 3}px` }}>{v.verse}</span>
                  {v.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right */}
        <div ref={rightScrollRef} className="p-3 overflow-y-auto max-h-[60vh] scrollbar-hide" onScroll={handleRightScroll}>
          <TransPicker value={rightTrans} onChange={setRightTrans} side="right" />
          {rightLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00f5ff" }} /></div>
          ) : (
            <div className="space-y-2">
              {rightVerses.map(v => (
                <div key={v.verse} className="font-inter leading-relaxed" style={{ fontSize: `${fontSize}px`, color: v.red_letter ? "#f87171" : "rgba(255,255,255,0.8)" }}>
                  <span className="font-cinzel mr-1.5" style={{ color: "rgba(255,255,255,0.25)", verticalAlign: "super", fontSize: `${fontSize - 3}px` }}>{v.verse}</span>
                  {v.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}