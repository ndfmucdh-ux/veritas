import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Play, Pause, X, Volume2 } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

const DURATIONS = [5, 10, 15, 30, 60, 90, 120, 150, 180];

export default function PrayerFocusTimer() {
  const { t } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(selectedDuration * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Draggable position state - start bottom-left to avoid AI button (bottom-right)
  const [pos, setPos] = useState({ x: null, y: null });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const btnRef = useRef(null);

  // Initialize position once on mount
  useEffect(() => {
    setPos({ x: 16, y: window.innerHeight - 220 });
  }, []);

  // Keep the button on-screen when the viewport changes (rotate/resize) so the
  // floating timer and its panel never end up anchored off the visible area.
  useEffect(() => {
    const onResize = () => {
      setPos(p => p.x === null ? p : {
        x: Math.max(0, Math.min(window.innerWidth - 52, p.x)),
        y: Math.max(0, Math.min(window.innerHeight - 52, p.y)),
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsRunning(false);
          playChime();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const playChime = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    // Release the AudioContext once the chime finishes — browsers cap concurrent
    // contexts (~6), so leaking one per timer eventually breaks all audio.
    oscillator.onended = () => audioContext.close().catch(() => {});
  };

  const handleDurationSelect = (duration) => {
    if (!isRunning) {
      setSelectedDuration(duration);
      setTimeLeft(duration * 60);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100;

  // Touch drag handlers
  const onTouchStart = (e) => {
    dragging.current = false;
    const touch = e.touches[0];
    dragOffset.current = {
      x: touch.clientX - pos.x,
      y: touch.clientY - pos.y,
    };
  };

  const onTouchMove = (e) => {
    dragging.current = true;
    const touch = e.touches[0];
    const newX = Math.max(0, Math.min(window.innerWidth - 52, touch.clientX - dragOffset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 52, touch.clientY - dragOffset.current.y));
    setPos({ x: newX, y: newY });
    // Close panel while dragging
    if (isOpen) setIsOpen(false);
  };

  const onTouchEnd = () => {
    // if we didn't drag, treat as tap — toggle is handled by onClick
  };

  // Panel position — try to open upward from button, keep on screen
  const panelAbove = pos.y > 380;
  const panelLeft = pos.x > window.innerWidth / 2 ? "auto" : "0px";
  const panelRight = pos.x > window.innerWidth / 2 ? "0px" : "auto";

  if (pos.x === null) return null;

  return (
    <div style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 55, touchAction: "none" }}>
      {/* Timer panel — anchored relative to button position */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            style={{
              position: "absolute",
              bottom: panelAbove ? "60px" : "auto",
              top: panelAbove ? "auto" : "60px",
              left: panelLeft,
              right: panelRight,
              width: "min(320px, calc(100vw - 32px))",
              background: "var(--popover-surface)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(0,245,255,0.2)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
              borderRadius: "1rem",
              padding: "20px",
              zIndex: 55,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-cinzel text-sm font-semibold" className="text-primary">{t.pjTimer}</p>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="relative w-28 h-28 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgb(var(--ink) / 0.1)" strokeWidth="3" />
                  <motion.circle
                    cx="50" cy="50" r="45" fill="none" stroke="#00f5ff" strokeWidth="3"
                    strokeDasharray={283} strokeDashoffset={283 - (283 * progress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-cinzel text-2xl font-bold text-white">{formatTime(timeLeft)}</p>
                    <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.4)" }}>{selectedDuration} min</p>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={() => setIsRunning(v => !v)}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 rounded-xl font-cinzel text-sm transition-all"
                style={{
                  background: isRunning ? "rgba(248,113,113,0.15)" : "rgba(0,245,255,0.15)",
                  color: isRunning ? "#f87171" : "#00f5ff",
                  border: isRunning ? "1px solid rgba(248,113,113,0.3)" : "1px solid rgba(0,245,255,0.3)"
                }}
              >
                {isRunning ? <><Pause className="w-3.5 h-3.5 inline mr-1.5" />{t.pjPause}</> : <><Play className="w-3.5 h-3.5 inline mr-1.5 ml-0.5" />{t.pjStart}</>}
              </motion.button>
            </div>

            {!isRunning && (
              <div className="space-y-3">
                <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgb(var(--ink) / 0.3)" }}>{t.pjDuration}</p>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map(d => (
                    <button key={d} onClick={() => handleDurationSelect(d)}
                      className="py-2 rounded-lg text-xs font-cinzel transition-all"
                      style={{
                        background: selectedDuration === d ? "rgba(0,245,255,0.2)" : "rgb(var(--ink) / 0.05)",
                        color: selectedDuration === d ? "#00f5ff" : "rgb(var(--ink) / 0.4)",
                        border: selectedDuration === d ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgb(var(--ink) / 0.07)",
                      }}>
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgb(var(--ink) / 0.1)" }}>
              <p className="text-[10px] font-inter flex items-center gap-2" style={{ color: "rgb(var(--ink) / 0.4)" }}>
                <Volume2 className="w-3 h-3" /> {t.pjChime}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating drag button */}
      <motion.button
        ref={btnRef}
        onClick={() => !dragging.current && setIsOpen(v => !v)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        whileTap={{ scale: 0.92 }}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing select-none"
        style={{
          background: isRunning ? "linear-gradient(135deg, #f87171, #f97316)" : "rgba(0,245,255,0.1)",
          border: isRunning ? "1px solid #f87171" : "1px solid rgba(0,245,255,0.25)",
          touchAction: "none",
        }}
      >
        <Clock className="w-5 h-5 pointer-events-none" style={{ color: isRunning ? "#fff" : "#00f5ff" }} />
      </motion.button>
    </div>
  );
}