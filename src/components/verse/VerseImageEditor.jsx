import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Copy, Check, Share2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function VerseImageEditor({ verse_ref, onClose }) {
  const [template, setTemplate] = useState("elegant");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const templates = [
    { id: "elegant", label: "Elegant", color: "#fbbf24" },
    { id: "modern", label: "Modern", color: "#00f5ff" },
    { id: "minimal", label: "Minimal", color: "#a78bfa" },
    { id: "artistic", label: "Artistic", color: "#f472b6" }
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateVerseImage", {
        verse_ref,
        style_template: template
      });
      setImageUrl(res.data.image_url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-3xl w-full max-w-md p-6"
        style={{
          background: "linear-gradient(135deg, rgba(6,10,20,0.98) 0%, rgba(10,15,30,0.95) 100%)",
          border: "1px solid rgba(0,245,255,0.15)"
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-cinzel text-lg font-bold text-white">Share Verse</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!imageUrl ? (
          <>
            <p className="text-xs text-white/50 mb-4">{verse_ref}</p>
            
            <div className="mb-4">
              <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2 text-white/40">Style</p>
              <div className="grid grid-cols-4 gap-2">
                {templates.map(t => (
                  <motion.button
                    key={t.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTemplate(t.id)}
                    className="py-2 rounded-xl text-[10px] font-cinzel transition-all"
                    style={{
                      background: template === t.id ? `${t.color}22` : "rgba(255,255,255,0.05)",
                      color: template === t.id ? t.color : "rgba(255,255,255,0.4)",
                      border: template === t.id ? `1px solid ${t.color}44` : "1px solid transparent"
                    }}
                  >
                    {t.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 rounded-xl font-cinzel text-white flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #00f5ff, #006bb3)",
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
              {loading && "..."}
            </motion.button>
          </>
        ) : (
          <>
            <img src={imageUrl} alt="verse" className="w-full rounded-xl mb-4 aspect-square object-cover" />
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyUrl}
                className="flex-1 py-2 rounded-xl text-sm font-inter flex items-center justify-center gap-2"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)" }}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-2 rounded-xl text-sm font-cinzel font-bold text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #00f5ff, #006bb3)" }}
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}