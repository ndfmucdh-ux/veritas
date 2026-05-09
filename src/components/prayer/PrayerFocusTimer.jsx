import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Play, Pause, X, Volume2 } from "lucide-react";

const DURATIONS = [5, 10, 15, 30, 60, 90, 120, 150, 180];

export default function PrayerFocusTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(selectedDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const audioRef = useRef(null);

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

  return (
    <div>
      {/* Floating toggle button */}
      <motion.button
        onClick={() => setIsOpen(v => !v)}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-32 right-5 w-12 h-12 rounded-full flex items-center justify-center z-40 shadow-lg"
        style={{
          background: isRunning ? "linear-gradient(135deg, #f87171, #f97316)" : "rgba(0,245,255,0.1)",
          border: isRunning ? "1px solid #f87171" : "1px solid rgba(0,245,255,0.25)",
        }}
      >
        <Clock
          className="w-5 h-5"
          style={{ color: isRunning ? "#f87171" : "#00f5ff" }}
        />
      </motion.button>

      {/* Timer panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            className="fixed bottom-48 right-5 w-80 rounded-2xl z-40 p-5"
            style={{
              background: "rgba(10,15,30,0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(0,245,255,0.2)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)"
            }}
          >
            {/* Close */}
            <div className="flex items-center justify-between mb-4">
              <p className="font-cinzel text-sm font-semibold" style={{ color: "#00f5ff" }}>Prayer Focus Timer</p>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Circular progress */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-28 h-28 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#00f5ff"
                    strokeWidth="3"
                    strokeDasharray={283}
                    strokeDashoffset={283 - (283 * progress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-cinzel text-2xl font-bold text-white">{formatTime(timeLeft)}</p>
                    <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {selectedDuration} min
                    </p>
                  </div>
                </div>
              </div>

              {/* Play/Pause */}
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
                {isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5 inline mr-1.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 inline mr-1.5 ml-0.5" /> Start
                  </>
                )}
              </motion.button>
            </div>

            {/* Duration selector */}
            {!isRunning && (
              <div className="space-y-3">
                <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Duration
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => handleDurationSelect(d)}
                      disabled={isRunning}
                      className="py-2 rounded-lg text-xs font-cinzel transition-all"
                      style={{
                        background: selectedDuration === d ? "rgba(0,245,255,0.2)" : "rgba(255,255,255,0.05)",
                        color: selectedDuration === d ? "#00f5ff" : "rgba(255,255,255,0.4)",
                        border: selectedDuration === d ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.07)",
                        opacity: isRunning ? 0.5 : 1
                      }}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chime toggle */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <p className="text-[10px] font-inter flex items-center gap-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Volume2 className="w-3 h-3" /> Chime plays when timer ends
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}