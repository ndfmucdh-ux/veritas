import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, QrCode, Upload, Loader2, Download } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { base44 } from "@/api/base44Client";
import { TEMPLATES, ELEGANT_THEMES, SEMANTIC_IMAGES, POPULAR_EN, POPULAR_ES } from "@/components/verse/verseArtData";
import QRCodeDisplay from "@/components/verse/QRCodeDisplay";
import VerseSelector from "@/components/verse/VerseSelector";

export default function VerseImageGenerator() {
  const { t, lang } = useLang();
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [bgMode, setBgMode] = useState("gradient"); // "gradient" | "image" | "upload"
  const [selectedImage, setSelectedImage] = useState(null); // url string
  const [uploadedImage, setUploadedImage] = useState(null); // user uploaded url
  const [activeThemeId, setActiveThemeId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const uploadRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const preRef = urlParams.get("ref") || "John 3:16";
  const preText = urlParams.get("text") || "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.";

  const [verseRef, setVerseRef] = useState(preRef);
  const [verseText, setVerseText] = useState(preText);
  const [highlightedWord, setHighlightedWord] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const popularVerses = lang === "es" ? POPULAR_ES : POPULAR_EN;

  const activeBg = bgMode === "gradient" ? template.bg
    : bgMode === "image" && selectedImage ? `url(${selectedImage}) center/cover no-repeat`
    : bgMode === "upload" && uploadedImage ? `url(${uploadedImage}) center/cover no-repeat`
    : template.bg;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadedImage(file_url);
    setBgMode("upload");
    setUploadingImage(false);
  };

  const downloadImage = async () => {
    const imgUrl = bgMode === "image" && selectedImage ? selectedImage
      : bgMode === "upload" && uploadedImage ? uploadedImage
      : null;
    if (imgUrl) {
      // Download the background image with verse overlay as best effort
      const a = document.createElement("a");
      a.href = imgUrl;
      a.download = `veritas-verse-${verseRef.replace(/[^a-z0-9]/gi, "-")}.jpg`;
      a.target = "_blank";
      a.click();
    } else {
      // For gradient: copy text to clipboard and notify
      await navigator.clipboard.writeText(`"${verseText}" — ${verseRef}`);
      alert("Verse text copied! For gradient cards, use a screenshot to save the image.");
    }
  };

  const shareText = `"${verseText}" — ${verseRef}\n\nShared from Veritas Bible`;
  const verseUrl = `${window.location.origin}/read?book=${encodeURIComponent(verseRef.split(" ").slice(0, -1).join(" "))}&chapter=${verseRef.split(" ").pop()?.split(":")[0]}`;

  const copyText = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = async (channel) => {
    const encoded = encodeURIComponent(shareText);
    const urls = {
      whatsapp: `https://wa.me/?text=${encoded}`,
      sms:      `sms:?body=${encoded}`,
      email:    `mailto:?subject=${encodeURIComponent(`Verse: ${verseRef}`)}&body=${encoded}`,
      instagram: null,
    };
    if (channel === "instagram") { copyText(); alert("Text copied! Paste it into your Instagram story or post."); return; }
    if (urls[channel]) window.open(urls[channel], "_blank");
    setShowShareMenu(false);
  };

  const nativeShare = async () => {
    // Try to share the actual background image if one is selected
    const imgUrl = bgMode === "image" && selectedImage ? selectedImage
      : bgMode === "upload" && uploadedImage ? uploadedImage
      : null;

    if (navigator.share) {
      const shareData = { title: `Verse: ${verseRef}`, text: shareText };
      if (imgUrl) {
        try {
          const resp = await fetch(imgUrl);
          const blob = await resp.blob();
          const file = new File([blob], "verse-art.jpg", { type: blob.type || "image/jpeg" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ ...shareData, files: [file] });
            return;
          }
        } catch {}
      }
      await navigator.share(shareData);
    } else {
      setShowShareMenu(v => !v);
    }
  };

  return (
    <div className="md:ml-16 min-h-screen pb-28 px-4 pt-6 block">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">🖼️</span>
          <h1 className="font-cinzel text-xl font-bold text-white">Verse Art</h1>
        </div>

        {/* Preview Card */}
        <div className="relative rounded-3xl overflow-hidden mb-6 flex flex-col items-center justify-center text-center p-8"
          style={{ background: activeBg, minHeight: 280, boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}>
          {(bgMode === "image" || bgMode === "upload") && (
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />
          )}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
          <p className="absolute top-4 left-0 right-0 text-center font-cinzel z-10 select-none"
            style={{ fontSize: 9, letterSpacing: "0.3em", color: template.textColor, opacity: 0.35 }}>VERITAS</p>
          <div className="relative z-10 max-w-xs">
            <p className="italic leading-relaxed mb-4" style={{ fontFamily: template.font, fontSize: "clamp(15px, 4vw, 18px)", color: bgMode !== "gradient" ? "#fff" : template.textColor }}>
              "
              {highlightedWord ? (
                verseText.split(/(\s+)/).map((word, i) =>
                  word.toLowerCase() === highlightedWord.toLowerCase()
                    ? <span key={i} style={{ background: "rgba(251,191,36,0.35)", padding: "2px 4px", borderRadius: "3px" }}>{word}</span>
                    : word
                )
              ) : verseText}
              "
            </p>
            <p className="font-cinzel text-sm font-bold tracking-wider"
              style={{ color: bgMode !== "gradient" ? "rgba(251,191,36,0.9)" : template.refColor }}>
              — {verseRef}
            </p>
          </div>
        </div>

        {/* Verse Reference Selector */}
        <div className="mb-4">
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
            {lang === "es" ? "Seleccionar Versículo" : "Select Verse"}
          </p>
          <VerseSelector lang={lang} onSelect={v => { setVerseRef(v.ref); setVerseText(v.text); }} />
        </div>

        {/* Manual text input */}
        <div className="space-y-3 mb-5">
          <div>
            <p className="text-[10px] font-cinzel uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              {lang === "es" ? "Referencia" : "Reference"}
            </p>
            <input value={verseRef} onChange={e => setVerseRef(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm font-cinzel focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)" }} />
          </div>
          <div>
            <p className="text-[10px] font-cinzel uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              {lang === "es" ? "Texto del Versículo" : "Verse Text"}
            </p>
            <textarea value={verseText} onChange={e => setVerseText(e.target.value)} rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none"
              style={{ fontFamily: template.font, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.82)" }} />
          </div>
          <div>
            <p className="text-[10px] font-cinzel uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              {lang === "es" ? "Resaltar Palabra (Opcional)" : "Highlight Word (Optional)"}
            </p>
            <input value={highlightedWord} onChange={e => setHighlightedWord(e.target.value)} placeholder={lang === "es" ? "ej. 'amor'" : "e.g., 'loved'"}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)" }} />
          </div>
        </div>

        {/* Elegant Pre-designed Themes */}
        <div className="mb-5">
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            {lang === "es" ? "✦ Temas Elegantes" : "✦ Elegant Themes"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {ELEGANT_THEMES.map(theme => (
              <motion.button key={theme.id} whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setActiveThemeId(theme.id);
                  setTemplate(theme.template);
                  if (theme.bgMode === "image" && theme.imageUrl) {
                    setBgMode("image");
                    setSelectedImage(theme.imageUrl);
                  } else {
                    setBgMode("gradient");
                    setSelectedImage(null);
                  }
                }}
                className="flex flex-col items-center gap-1.5">
                <div className="w-full rounded-2xl flex items-end justify-center pb-1.5"
                  style={{
                    aspectRatio: "1/1.1",
                    background: theme.preview,
                    border: activeThemeId === theme.id ? "2px solid #fbbf24" : "2px solid transparent",
                    boxShadow: activeThemeId === theme.id ? "0 0 16px rgba(251,191,36,0.4)" : "none",
                    overflow: "hidden",
                    position: "relative",
                  }}>
                  {theme.imageUrl && (
                    <img src={theme.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  )}
                  <span className="relative z-10 text-base">{theme.emoji}</span>
                </div>
                <span className="text-[8px] font-cinzel text-center leading-tight"
                  style={{ color: activeThemeId === theme.id ? "#fbbf24" : "rgba(255,255,255,0.4)" }}>
                  {theme.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Background mode tabs */}
        <div className="mb-4">
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            {lang === "es" ? "Personalizar Fondo" : "Customize Background"}
          </p>
          <div className="flex gap-2 mb-4">
            {[["gradient","🎨 Colors"],["image","🖼️ Images"],["upload","📷 Upload"]].map(([mode, label]) => (
              <button key={mode} onClick={() => setBgMode(mode)}
                className="flex-1 py-2.5 rounded-xl font-cinzel text-xs transition-all"
                style={{
                  background: bgMode === mode ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)",
                  color: bgMode === mode ? "#fbbf24" : "rgba(255,255,255,0.4)",
                  border: bgMode === mode ? "1px solid rgba(251,191,36,0.35)" : "1px solid rgba(255,255,255,0.07)"
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Gradient picker */}
          {bgMode === "gradient" && (
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
          )}

          {/* Semantic image picker */}
          {bgMode === "image" && (
            <div className="grid grid-cols-4 gap-2">
              {SEMANTIC_IMAGES.map(img => (
                <button key={img.id} onClick={() => setSelectedImage(img.url)}
                  className="relative rounded-2xl overflow-hidden"
                  style={{ aspectRatio: "1/1", border: selectedImage === img.url ? "2px solid #fbbf24" : "2px solid transparent",
                    boxShadow: selectedImage === img.url ? "0 0 14px rgba(251,191,36,0.4)" : "none" }}>
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.25)" }} />
                  <p className="absolute bottom-1 left-0 right-0 text-center font-cinzel"
                    style={{ fontSize: "7px", color: "rgba(255,255,255,0.8)" }}>{img.label}</p>
                  {selectedImage === img.url && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "#fbbf24" }}>
                      <Check className="w-2.5 h-2.5 text-black" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Upload */}
          {bgMode === "upload" && (
            <div className="space-y-3">
              <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              {/* Uploaded image in same grid style as semantic images */}
              <div className="grid grid-cols-4 gap-2">
                {uploadedImage && (
                  <button onClick={() => { setBgMode("upload"); setSelectedImage(null); }}
                    className="relative rounded-2xl overflow-hidden col-span-2"
                    style={{ aspectRatio: "1/1", border: "2px solid #fbbf24", boxShadow: "0 0 14px rgba(251,191,36,0.4)" }}>
                    <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "#fbbf24" }}>
                      <Check className="w-2.5 h-2.5 text-black" />
                    </div>
                    <p className="absolute bottom-1 left-0 right-0 text-center font-cinzel"
                      style={{ fontSize: "7px", color: "rgba(255,255,255,0.9)" }}>My Image</p>
                  </button>
                )}
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => uploadRef.current?.click()}
                  disabled={uploadingImage}
                  className="relative rounded-2xl flex flex-col items-center justify-center gap-1"
                  style={{ aspectRatio: "1/1", background: "rgba(251,191,36,0.07)", border: "1px dashed rgba(251,191,36,0.35)" }}>
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#fbbf24" }} /> : <Upload className="w-4 h-4" style={{ color: "#fbbf24" }} />}
                  <span className="font-cinzel text-[8px]" style={{ color: "#fbbf24" }}>
                    {uploadedImage ? (lang === "es" ? "Cambiar" : "Change") : (lang === "es" ? "Subir" : "Upload")}
                  </span>
                </motion.button>
              </div>
              <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.25)" }}>
                {lang === "es" ? "Tu imagen se usará como fondo" : "Your image will be used as the background"}
              </p>
            </div>
          )}
        </div>

        {/* Quick pick */}
        <div className="mb-6">
          <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
            {lang === "es" ? "Selección Rápida" : "Quick Pick"}
          </p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {popularVerses.map(v => (
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
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Download */}
          <motion.button whileTap={{ scale: 0.96 }} onClick={downloadImage}
            className="flex items-center justify-center gap-2.5 py-4 rounded-2xl font-cinzel text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.08))", border: "1px solid rgba(251,191,36,0.35)", color: "#fbbf24" }}>
            <Download className="w-5 h-5" />
            Download
          </motion.button>
          {/* Share */}
          <div className="relative">
            <motion.button whileTap={{ scale: 0.96 }} onClick={nativeShare}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-cinzel text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.65)" }}>
              <Share2 className="w-5 h-5" />
              {t.share}
            </motion.button>
            <AnimatePresence>
              {showShareMenu && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl p-3 z-30 space-y-1.5"
                  style={{ background: "rgba(10,15,30,0.97)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                  {[
                    { id: "whatsapp", label: "WhatsApp",  color: "#25D366" },
                    { id: "sms",      label: "SMS",        color: "#00f5ff" },
                    { id: "email",    label: "Email",      color: "#a78bfa" },
                    { id: "instagram",label: "Instagram",  color: "#f472b6" },
                  ].map(({ id, label, color }) => (
                    <button key={id} onClick={() => shareVia(id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-inter text-left"
                      style={{ background: "rgba(255,255,255,0.04)" }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span style={{ color: "rgba(255,255,255,0.7)" }}>{label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Copy */}
          <motion.button whileTap={{ scale: 0.96 }} onClick={copyText}
            className="flex items-center justify-center gap-2.5 py-4 rounded-2xl font-cinzel text-sm font-semibold"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.6)" }}>
            {copied ? <Check className="w-5 h-5" style={{ color: "#34d399" }} /> : <Copy className="w-5 h-5" />}
            {copied ? "Copied!" : "Copy"}
          </motion.button>
          {/* QR */}
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowQR(true)}
            className="flex items-center justify-center gap-2.5 py-4 rounded-2xl font-cinzel text-sm font-semibold"
            style={{ background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.15)", color: "#00f5ff" }}>
            <QrCode className="w-5 h-5" />
            QR Code
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showQR && <QRCodeDisplay url={verseUrl} verseRef={verseRef} onClose={() => setShowQR(false)} />}
      </AnimatePresence>
    </div>
  );
}