import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Columns } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { TRANSLATIONS } from "@/lib/bibleData";

const QUICK_TRANSLATIONS = ["KJV", "NIV", "ESV", "NKJV", "NLT", "ASV", "YLT"];

export default function TranslationSplitView({ book, chapter }) {
  const [leftTrans, setLeftTrans] = useState("KJV");
  const [rightTrans, setRightTrans] = useState("NIV");
  const [leftVerses, setLeftVerses] = useState([]);
  const [rightVerses, setRightVerses] = useState([]);
  const [leftLoading, setLeftLoading] = useState(false);
  const [rightLoading, setRightLoading] = useState(false);

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

  useEffect(() => { fetchVerses(leftTrans, "left"); }, [book, chapter, leftTrans]);
  useEffect(() => { fetchVerses(rightTrans, "right"); }, [book, chapter, rightTrans]);

  const TransPicker = ({ value, onChange, side }) => (
    <div className="flex gap-1 flex-wrap mb-3">
      {QUICK_TRANSLATIONS.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className="px-2 py-1 rounded-lg text-[10px] font-cinzel transition-all"
          style={{
            background: value === t ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)",
            color: value === t ? "#00f5ff" : "rgba(255,255,255,0.4)",
            border: value === t ? "1px solid rgba(0,245,255,0.3)" : "1px solid transparent",
          }}>
          {t}
        </button>
      ))}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(0,245,255,0.15)", background: "rgba(0,245,255,0.03)" }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <Columns className="w-4 h-4" style={{ color: "#00f5ff" }} />
        <p className="font-cinzel text-sm font-semibold" style={{ color: "#00f5ff" }}>
          {book} {chapter} — Side-by-Side
        </p>
      </div>

      <div className="grid grid-cols-2 divide-x" style={{ divideColor: "rgba(255,255,255,0.07)" }}>
        {/* Left */}
        <div className="p-3 overflow-y-auto max-h-[60vh] scrollbar-hide">
          <TransPicker value={leftTrans} onChange={setLeftTrans} side="left" />
          {leftLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00f5ff" }} /></div>
          ) : (
            <div className="space-y-2">
              {leftVerses.map(v => (
                <div key={v.verse} className="text-xs font-inter leading-relaxed"
                  style={{ color: v.red_letter ? "#f87171" : "rgba(255,255,255,0.8)" }}>
                  <span className="font-cinzel text-[10px] mr-1.5" style={{ color: "rgba(255,255,255,0.25)", verticalAlign: "super", fontSize: "9px" }}>{v.verse}</span>
                  {v.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="p-3 overflow-y-auto max-h-[60vh] scrollbar-hide">
          <TransPicker value={rightTrans} onChange={setRightTrans} side="right" />
          {rightLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00f5ff" }} /></div>
          ) : (
            <div className="space-y-2">
              {rightVerses.map(v => (
                <div key={v.verse} className="text-xs font-inter leading-relaxed"
                  style={{ color: v.red_letter ? "#f87171" : "rgba(255,255,255,0.8)" }}>
                  <span className="font-cinzel text-[10px] mr-1.5" style={{ color: "rgba(255,255,255,0.25)", verticalAlign: "super", fontSize: "9px" }}>{v.verse}</span>
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