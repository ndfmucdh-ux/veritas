import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, ChevronDown, Headphones, SkipBack, SkipForward } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useDraggable from "@/hooks/useDraggable";
import { useLang } from "@/lib/LanguageContext";
import { getTranslatedBookName, getTranslationLang } from "@/lib/bibleData";

const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

export default function ChapterAudioPlayer({ book, chapter, translation, verses }) {
  const { lang } = useLang();
  const isEs = lang === "es";
  // Book name follows the CONTENT translation language (BTX3 → "Juan", KJV → "John")
  const displayBook = getTranslatedBookName(book, getTranslationLang(translation));
  const drag = useDraggable("veritas_pos_audio");
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [voiceName, setVoiceName] = useState("Human narrator");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const prefetchRef = useRef(null);
  const audioRef = useRef(null);
  const stoppedRef = useRef(false);

  // Reset when chapter changes
  useEffect(() => {
    stopAll();
    setCurrentVerse(0);
    setPlaying(false);
    setError("");
    prefetchRef.current = null;
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

  // Group consecutive verses into passages of ~900 characters (one narrated clip each)
  const chunkFrom = useCallback((startIdx) => {
    let end = startIdx, len = 0;
    while (end < verses.length && (end === startIdx || len + (verses[end].text?.length || 0) <= 900)) {
      len += verses[end].text?.length || 0;
      end++;
    }
    return { start: startIdx, end }; // end is exclusive
  }, [verses]);

  const fetchClip = useCallback(async ({ start, end }) => {
    const text = verses.slice(start, end).map(v => v.text).join(" ");
    const res = await base44.functions.invoke("getChapterAudio", {
      book, chapter, translation, text, language: getTranslationLang(translation),
    });
    return res.data;
  }, [verses, book, chapter, translation]);

  const playFromVerse = useCallback(async (startIdx) => {
    if (!verses?.length) return;
    stoppedRef.current = false;
    setCurrentVerse(startIdx);
    setLoading(true);
    setError("");

    try {
      const chunk = chunkFrom(startIdx);
      const data = prefetchRef.current?.start === startIdx ? await prefetchRef.current.promise : await fetchClip(chunk);

      // Guard: if user stopped while awaiting, abort silently
      if (stoppedRef.current) return;
      if (!data?.audio_url || !audioRef.current) throw new Error("No audio returned");

      const audio = audioRef.current;
      audio.src = data.audio_url;
      audio.playbackRate = speed;
      audio.volume = muted ? 0 : 1;

      // Advance the highlighted verse in proportion to characters spoken
      const lens = verses.slice(chunk.start, chunk.end).map(v => v.text?.length || 1);
      const total = lens.reduce((a, b) => a + b, 0);
      audio.ontimeupdate = () => {
        if (!audio.duration) return;
        const target = (audio.currentTime / audio.duration) * total;
        let acc = 0, idx = 0;
        for (let i = 0; i < lens.length; i++) { acc += lens[i]; if (target <= acc) { idx = i; break; } idx = i; }
        setCurrentVerse(chunk.start + idx);
      };
      audio.onended = () => {
        if (!stoppedRef.current && chunk.end < verses.length) {
          playFromVerse(chunk.end);
        } else {
          setPlaying(false);
          setCurrentVerse(0);
        }
      };

      await audio.play();
      setPlaying(true);
      setVoiceName(data.narrator || "Human narrator");

      // Warm up the next passage so playback continues without a gap
      if (chunk.end < verses.length) {
        const next = chunkFrom(chunk.end);
        prefetchRef.current = { start: next.start, promise: fetchClip(next).catch(() => null) };
      }
    } catch (err) {
      if (!stoppedRef.current) {
        setError(err?.response?.status === 401 ? (isEs ? "Inicia sesión para escuchar" : "Sign in to listen") : (isEs ? "No se pudo cargar el audio. Inténtalo de nuevo." : "Couldn't load the audio. Please try again."));
      }
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  }, [verses, speed, muted, chunkFrom, fetchClip, isEs]);

  const handlePlay = () => {
    if (playing) {
      stopAll();
    } else {
      // Unlock the audio element inside the tap so mobile browsers allow playback after the network wait
      const a = audioRef.current;
      if (a && !a.src) { a.src = SILENT; a.play().catch(() => {}); }
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
    <motion.div {...drag.rootProps} className={`fixed bottom-40 min-[1101px]:bottom-28 right-4 min-[1101px]:right-6 z-40 flex flex-col items-end ${open ? "left-4 md:left-auto md:w-80" : ""}`}>
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

            {loading && <p className="text-[11px] font-inter text-cyan">{isEs ? "Preparando la voz…" : "Preparing the narrator…"}</p>}
            {error && <p role="alert" className="text-[11px] font-inter text-destructive">{error}</p>}

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
                <button aria-label="Previous verse" onClick={skipBack} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
                  style={{ color: "rgb(var(--ink) / 0.4)" }}>
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  aria-label="Play or pause" onClick={handlePlay}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: playing ? "rgba(0,245,255,0.18)" : "linear-gradient(135deg, rgba(0,245,255,0.3), rgba(167,139,250,0.3))", border: "1px solid rgba(0,245,255,0.3)", boxShadow: playing ? "0 0 20px rgba(0,245,255,0.25)" : "none" }}
                >
                  {playing ? <Pause className="w-5 h-5 text-cyan" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                </motion.button>
                <button aria-label="Next verse" onClick={skipForward} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
                  style={{ color: "rgb(var(--ink) / 0.4)" }}>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mute */}
              <button aria-label="Mute or unmute" onClick={toggleMute} className="w-8 h-8 rounded-xl flex items-center justify-center"
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
        {...drag.handleProps}
        onClick={drag.onTap(() => { setOpen(v => !v); if (open && playing) stopAll(); })}
        aria-label={isEs ? "Escuchar Capítulo" : "Listen to Chapter"}
        className={`flex items-center gap-2 h-12 rounded-full justify-center ${open ? "w-full px-4 rounded-2xl" : playing ? "px-4" : "w-12"}`}
        style={{
          ...drag.handleProps.style,
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
          <Headphones className="w-5 h-5" style={{ color: "#00f5ff" }} />
        )}
        {(open || playing) && (
          <span className="font-cinzel text-xs font-semibold" style={{ color: playing ? "#00f5ff" : "rgb(var(--ink) / 0.75)" }}>
            {playing ? (isEs ? `Escuchando · v.${currentVerse + 1}` : `Listening · v.${currentVerse + 1}`) : (isEs ? "Escuchar Capítulo" : "Listen to Chapter")}
          </span>
        )}
        {open && <ChevronDown className="w-4 h-4 ml-auto" style={{ color: "rgb(var(--ink) / 0.6)", transform: "rotate(180deg)" }} />}
      </motion.button>

      {/* Hidden audio element for YouVersion audio playback */}
      <audio ref={audioRef} crossOrigin="anonymous" />
    </motion.div>
  );
}