import { useState, useRef, useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Check, Loader2 } from "lucide-react";

const BACKGROUNDS = [
  { id: "cosmic", label: "Cosmos", style: "linear-gradient(135deg, #06080f 0%, #0d1a3a 50%, #06080f 100%)" },
  { id: "gold", label: "Dorado", style: "linear-gradient(135deg, #1a1000 0%, #3d2800 50%, #1a0f00 100%)" },
  { id: "emerald", label: "Esmeralda", style: "linear-gradient(135deg, #00150f 0%, #003d2a 50%, #001a12 100%)" },
  { id: "royal", label: "Real", style: "linear-gradient(135deg, #0d001a 0%, #1e0040 50%, #0d001a 100%)" },
  { id: "crimson", label: "Carmesí", style: "linear-gradient(135deg, #1a0005 0%, #3d0015 50%, #1a0005 100%)" },
  { id: "midnight", label: "Medianoche", style: "linear-gradient(135deg, #000814 0%, #001233 50%, #000814 100%)" },
];

const ACCENT_COLORS = ["#00f5ff", "#fbbf24", "#34d399", "#a78bfa", "#f472b6", "#f87171"];

export default function SocialShareModal({ verseRef, verseText, type = "highlight", onClose }) {
  const { t } = useLang();
  const [selectedBg, setSelectedBg] = useState(0);
  const [accentColor, setAccentColor] = useState("#fbbf24");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);

  const bg = BACKGROUNDS[selectedBg];

  useEffect(() => {
    renderCanvas();
  }, [selectedBg, accentColor, verseText, verseRef]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    const stops = selectedBg === 0
      ? [["#06080f", 0], ["#0d1a3a", 0.5], ["#06080f", 1]]
      : selectedBg === 1
      ? [["#1a1000", 0], ["#3d2800", 0.5], ["#1a0f00", 1]]
      : selectedBg === 2
      ? [["#00150f", 0], ["#003d2a", 0.5], ["#001a12", 1]]
      : selectedBg === 3
      ? [["#0d001a", 0], ["#1e0040", 0.5], ["#0d001a", 1]]
      : selectedBg === 4
      ? [["#1a0005", 0], ["#3d0015", 0.5], ["#1a0005", 1]]
      : [["#000814", 0], ["#001233", 0.5], ["#000814", 1]];

    stops.forEach(([color, stop]) => grad.addColorStop(stop, color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle radial glow
    const radial = ctx.createRadialGradient(W / 2, H / 3, 0, W / 2, H / 3, W * 0.6);
    radial.addColorStop(0, accentColor + "18");
    radial.addColorStop(1, "transparent");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, W, H);

    // Top accent line
    ctx.fillStyle = accentColor;
    ctx.fillRect(W / 2 - 40, 52, 80, 2);

    // "VERITAS" brand
    ctx.fillStyle = accentColor;
    ctx.font = "bold 14px serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "0.3em";
    ctx.fillText("✦ VERITAS ✦", W / 2, 46);

    // Quote marks
    ctx.fillStyle = accentColor + "44";
    ctx.font = "bold 90px Georgia";
    ctx.textAlign = "left";
    ctx.fillText('\u201C', 32, 130);

    // Verse text - wrap
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "italic 22px Georgia";
    ctx.textAlign = "center";
    const words = (verseText || "").split(" ");
    const maxWidth = W - 80;
    let lines = [];
    let line = "";
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    const lineH = 32;
    const textStartY = H / 2 - ((lines.length * lineH) / 2);
    lines.forEach((l, i) => {
      ctx.fillText(l, W / 2, textStartY + i * lineH);
    });

    // Verse reference
    ctx.fillStyle = accentColor;
    ctx.font = "bold 16px serif";
    ctx.textAlign = "center";
    ctx.fillText("— " + (verseRef || ""), W / 2, H - 80);

    // Bottom accent line
    ctx.fillStyle = accentColor;
    ctx.fillRect(W / 2 - 40, H - 65, 80, 2);

    // Closing quote
    ctx.fillStyle = accentColor + "44";
    ctx.font = "bold 90px Georgia";
    ctx.textAlign = "right";
    ctx.fillText('\u201D', W - 32, H - 80);
  };

  const handleDownload = () => {
    setDownloading(true);
    const canvas = canvasRef.current;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `veritas-${verseRef?.replace(/\s/g, "-") || "verse"}.png`;
    a.click();
    setTimeout(() => setDownloading(false), 800);
  };

  const handleCopyText = () => {
    navigator.clipboard?.writeText(`"${verseText}" — ${verseRef}\n\n#Veritas #LasSagradasEscrituras`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    canvas.toBlob(async (blob) => {
      if (navigator.share && blob) {
        const file = new File([blob], "veritas-verse.png", { type: "image/png" });
        await navigator.share({ title: verseRef, text: `"${verseText}"`, files: [file] }).catch(() => {});
      } else {
        handleCopyText();
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="w-full max-w-sm rounded-t-3xl md:rounded-3xl overflow-hidden"
        style={{ background: "var(--popover-surface)", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "92vh", overflowY: "auto" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <p className="font-cinzel text-sm font-semibold text-white">{t.s1ShareVerse}</p>
            <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{verseRef}</p>
          </div>
          <motion.button aria-label="Close" whileTap={{ scale: 0.9 }} onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "var(--fill-3)" }}>
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
          </motion.button>
        </div>

        <div className="p-4 space-y-4">
          {/* Canvas preview */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <canvas
              ref={canvasRef}
              width={540}
              height={540}
              className="w-full"
              style={{ display: "block" }}
            />
          </div>

          {/* Background selector */}
          <div>
            <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>{t.s1Background}</p>
            <div className="flex gap-2">
              {BACKGROUNDS.map((bg, i) => (
                <motion.button key={bg.id} whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedBg(i)}
                  className="flex-1 h-8 rounded-xl"
                  style={{
                    background: bg.style,
                    border: selectedBg === i ? "2px solid #fbbf24" : "1px solid rgba(255,255,255,0.1)"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div>
            <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>{t.s1Accent}</p>
            <div className="flex gap-2">
              {ACCENT_COLORS.map(color => (
                <motion.button key={color} whileTap={{ scale: 0.9 }}
                  onClick={() => setAccentColor(color)}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{
                    background: color,
                    border: accentColor === color ? "3px solid white" : "2px solid transparent",
                    boxShadow: accentColor === color ? `0 0 10px ${color}66` : "none"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleDownload}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl"
              style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.2)", color: "#00f5ff" }}>
              {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              <span className="text-[10px] font-cinzel">{t.s1Save}</span>
            </motion.button>

            <motion.button whileTap={{ scale: 0.95 }} onClick={handleCopyText}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl"
              style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", color: "#a78bfa" }}>
              {copied ? (
                <>
                  <Check className="w-5 h-5" style={{ color: "#34d399" }} />
                  <span className="text-[10px] font-cinzel" style={{ color: "#34d399" }}>{t.s1CopiedShort}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                  <span className="text-[10px] font-cinzel">{t.s1Copy}</span>
                </>
              )}
            </motion.button>

            <motion.button whileTap={{ scale: 0.95 }} onClick={handleNativeShare}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl"
              style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
              <Share2 className="w-5 h-5" />
              <span className="text-[10px] font-cinzel">{t.s1Share}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}