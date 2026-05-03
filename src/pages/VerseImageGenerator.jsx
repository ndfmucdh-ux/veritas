import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, MessageCircle, Mail, Instagram, QrCode, X } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

const TEMPLATES = [
  { id: "dark_gold",  label: "Gold",     bg: "linear-gradient(135deg, #0a0f1e 0%, #1a1400 100%)",        textColor: "#fbbf24",           refColor: "#f59e0b",              font: "'Cinzel', serif" },
  { id: "midnight",   label: "Midnight", bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", textColor: "#e0e7ff",      refColor: "#a78bfa",              font: "'Playfair Display', serif" },
  { id: "sunrise",    label: "Sunrise",  bg: "linear-gradient(135deg, #f83600 0%, #f9d423 100%)",          textColor: "#fff7ed",           refColor: "rgba(255,255,255,0.85)", font: "'Cinzel', serif" },
  { id: "ocean",      label: "Ocean",    bg: "linear-gradient(135deg, #006994 0%, #00b4db 100%)",          textColor: "#f0f9ff",           refColor: "rgba(255,255,255,0.8)", font: "'Playfair Display', serif" },
  { id: "forest",     label: "Forest",   bg: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",          textColor: "#f0fdf4",           refColor: "rgba(255,255,255,0.75)", font: "'Cinzel', serif" },
  { id: "rose",       label: "Rose",     bg: "linear-gradient(135deg, #f43f5e 0%, #fda4af 100%)",          textColor: "#fff1f2",           refColor: "rgba(255,255,255,0.8)", font: "'Playfair Display', serif" },
  { id: "parchment",  label: "Parchment",bg: "linear-gradient(135deg, #fdf6e3 0%, #f5e6c8 100%)",          textColor: "#5c3d11",           refColor: "#92400e",              font: "'Playfair Display', serif" },
  { id: "cosmic",     label: "Cosmic",   bg: "linear-gradient(135deg, #1a0533 0%, #0d1b4b 50%, #1a0533 100%)", textColor: "#e9d5ff",      refColor: "#c084fc",              font: "'Cinzel', serif" },
];

const POPULAR_VERSES = [
  { ref: "John 3:16",       text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
  { ref: "Philippians 4:13",text: "I can do all things through Christ which strengtheneth me." },
  { ref: "Psalm 23:1",      text: "The LORD is my shepherd; I shall not want." },
  { ref: "Isaiah 40:31",    text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles." },
  { ref: "Romans 8:28",     text: "And we know that all things work together for good to them that love God." },
  { ref: "Jeremiah 29:11",  text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you." },
];

function QRCodeDisplay({ url, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Simple QR-like placeholder — real QR via a free API
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = "#000";
    ctx.font = "10px monospace";
    ctx.fillText("Scan to open verse", 16, 120);
    ctx.fillText(url.slice(0, 28), 16, 135);
  }, [url]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=0a0f1e&color=fbbf24&margin=10`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className="rounded-3xl p-6 flex flex-col items-center gap-4 max-w-xs w-full"
        style={{ background: "rgba(10,15,30,0.98)", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={e => e.stopPropagation()}
      >
        <p className="font-cinzel text-sm font-semibold text-white/80">Scan to Open Verse</p>
        <img
          src={qrUrl}
          alt="QR Code"
          width={200}
          height={200}
          className="rounded-2xl"
        />
        <p className="text-xs font-inter text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
          Scan with any camera to open this verse in Veritas
        </p>
        <button onClick={onClose}
          className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl font-cinzel"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
          <X className="w-3.5 h-3.5" /> Close
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function VerseImageGenerator() {
  const { t } = useLang();
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [verseRef, setVerseRef] = useState("John 3:16");
  const [verseText, setVerseText] = useState("For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const shareText = `"${verseText}" — ${verseRef}\n\nShared from Veritas Bible`;
  const verseUrl = `${window.location.origin}/read?book=${encodeURIComponent(verseRef.split(" ").slice(0, -1).join(" "))}&chapter=${verseRef.split(" ").pop()?.split(":")[0]}`;

  const copyText = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (channel) => {
    const encoded = encodeURIComponent(shareText);
    const urls = {
      whatsapp: `https://wa.me/?text=${encoded}`,
      sms:      `sms:?body=${encoded}`,
      email:    `mailto:?subject=${encodeURIComponent(`Verse: ${verseRef}`)}&body=${encoded}`,
      instagram: null, // Instagram doesn't support deep links for text sharing
    };
    if (channel === "instagram") {
      copyText();
      alert("Text copied! Paste it into your Instagram story or post.");
      return;
    }
    if (urls[channel]) window.open(urls[channel], "_blank");
    setShowShareMenu(false);
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: `Verse: ${verseRef}`, text: shareText, url: verseUrl });
    } else {
      setShowShareMenu(v => !v);
    }
  };

  return (
    <div className="md:ml-16 min-h-screen pb-28 px-4 pt-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">🖼️</span>
          <h1 className="font-cinzel text-xl font-bold text-white">Verse Art</h1>
        </div>

        {/* Preview Card */}
        <div
          className="relative rounded-3xl overflow-hidden mb-6 flex flex-col items-center justify-center text-center p-8"
          style={{ background: template.bg, minHeight: 280, boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}
        >
          {/* Subtle grain overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
          <p className="absolute top-4 left-0 right-0 text-center font-cinzel z-10 select-none"
            style={{ fontSize: 9, letterSpacing: "0.3em", color: template.textColor, opacity: 0.3 }}>VERITAS</p>

          <div className="relative z-10 max-w-xs">
            <p className="italic leading-relaxed mb-4" style={{ fontFamily: template.font, fontSize: "clamp(15px, 4vw, 18px)", color: template.textColor }}>
              "{verseText}"
            </p>
            <p className="font-cinzel text-sm font-bold tracking-wider" style={{ color: template.refColor }}>
              — {verseRef}
            </p>
          </div>
        </div>

        {/* Template picker */}
        <div className="mb-5">
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>Template</p>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
            {TEMPLATES.map(tmpl => (
              <button key={tmpl.id} onClick={() => setTemplate(tmpl)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-2xl transition-all"
                  style={{ background: tmpl.bg, border: template.id === tmpl.id ? "2px solid #fbbf24" : "2px solid transparent",
                    boxShadow: template.id === tmpl.id ? "0 0 12px rgba(251,191,36,0.35)" : "none" }} />
                <span className="text-[9px] font-inter whitespace-nowrap"
                  style={{ color: template.id === tmpl.id ? "#fbbf24" : "rgba(255,255,255,0.3)" }}>{tmpl.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Verse inputs */}
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
              className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none"
              style={{ fontFamily: template.font, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.82)" }} />
          </div>
        </div>

        {/* Quick pick */}
        <div className="mb-6">
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Quick Pick</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {POPULAR_VERSES.map(v => (
              <button key={v.ref} onClick={() => { setVerseRef(v.ref); setVerseText(v.text); }}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-cinzel transition-all"
                style={{
                  background: verseRef === v.ref ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
                  color: verseRef === v.ref ? "#fbbf24" : "rgba(255,255,255,0.4)",
                  border: verseRef === v.ref ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.07)",
                }}>
                {v.ref}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Share */}
          <div className="relative">
            <motion.button whileTap={{ scale: 0.96 }} onClick={nativeShare}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-cinzel text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(251,191,36,0.08))", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
              <Share2 className="w-4 h-4" />
              {t.share}
            </motion.button>

            {/* Share menu (fallback when no native share) */}
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl p-3 z-30 space-y-1.5"
                  style={{ background: "rgba(10,15,30,0.97)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}
                >
                  {[
                    { id: "whatsapp",  label: "WhatsApp",  Icon: MessageCircle, color: "#25D366" },
                    { id: "sms",       label: "SMS",        Icon: MessageCircle, color: "#00f5ff" },
                    { id: "email",     label: "Email",      Icon: Mail,          color: "#a78bfa" },
                    { id: "instagram", label: "Instagram",  Icon: Instagram,     color: "#f472b6" },
                  ].map(({ id, label, Icon, color }) => (
                    <button key={id} onClick={() => shareVia(id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-inter text-left"
                      style={{ background: "rgba(255,255,255,0.04)" }}>
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                      <span style={{ color: "rgba(255,255,255,0.7)" }}>{label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Copy */}
          <motion.button whileTap={{ scale: 0.96 }} onClick={copyText}
            className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-cinzel text-sm font-semibold"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.6)" }}>
            {copied ? <Check className="w-4 h-4" style={{ color: "#34d399" }} /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </motion.button>
        </div>

        {/* QR Code button */}
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowQR(true)}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl font-cinzel text-sm"
          style={{ background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.15)", color: "#00f5ff" }}>
          <QrCode className="w-4 h-4" />
          Share QR Code
        </motion.button>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && <QRCodeDisplay url={verseUrl} onClose={() => setShowQR(false)} />}
      </AnimatePresence>
    </div>
  );
}