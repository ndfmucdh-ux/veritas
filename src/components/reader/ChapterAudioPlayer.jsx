import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, ChevronDown, Headphones, SkipBack, SkipForward } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";
import { getTranslatedBookName, getTranslationLang } from "@/lib/bibleData";

export default function ChapterAudioPlayer({ book, chapter, translation, verses }) {
  const { lang } = useLang();
  const isEs = lang === "es";
  // Book name follows the CONTENT translation language (BTX3 → "Juan", KJV → "John")
  const displayBook = getTranslatedBookName(book, getTranslationLang(translation));
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [voiceName, setVoiceName] = useState("YouVersion Audio");
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);
  const stoppedRef = useRef(false);

  // Reset when chapter changes
  useEffect(() => {
    stopAll();
    setCurrentVerse(0);
    setPlaying(false);
  }, [book, chapter]);

  // Stop playback if the Reader unmounts (e.g. navigating away) so audio doesn't
  // keep playing in the background.
  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    };
  }, []);

  const stopAll = () => {
    stoppedRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(false);
  };

  const playFromVerse = useCallback(async (startIdx) => {
    if (!verses?.length) return;
    stoppedRef.current = false;
    setCurrentVerse(startIdx);
    setLoading(true);

    try {
      const res = await base44.functions.invoke("getChapterAudio", {
        book,
        chapter,
        translation,
        verse: verses[startIdx]?.verse,
      });

      // Guard: if user stopped while awaiting, abort silently
      if (stoppedRef.current) return;

      if (res.data?.audio_url && audioRef.current) {
        audioRef.current.src = res.data.audio_url;
        audioRef.current.playbackRate = speed;
        audioRef.current.volume = muted ? 0 : 1;

        audioRef.current.onended = () => {
          if (!stoppedRef.current && startIdx + 1 < verses.length) {
            playFromVerse(startIdx + 1);
          } else {
            setPlaying(false);
            setCurrentVerse(0);
          }
        };

        await audioRef.current.play();
        setPlaying(true);
        setVoiceName(res.data.narrator || "YouVersion Audio");
      }
    } catch (error) {
      if (!stoppedRef.current) console.error("Failed to load audio:", error);
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  }, [verses, book, chapter, translation, speed, muted]);

  const handlePlay = () => {
    if (playing) {
      stopAll();
    } else {
      playFromVerse(currentVerse);
    }
  };

  const skipBack = () => {
    stopAll();
    const next = Math.max(0, currentVerse - 1);
    setCurrentVerse(next);
    setTimeout(() => playFromVerse(next), 100);
  };

  const skipForward = () => {
    stopAll();
    const next = Math.min((verses?.length || 1) - 1, currentVerse + 1);
    setCurrentVerse(next);
    setTimeout(() => playFromVerse(next), 100);
  };

  const toggleMute = () => {
    setMuted(m => {
      if (audioRef.current) audioRef.current.volume = m ? 1 : 0;
      return !m;
    });
  };

  const progress = verses?.length ? (currentVerse / verses.length) * 100 : 0;

  return (
    <div className="fixed bottom-36 md:bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="mb-2 rounded-2xl px-4 py-4 space-y-3"
            style={{
              background: "var(--popover-surface)",
              border: "1px solid rgba(0,245,255,0.18)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,245,255,0.08)"
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-cinzel text-sm font-semibold text-white">{displayBook} {chapter}</p>
                <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.3)" }}>
                  {voiceName} · {translation}
                </p>
              </div>
              <div className="text-[10px] font-cinzel px-2 py-1 rounded-full"
                style={{ background: playing ? "rgba(0,245,255,0.1)" : "rgb(var(--ink) / 0.05)", color: playing ? "#00f5ff" : "rgb(var(--ink) / 0.3)", border: playing ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgb(var(--ink) / 0.07)" }}>
                {playing ? `v.${currentVerse + 1}` : (isEs ? "Pausado" : "Paused")}
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--fill-3)" }}>
              <motion.div className="h-full rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
                style={{ background: "linear-gradient(90deg, #00f5ff, #a78bfa)" }}
              />
            </div>

            {/* Verse preview */}
            {verses?.[currentVerse] && (
              <p className="text-xs font-playfair italic leading-relaxed line-clamp-2"
                style={{ color: "rgb(var(--ink) / 0.5)" }}>
                "{verses[currentVerse].text?.substring(0, 100)}…"
              </p>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between">
              {/* Speed */}
              <div className="flex gap-1">
                {[0.75, 0.88, 1.0, 1.15].map(s => (
                  <button key={s} onClick={() => setSpeed(s)}
                    className="px-2 py-1 rounded-lg font-inter text-[10px] transition-all"
                    style={{
                      background: speed === s ? "rgba(0,245,255,0.15)" : "rgb(var(--ink) / 0.04)",
                      color: speed === s ? "#00f5ff" : "rgb(var(--ink) / 0.3)",
                      border: speed === s ? "1px solid rgba(0,245,255,0.3)" : "1px solid transparent"
                    }}>
                    {s}x
                  </button>
                ))}
              </div>

              {/* Main controls */}
              <div className="flex items-center gap-2">
                <button onClick={skipBack} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
                  style={{ color: "rgb(var(--ink) / 0.4)" }}>
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePlay}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: playing ? "rgba(0,245,255,0.18)" : "linear-gradient(135deg, rgba(0,245,255,0.3), rgba(167,139,250,0.3))", border: "1px solid rgba(0,245,255,0.3)", boxShadow: playing ? "0 0 20px rgba(0,245,255,0.25)" : "none" }}
                >
                  {playing ? <Pause className="w-5 h-5 text-cyan" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                </motion.button>
                <button onClick={skipForward} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
                  style={{ color: "rgb(var(--ink) / 0.4)" }}>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mute */}
              <button onClick={toggleMute} className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ color: muted ? "#f87171" : "rgb(var(--ink) / 0.4)" }}>
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pill toggle button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => { setOpen(v => !v); if (open && playing) stopAll(); }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl w-full justify-center"
        style={{
          background: open ? "var(--popover-surface)" : "hsl(var(--surface-4) / 0.9)",
          border: `1px solid ${playing ? "rgba(0,245,255,0.35)" : "rgb(var(--ink) / 0.1)"}`,
          backdropFilter: "blur(16px)",
          boxShadow: playing ? "0 0 20px rgba(0,245,255,0.15)" : "0 4px 20px rgba(0,0,0,0.5)"
        }}
      >
        {playing ? (
          <span className="flex gap-[3px] items-end h-4">
            {[1,2,3].map(i => (
              <motion.span key={i} className="w-[3px] rounded-full bg-cyan"
                animate={{ height: ["6px","12px","6px"] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </span>
        ) : (
          <Headphones className="w-4 h-4" style={{ color: "#00f5ff" }} />
        )}
        <span className="font-cinzel text-xs font-semibold" style={{ color: playing ? "#00f5ff" : "rgb(var(--ink) / 0.6)" }}>
          {playing ? (isEs ? `Escuchando · v.${currentVerse + 1}` : `Listening · v.${currentVerse + 1}`) : (isEs ? "Escuchar Capítulo" : "Listen to Chapter")}
        </span>
        <ChevronDown className="w-3.5 h-3.5 ml-auto" style={{ color: "rgb(var(--ink) / 0.3)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </motion.button>

      {/* Hidden audio element for YouVersion audio playback */}
      <audio ref={audioRef} crossOrigin="anonymous" />
    </div>
  );
}