import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, MessageCircle, Mail, Instagram, QrCode, X, ChevronDown, Upload, Search, Image as ImageIcon, Loader2, Download } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { BIBLE_BOOKS, getTranslatedBookName } from "@/lib/bibleData";
import { base44 } from "@/api/base44Client";

const TEMPLATES = [
  // Original gradients
  { id: "dark_gold",  label: "Gold",      bg: "linear-gradient(135deg, #0a0f1e 0%, #1a1400 100%)",             textColor: "#fbbf24",             refColor: "#f59e0b",              font: "'Cinzel', serif" },
  { id: "midnight",   label: "Midnight",  bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", textColor: "#e0e7ff",             refColor: "#a78bfa",              font: "'Playfair Display', serif" },
  { id: "sunrise",    label: "Sunrise",   bg: "linear-gradient(135deg, #f83600 0%, #f9d423 100%)",              textColor: "#fff7ed",             refColor: "rgba(255,255,255,0.85)", font: "'Cinzel', serif" },
  { id: "ocean",      label: "Ocean",     bg: "linear-gradient(135deg, #006994 0%, #00b4db 100%)",              textColor: "#f0f9ff",             refColor: "rgba(255,255,255,0.8)", font: "'Playfair Display', serif" },
  { id: "forest",     label: "Forest",    bg: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",              textColor: "#f0fdf4",             refColor: "rgba(255,255,255,0.75)", font: "'Cinzel', serif" },
  { id: "rose",       label: "Rose",      bg: "linear-gradient(135deg, #f43f5e 0%, #fda4af 100%)",              textColor: "#fff1f2",             refColor: "rgba(255,255,255,0.8)", font: "'Playfair Display', serif" },
  { id: "parchment",  label: "Parchment", bg: "linear-gradient(135deg, #fdf6e3 0%, #f5e6c8 100%)",              textColor: "#5c3d11",             refColor: "#92400e",              font: "'Playfair Display', serif" },
  { id: "cosmic",     label: "Cosmic",    bg: "linear-gradient(135deg, #1a0533 0%, #0d1b4b 50%, #1a0533 100%)", textColor: "#e9d5ff",             refColor: "#c084fc",              font: "'Cinzel', serif" },
];

// Pre-designed elegant themes — each bundles bg mode + image + gradient + font
const ELEGANT_THEMES = [
  {
    id: "holy_light",
    label: "Holy Light",
    emoji: "☀️",
    preview: "linear-gradient(135deg, #fff8e7 0%, #fde68a 100%)",
    bgMode: "image",
    imageUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80",
    template: { bg: "", textColor: "#fffbeb", refColor: "#fbbf24", font: "'Cinzel', serif" },
  },
  {
    id: "deep_prayer",
    label: "Deep Prayer",
    emoji: "🙏",
    preview: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)",
    bgMode: "gradient",
    imageUrl: null,
    template: { bg: "linear-gradient(160deg, #0d0a20 0%, #1a1040 50%, #0d0a20 100%)", textColor: "#e9d5ff", refColor: "#a78bfa", font: "'Playfair Display', serif" },
  },
  {
    id: "mountain_faith",
    label: "Mountain Faith",
    emoji: "⛰️",
    preview: "linear-gradient(135deg, #1a2540 0%, #4a6fa5 100%)",
    bgMode: "image",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    template: { bg: "", textColor: "#f0f9ff", refColor: "#93c5fd", font: "'Cinzel', serif" },
  },
  {
    id: "ancient_scroll",
    label: "Ancient Scroll",
    emoji: "📜",
    preview: "linear-gradient(135deg, #fdf6e3 0%, #d4a96a 100%)",
    bgMode: "gradient",
    imageUrl: null,
    template: { bg: "linear-gradient(160deg, #fdf6e3 0%, #f5e6c8 60%, #e8d5a3 100%)", textColor: "#4a2c0a", refColor: "#92400e", font: "'Playfair Display', serif" },
  },
  {
    id: "still_waters",
    label: "Still Waters",
    emoji: "🌊",
    preview: "linear-gradient(135deg, #0369a1 0%, #38bdf8 100%)",
    bgMode: "image",
    imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80",
    template: { bg: "", textColor: "#f0f9ff", refColor: "#7dd3fc", font: "'Playfair Display', serif" },
  },
  {
    id: "evening_peace",
    label: "Evening Peace",
    emoji: "🌙",
    preview: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)",
    bgMode: "image",
    imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
    template: { bg: "", textColor: "#ede9fe", refColor: "#c084fc", font: "'Cinzel', serif" },
  },
  {
    id: "garden_hope",
    label: "Garden Hope",
    emoji: "🌸",
    preview: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
    bgMode: "image",
    imageUrl: "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=800&q=80",
    template: { bg: "", textColor: "#f0fdf4", refColor: "#86efac", font: "'Playfair Display', serif" },
  },
  {
    id: "fire_spirit",
    label: "Holy Fire",
    emoji: "🔥",
    preview: "linear-gradient(135deg, #7c1010 0%, #ef4444 50%, #f97316 100%)",
    bgMode: "gradient",
    imageUrl: null,
    template: { bg: "linear-gradient(160deg, #1c0505 0%, #7c1010 40%, #3d0c0c 100%)", textColor: "#fef2f2", refColor: "#fca5a5", font: "'Cinzel', serif" },
  },
];

const SEMANTIC_IMAGES = [
  { id: "mountains",  label: "Mountains",  url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80" },
  { id: "ocean",      label: "Ocean",      url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80" },
  { id: "sunrise",    label: "Sunrise",    url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80" },
  { id: "forest",     label: "Forest",     url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80" },
  { id: "starfield",  label: "Stars",      url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80" },
  { id: "desert",     label: "Desert",     url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80" },
  { id: "wheat",      label: "Harvest",    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80" },
  { id: "candle",     label: "Candle",     url: "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=800&q=80" },
  { id: "dove",       label: "Dove",       url: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80" },
  { id: "waterfall",  label: "Waterfall",  url: "https://images.unsplash.com/photo-1548182294-b8c6b0e0e451?w=800&q=80" },
  { id: "chapel",     label: "Chapel",     url: "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=800&q=80" },
  { id: "lily",       label: "Lily",       url: "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=800&q=80" },
];

const LOGO_URL = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";

const POPULAR_EN = [
  { ref: "John 3:16",        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
  { ref: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me." },
  { ref: "Psalm 23:1",       text: "The LORD is my shepherd; I shall not want." },
  { ref: "Isaiah 40:31",     text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles." },
  { ref: "Romans 8:28",      text: "And we know that all things work together for good to them that love God." },
  { ref: "Jeremiah 29:11",   text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you." },
];

const POPULAR_ES = [
  { ref: "Juan 3:16",         text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna." },
  { ref: "Filipenses 4:13",   text: "Todo lo puedo en Cristo que me fortalece." },
  { ref: "Salmo 23:1",        text: "Jehová es mi pastor; nada me faltará." },
  { ref: "Isaías 40:31",      text: "Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas." },
  { ref: "Romanos 8:28",      text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien." },
  { ref: "Jeremías 29:11",    text: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal." },
];

function QRCodeDisplay({ url, verseRef, onClose }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}&bgcolor=0a0d1a&color=c9a84c&margin=12&qzone=2`;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className="rounded-3xl p-6 flex flex-col items-center gap-5 max-w-xs w-full"
        style={{ background: "linear-gradient(160deg, #0d1120 0%, #080c18 100%)", border: "1px solid rgba(201,168,76,0.25)", boxShadow: "0 0 60px rgba(201,168,76,0.1), 0 24px 80px rgba(0,0,0,0.8)" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center gap-2">
          <img src={LOGO_URL} alt="Veritas" width={44} height={44} className="rounded-xl" style={{ border: "1.5px solid rgba(201,168,76,0.4)" }} />
          <p className="font-cinzel text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "rgba(201,168,76,0.7)" }}>Veritas · The Word</p>
        </div>
        <div className="relative rounded-2xl overflow-hidden p-1" style={{ background: "#0a0d1a", border: "1.5px solid rgba(201,168,76,0.3)" }}>
          <img src={qrUrl} alt="QR Code" width={220} height={220} className="block rounded-xl" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-lg overflow-hidden" style={{ width: 44, height: 44, border: "2px solid #0a0d1a", background: "#0a0d1a" }}>
              <img src={LOGO_URL} alt="" width={44} height={44} style={{ borderRadius: 8, objectFit: "cover" }} />
            </div>
          </div>
        </div>
        {verseRef && <p className="font-cinzel text-sm font-bold tracking-wider" style={{ color: "#c9a84c" }}>— {verseRef} —</p>}
        <p className="text-[11px] font-inter text-center" style={{ color: "rgba(255,255,255,0.3)" }}>Scan with any camera to open in Veritas</p>
        <button onClick={onClose} className="flex items-center gap-2 text-xs px-5 py-2.5 rounded-xl font-cinzel transition-all"
          style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "rgba(201,168,76,0.7)" }}>
          <X className="w-3.5 h-3.5" /> Close
        </button>
      </motion.div>
    </motion.div>
  );
}

// Verse reference dropdown with book/chapter/verse selector
function VerseSelector({ onSelect, lang }) {
  const [open, setOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredBooks = BIBLE_BOOKS.filter(b =>
    getTranslatedBookName(b.name, lang).toLowerCase().includes(bookSearch.toLowerCase())
  );

  const fetchAndSelect = async (book, chapter, verse) => {
    setLoadingVerse(true);
    setOpen(false);
    try {
      const res = await base44.functions.invoke("getChapter", { book, chapter, translation: lang === "es" ? "RVR1960" : "KJV" });
      const v = res.data?.verses?.find(v => v.verse === verse);
      if (v) {
        const bookDisplay = getTranslatedBookName(book, lang);
        onSelect({
          ref: `${bookDisplay} ${chapter}:${verse}`,
          text: v.text,
        });
      }
    } finally {
      setLoadingVerse(false);
      setSelectedBook(null);
      setSelectedChapter(null);
    }
  };

  const bookData = selectedBook ? BIBLE_BOOKS.find(b => b.name === selectedBook) : null;
  const totalChapters = bookData?.chapters || 1;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-cinzel text-sm transition-all"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)" }}>
        <span className="flex items-center gap-2">
          <BookIcon className="w-4 h-4" style={{ color: "#fbbf24" }} />
          {loadingVerse ? "Loading…" : lang === "es" ? "Seleccionar versículo…" : "Select a verse…"}
        </span>
        <ChevronDown className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden"
            style={{ background: "rgba(6,9,20,0.99)", border: "1px solid rgba(251,191,36,0.2)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)", maxHeight: "60vh", overflowY: "auto" }}>

            {/* Search books */}
            <div className="sticky top-0 px-3 py-2.5" style={{ background: "rgba(6,9,20,0.99)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
                <input value={bookSearch} onChange={e => setBookSearch(e.target.value)}
                  placeholder={lang === "es" ? "Buscar libro…" : "Search book…"}
                  className="flex-1 bg-transparent text-sm font-inter focus:outline-none"
                  style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)" }} />
              </div>
            </div>

            <div className="p-3">
              {!selectedBook && (
                <>
                  <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2 px-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {lang === "es" ? "Libro" : "Book"}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {filteredBooks.map(b => (
                      <button key={b.name} onClick={() => { setSelectedBook(b.name); setBookSearch(""); }}
                        className="px-2 py-2 rounded-xl text-xs font-cinzel text-left transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        {getTranslatedBookName(b.name, lang)}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedBook && !selectedChapter && (
                <>
                  <button onClick={() => setSelectedBook(null)} className="flex items-center gap-1 text-xs font-cinzel mb-3" style={{ color: "#fbbf24" }}>
                    ← {lang === "es" ? "Volver" : "Back"}
                  </button>
                  <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2 px-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {getTranslatedBookName(selectedBook, lang)} — {lang === "es" ? "Capítulo" : "Chapter"}
                  </p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: totalChapters }, (_, i) => i + 1).map(ch => (
                      <button key={ch} onClick={() => setSelectedChapter(ch)}
                        className="aspect-square rounded-xl text-xs font-cinzel flex items-center justify-center transition-all"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        {ch}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedBook && selectedChapter && (
                <>
                  <button onClick={() => setSelectedChapter(null)} className="flex items-center gap-1 text-xs font-cinzel mb-3" style={{ color: "#fbbf24" }}>
                    ← {lang === "es" ? "Volver" : "Back"}
                  </button>
                  <p className="text-[9px] font-cinzel uppercase tracking-widest mb-2 px-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {getTranslatedBookName(selectedBook, lang)} {selectedChapter} — {lang === "es" ? "Versículo" : "Verse"}
                  </p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {Array.from({ length: 40 }, (_, i) => i + 1).map(v => (
                      <button key={v} onClick={() => fetchAndSelect(selectedBook, selectedChapter, v)}
                        className="aspect-square rounded-xl text-xs font-cinzel flex items-center justify-center transition-all"
                        style={{ background: "rgba(251,191,36,0.07)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(251,191,36,0.15)" }}>
                        {v}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple icon
function BookIcon({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}

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