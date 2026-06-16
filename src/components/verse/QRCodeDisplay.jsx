import { motion } from "framer-motion";
import { X } from "lucide-react";
import { LOGO_URL } from "@/components/verse/verseArtData";

export default function QRCodeDisplay({ url, verseRef, onClose }) {
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