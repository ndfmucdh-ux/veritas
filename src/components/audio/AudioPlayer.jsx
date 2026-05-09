import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, X } from "lucide-react";

export default function AudioPlayer({ book, chapter, translation, onClose }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  useEffect(() => {
    if (isPlaying) audioRef.current?.play();
    else audioRef.current?.pause();
  }, [isPlaying]);

  useEffect(() => {
    // Update current verse based on playback time
    const verseIndex = DUMMY_VERSES.findIndex((v, i) => {
      const nextVerse = DUMMY_VERSES[i + 1];
      return currentTime >= v.time && (!nextVerse || currentTime < nextVerse.time);
    });
    if (verseIndex !== -1) setCurrentVerseIndex(verseIndex);
  }, [currentTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-28 left-4 right-4 rounded-2xl p-4 z-40"
      style={{
        background: "rgba(6,10,20,0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(0,245,255,0.15)",
        boxShadow: "0 8px 32px rgba(0,245,255,0.1)"
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-cinzel text-sm text-white truncate">{book} {chapter}</p>
          <p className="text-[10px] text-white/40">Verse {DUMMY_VERSES[currentVerseIndex]?.verse || 1} — {translation} Audio</p>
          {DUMMY_VERSES[currentVerseIndex] && (
            <p className="text-[9px] text-cyan/70 italic truncate mt-1">{DUMMY_VERSES[currentVerseIndex].text}</p>
          )}
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white ml-2 flex-shrink-0">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan to-purple"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/40 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handlePlayPause}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(0,245,255,0.15)", color: "#00f5ff" }}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </motion.button>

        <div className="flex items-center gap-2 flex-1">
          <Volume2 className="w-4 h-4 text-white/40 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (audioRef.current) audioRef.current.volume = parseFloat(e.target.value);
            }}
            className="flex-1"
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </motion.div>
  );
}