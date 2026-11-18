import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Loader2, ZoomIn } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

const VW = 280;
const NUDGE = 12;

// Crop / reposition / zoom editor. Returns a JPEG File of exactly what is framed.
export default function PhotoEditorModal({ src, aspect = 1, round = false, outWidth = 640, fileName = "photo.jpg", onCancel, onSave }) {
  const { t } = useLang();
  const VH = Math.round(VW / aspect);
  const imgRef = useRef(null);
  const drag = useRef(null);
  const [nat, setNat] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  const scale = nat ? Math.max(VW / nat.w, VH / nat.h) * zoom : 1;
  const dw = nat ? nat.w * scale : 0;
  const dh = nat ? nat.h * scale : 0;

  const clamp = (p, z = zoom) => {
    const s = nat ? Math.max(VW / nat.w, VH / nat.h) * z : 1;
    const mx = nat ? Math.max(0, (nat.w * s - VW) / 2) : 0;
    const my = nat ? Math.max(0, (nat.h * s - VH) / 2) : 0;
    return { x: Math.min(mx, Math.max(-mx, p.x)), y: Math.min(my, Math.max(-my, p.y)) };
  };

  const onDown = (e) => { drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y }; e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e) => {
    if (!drag.current) return;
    setPos(clamp({ x: drag.current.ox + e.clientX - drag.current.sx, y: drag.current.oy + e.clientY - drag.current.sy }));
  };
  const onUp = () => { drag.current = null; };
  const nudge = (dx, dy) => setPos((p) => clamp({ x: p.x + dx, y: p.y + dy }));
  const changeZoom = (z) => { setZoom(z); setPos((p) => clamp(p, z)); };

  const save = () => {
    const ratio = outWidth / VW;
    const canvas = document.createElement("canvas");
    canvas.width = outWidth;
    canvas.height = Math.round(VH * ratio);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgRef.current, (VW / 2 - dw / 2 + pos.x) * ratio, (VH / 2 - dh / 2 + pos.y) * ratio, dw * ratio, dh * ratio);
    setSaving(true);
    canvas.toBlob(async (blob) => {
      await onSave(new File([blob], fileName, { type: "image/jpeg" }));
      setSaving(false);
    }, "image/jpeg", 0.92);
  };

  const nudgeBtn = "w-10 h-10 rounded-xl flex items-center justify-center";
  const nudgeStyle = { background: "var(--fill-2)", color: "hsl(var(--foreground))", border: "1px solid var(--hairline)" };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.78)" }}>
      <div className="w-full max-w-sm rounded-3xl p-5 flex flex-col items-center gap-4" style={{ background: "hsl(var(--card))", border: "1px solid var(--hairline)" }}>
        <p className="font-cinzel text-lg font-semibold text-foreground">{t.s5EditPhoto}</p>

        <div className="relative overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
          style={{ width: VW, height: VH, borderRadius: round ? "9999px" : 16, background: "#000", boxShadow: "0 0 0 2px #d9b77e" }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <img ref={imgRef} src={src} alt="" draggable={false}
            onLoad={(e) => setNat({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
            className="absolute max-w-none pointer-events-none"
            style={{ width: dw || "auto", height: dh || "auto", left: VW / 2 - dw / 2 + pos.x, top: VH / 2 - dh / 2 + pos.y }} />
        </div>
        <p className="text-xs font-inter text-center" style={{ color: "rgb(var(--ink) / 0.7)" }}>{t.s5DragHint}</p>

        <div className="grid grid-cols-3 gap-1.5 place-items-center">
          <span />
          <button type="button" aria-label={t.s5Up} onClick={() => nudge(0, NUDGE)} className={nudgeBtn} style={nudgeStyle}><ArrowUp className="w-4 h-4" /></button>
          <span />
          <button type="button" aria-label={t.s5Left} onClick={() => nudge(NUDGE, 0)} className={nudgeBtn} style={nudgeStyle}><ArrowLeft className="w-4 h-4" /></button>
          <button type="button" aria-label={t.s5Down} onClick={() => nudge(0, -NUDGE)} className={nudgeBtn} style={nudgeStyle}><ArrowDown className="w-4 h-4" /></button>
          <button type="button" aria-label={t.s5Right} onClick={() => nudge(-NUDGE, 0)} className={nudgeBtn} style={nudgeStyle}><ArrowRight className="w-4 h-4" /></button>
        </div>

        <label className="w-full flex items-center gap-3">
          <ZoomIn className="w-4 h-4 flex-shrink-0" style={{ color: "#d9b77e" }} />
          <input type="range" min="1" max="3" step="0.02" value={zoom} aria-label={t.s5Zoom}
            onChange={(e) => changeZoom(parseFloat(e.target.value))} className="w-full accent-[#d9b77e]" />
        </label>

        <div className="w-full flex gap-2">
          <button type="button" onClick={onCancel} disabled={saving} className="flex-1 min-h-11 rounded-xl font-cinzel text-sm"
            style={{ background: "var(--fill-2)", color: "hsl(var(--foreground))" }}>{t.s5Cancel}</button>
          <button type="button" onClick={save} disabled={!nat || saving} className="flex-1 min-h-11 rounded-xl font-cinzel text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "#d9b77e", color: "#1a1408" }}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} {t.s5Save}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}