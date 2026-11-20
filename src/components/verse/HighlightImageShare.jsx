import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, QrCode, Image, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const LOGO_URL = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";
const APP_URL = "https://luxveritas.app";

const STYLES = [
  { id: "gold",   label: "Gold",   bg: ["#1a1205", "#2a1e08"], accent: "#c9a84c", text: "#f5ead8" },
  { id: "cyan",   label: "Sapphire", bg: ["#030f18", "#061829"], accent: "#00f5ff", text: "#e0f7ff" },
  { id: "purple", label: "Amethyst", bg: ["#0d0818", "#17082e"], accent: "#a78bfa", text: "#ede9ff" },
  { id: "night",  label: "Midnight", bg: ["#08090f", "#0f1120"], accent: "#fbbf24", text: "#f1f0ea" },
];

// QR code generator using a free API
function getQrUrl(text, color) {
  const hex = color.replace("#", "");
  return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}&color=${hex}&bgcolor=1a1205&format=png&margin=4`;
}

export default function HighlightImageShare({ highlight, onClose }) {
  const canvasRef = useRef(null);
  const [style, setStyle] = useState(STYLES[0]);
  const [showQr, setShowQr] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rendered, setRendered] = useState(false);

  const verse = highlight?.verse_ref || "John 3:16";
  const text  = highlight?.text || highlight?.verse_text || "";

  useEffect(() => {
    drawCanvas();
  }, [style, showQr]);

  const drawCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setRendering(true);

    const ctx = canvas.getContext("2d");
    const W = 1080, H = 1080;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, style.bg[0]);
    grad.addColorStop(1, style.bg[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle cross pattern watermark
    ctx.strokeStyle = `${style.accent}08`;
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Glow orb top-right
    const orb = ctx.createRadialGradient(W * 0.8, H * 0.15, 0, W * 0.8, H * 0.15, 380);
    orb.addColorStop(0, `${style.accent}22`);
    orb.addColorStop(1, "transparent");
    ctx.fillStyle = orb;
    ctx.fillRect(0, 0, W, H);

    // Top divider line
    ctx.strokeStyle = `${style.accent}55`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(80, 100); ctx.lineTo(W - 80, 100); ctx.stroke();

    // VERITAS label
    ctx.fillStyle = `${style.accent}99`;
    ctx.font = "bold 26px 'Arial'";
    ctx.letterSpacing = "8px";
    ctx.textAlign = "center";
    ctx.fillText("V E R I T A S", W / 2, 72);

    // ornament
    ctx.fillStyle = style.accent;
    ctx.font = "28px serif";
    ctx.fillText("✦", W / 2, 148);

    // Verse text — word-wrap
    ctx.fillStyle = style.text;
    ctx.font = `italic ${text.length > 120 ? "44px" : "52px"} Georgia, serif`;
    ctx.textAlign = "center";
    const words = `"${text}"`.split(" ");
    const maxW = W - 200;
    let line = "", lines = [], lh = text.length > 120 ? 62 : 72;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
      else line = test;
    }
    if (line) lines.push(line);
    const totalH = lines.length * lh;
    let startY = H / 2 - totalH / 2 + 20;
    for (const l of lines) { ctx.fillText(l, W / 2, startY); startY += lh; }

    // Reference
    ctx.fillStyle = style.accent;
    ctx.font = "bold 32px Arial";
    ctx.letterSpacing = "3px";
    ctx.fillText(`— ${verse} —`, W / 2, startY + 44);

    // Bottom divider
    ctx.strokeStyle = `${style.accent}55`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(80, H - 100); ctx.lineTo(W - 80, H - 100); ctx.stroke();

    // App URL watermark
    ctx.fillStyle = `${style.accent}66`;
    ctx.font = "22px Arial";
    ctx.letterSpacing = "2px";
    ctx.fillText("luxveritas.app", W / 2, H - 64);

    // Logo circle
    const logo = new window.Image();
    logo.crossOrigin = "anonymous";
    logo.src = LOGO_URL;
    await new Promise(r => { logo.onload = r; logo.onerror = r; });
    const lr = 36;
    ctx.save();
    ctx.beginPath(); ctx.arc(W / 2, H - 64 - 48, lr, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, W / 2 - lr, H - 64 - 48 - lr, lr * 2, lr * 2);
    ctx.restore();
    // Logo border
    ctx.strokeStyle = style.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(W / 2, H - 64 - 48, lr + 1, 0, Math.PI * 2); ctx.stroke();

    // QR code overlay (bottom-right corner)
    if (showQr) {
      const qrImg = new window.Image();
      qrImg.crossOrigin = "anonymous";
      qrImg.src = getQrUrl(APP_URL, style.accent);
      await new Promise(r => { qrImg.onload = r; qrImg.onerror = r; });
      const qrSize = 160;
      const qrX = W - qrSize - 56;
      const qrY = H - qrSize - 120;
      // background pill for QR
      ctx.fillStyle = "rgba(10,8,5,0.85)";
      const pad = 14;
      roundRect(ctx, qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2 + 26, 16);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      ctx.fillStyle = `${style.accent}cc`;
      ctx.font = "18px Arial";
      ctx.letterSpacing = "1px";
      ctx.textAlign = "center";
      ctx.fillText("Scan to Read", qrX + qrSize / 2, qrY + qrSize + 18);
    }

    setRendering(false);
    setRendered(true);
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `veritas-${verse.replace(/\s+/g, "-")}.png`;
    a.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async blob => {
      if (navigator.share && blob) {
        const file = new File([blob], "veritas-verse.png", { type: "image/png" });
        await navigator.share({ files: [file], title: verse, text: `"${text}" — ${verse}` }).catch(() => {});
      } else {
        await navigator.clipboard.writeText(`"${text}" — ${verse}\n\n${APP_URL}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }, "image/png");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <div>
          <p className="font-cinzel text-sm font-bold text-white">Verse Art</p>
          <p className="font-inter text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{verse}</p>
        </div>
        <button aria-label="Close" onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Canvas preview */}
      <div className="flex-1 flex items-center justify-center px-5 overflow-hidden">
        <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${style.accent}33`, boxShadow: `0 0 40px ${style.accent}22` }}>
          <canvas ref={canvasRef} className="w-full h-full object-cover" />
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
              <Loader2 className="w-6 h-6 animate-spin text-white/60" />
            </div>
          )}
        </div>
      </div>

      {/* Style selector */}
      <div className="px-5 pt-3 pb-2 flex gap-2 flex-shrink-0">
        {STYLES.map(s => (
          <button key={s.id} onClick={() => setStyle(s)}
            className="flex-1 py-2 rounded-xl text-xs font-cinzel transition-all"
            style={{
              background: style.id === s.id ? `${s.accent}22` : "rgba(255,255,255,0.05)",
              border: style.id === s.id ? `1px solid ${s.accent}66` : "1px solid rgba(255,255,255,0.08)",
              color: style.id === s.id ? s.accent : "rgba(255,255,255,0.4)",
            }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* QR toggle */}
      <div className="px-5 pb-2 flex-shrink-0">
        <button onClick={() => setShowQr(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-inter transition-all"
          style={{
            background: showQr ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.04)",
            border: showQr ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(255,255,255,0.08)",
            color: showQr ? "#c9a84c" : "rgba(255,255,255,0.4)",
          }}>
          <QrCode className="w-3.5 h-3.5" />
          {showQr ? "QR Code On" : "Add QR Code"}
        </button>
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-8 grid grid-cols-2 gap-3 flex-shrink-0">
        <button onClick={handleDownload}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl font-inter text-sm font-semibold"
          style={{ background: style.accent, color: "#0f0d0a" }}>
          <Download className="w-4 h-4" />
          Save Image
        </button>
        <button onClick={handleShare}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl font-inter text-sm font-semibold"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>
          {copied ? <Check className="w-4 h-4" style={{ color: "#34d399" }} /> : <Share2 className="w-4 h-4" />}
          {copied ? "Copied!" : "Share"}
        </button>
      </div>
    </motion.div>
  );
}