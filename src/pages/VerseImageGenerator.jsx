import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Download, Share2, X, Sparkles } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

const TEMPLATES = [
  { id: "dark_gold", label: "Dark Gold", bg: "linear-gradient(135deg, #0a0f1e 0%, #1a1400 100%)", textColor: "#fbbf24", refColor: "#f59e0b", font: "Cinzel", overlay: "rgba(251,191,36,0.04)" },
  { id: "midnight", label: "Midnight", bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", textColor: "#e0e7ff", refColor: "#a78bfa", font: "Playfair Display", overlay: "rgba(167,139,250,0.05)" },
  { id: "sunrise", label: "Sunrise", bg: "linear-gradient(135deg, #f83600 0%, #f9d423 100%)", textColor: "#fff7ed", refColor: "rgba(255,255,255,0.8)", font: "Cinzel", overlay: "rgba(255,255,255,0.05)" },
  { id: "ocean", label: "Ocean", bg: "linear-gradient(135deg, #006994 0%, #00b4db 100%)", textColor: "#f0f9ff", refColor: "rgba(255,255,255,0.75)", font: "Playfair Display", overlay: "rgba(255,255,255,0.04)" },
  { id: "forest", label: "Forest", bg: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)", textColor: "#f0fdf4", refColor: "rgba(255,255,255,0.7)", font: "Cinzel", overlay: "rgba(255,255,255,0.03)" },
  { id: "rose", label: "Rose", bg: "linear-gradient(135deg, #f43f5e 0%, #fb7185 50%, #fda4af 100%)", textColor: "#fff1f2", refColor: "rgba(255,255,255,0.75)", font: "Playfair Display", overlay: "rgba(255,255,255,0.04)" },
];

const POPULAR_VERSES = [
  { ref: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
  { ref: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me." },
  { ref: "Psalm 23:1", text: "The LORD is my shepherd; I shall not want." },
  { ref: "Isaiah 40:31", text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles." },
  { ref: "Romans 8:28", text: "And we know that all things work together for good to them that love God." },
];

export default function VerseImageGenerator() {
  const { t } = useLang();
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [verseRef, setVerseRef] = useState("John 3:16");
  const [verseText, setVerseText] = useState("For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.");
  const [copied, setCopied] = useState(false);
  const previewRef = useRef(null);

  const handleShare = async () => {
    const text = `"${verseText}" — ${verseRef}\n\nShared from Veritas Bible`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="md:ml-16 min-h-screen pb-28 px-4 pt-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-5 h-5" style={{ color: "#fbbf24" }} />
          <h1 className="font-cinzel text-xl font-bold text-white">Verse Image Generator</h1>
        </div>

        {/* Preview Card */}
        <div ref={previewRef}
          className="relative rounded-3xl overflow-hidden mb-6 flex flex-col items-center justify-center text-center p-8"
          style={{ background: template.bg, minHeight: 280, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <div className="absolute inset-0" style={{ background: template.overlay }} />
          {/* Logo watermark */}
          <p className="absolute top-4 left-0 right-0 text-center text-[9px] uppercase tracking-[0.3em] font-cinzel z-10" style={{ color: "rgba(255,255,255,0.25)" }}>VERITAS</p>
          <div className="relative z-10">
            <p className="font-playfair italic leading-relaxed mb-4" style={{ fontSize: "clamp(15px, 4vw, 20px)", color: template.textColor, fontFamily: template.font }}>
              "{verseText}"
            </p>
            <p className="font-cinzel text-sm font-bold tracking-wider" style={{ color: template.refColor }}>— {verseRef}</p>
          </div>
        </div>

        {/* Template picker */}
        <div className="mb-5">
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>Template</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {TEMPLATES.map(tmpl => (
              <button key={tmpl.id} onClick={() => setTemplate(tmpl)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-xl transition-all"
                  style={{ background: tmpl.bg, border: template.id === tmpl.id ? "2px solid #fbbf24" : "2px solid transparent" }} />
                <span className="text-[9px] font-inter" style={{ color: template.id === tmpl.id ? "#fbbf24" : "rgba(255,255,255,0.35)" }}>{tmpl.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Verse input */}
        <div className="space-y-3 mb-5">
          <div>
            <p className="text-[10px] font-cinzel uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Reference</p>
            <input value={verseRef} onChange={e => setVerseRef(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm font-cinzel focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)" }} />
          </div>
          <div>
            <p className="text-[10px] font-cinzel uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Verse Text</p>
            <textarea value={verseText} onChange={e => setVerseText(e.target.value)} rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm font-playfair italic resize-none focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.82)" }} />
          </div>
        </div>

        {/* Quick-pick popular verses */}
        <div className="mb-6">
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Quick Pick</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {POPULAR_VERSES.map(v => (
              <button key={v.ref} onClick={() => { setVerseRef(v.ref); setVerseText(v.text); }}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-cinzel transition-all"
                style={{
                  background: verseRef === v.ref ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
                  color: verseRef === v.ref ? "#fbbf24" : "rgba(255,255,255,0.45)",
                  border: verseRef === v.ref ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.07)",
                }}>
                {v.ref}
              </button>
            ))}
          </div>
        </div>

        {/* Share button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-cinzel text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.1))", border: "1px solid rgba(251,191,36,0.35)", color: "#fbbf24" }}>
          <Share2 className="w-4 h-4" />
          {copied ? "Copied to clipboard!" : "Share Verse"}
        </motion.button>
      </div>
    </div>
  );
}