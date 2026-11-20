import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Trash2, Upload, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createReflection } from "@/lib/services/audioReflectionService";

export default function AudioReflectionRecorder({ verseRef, book, chapter, verse, translation, onSaved }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mood, setMood] = useState("grateful");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const previewUrlRef = useRef(null);

  // Teardown on unmount: stop the mic stream (releases the device + red dot) and
  // revoke any preview object URL so we don't leak the device or memory if the
  // user closes the panel mid-recording or after previewing.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const moods = [
    { id: "grateful", label: "Grateful", emoji: "🙏" },
    { id: "confessing", label: "Confessing", emoji: "🤲" },
    { id: "interceding", label: "Interceding", emoji: "💗" },
    { id: "celebrating", label: "Celebrating", emoji: "🎉" },
    { id: "questioning", label: "Questioning", emoji: "❓" },
    { id: "seeking", label: "Seeking", emoji: "🔍" },
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const playAudio = () => {
    if (audioBlob && audioRef.current) {
      // Revoke the previous preview URL before creating a new one.
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const url = URL.createObjectURL(audioBlob);
      previewUrlRef.current = url;
      audioRef.current.src = url;
      audioRef.current.play();
      setPlayingAudio(true);
    }
  };

  const discardAudio = () => {
    setAudioBlob(null);
    setPlayingAudio(false);
    if (previewUrlRef.current) { URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = null; }
    if (audioRef.current) audioRef.current.src = "";
  };

  const uploadReflection = async () => {
    if (!audioBlob) return;
    setUploading(true);

    try {
      // Upload audio file (integration), then persist via the domain service
      const { file_url } = await base44.integrations.Core.UploadFile({ file: audioBlob });

      await createReflection({
        verseRef, book, chapter, verse, translation,
        audioUrl: file_url,
        durationSeconds: Math.round(audioBlob.size / 10000), // Rough estimate
        mood,
      });

      setAudioBlob(null);
      setUploading(false);
      onSaved?.();
    } catch (err) {
      console.error("Upload failed:", err);
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 rounded-xl p-4 space-y-3"
      style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)" }}
    >
      {!audioBlob ? (
        <div className="space-y-3">
          {/* Mood selector */}
          <div>
            <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2 text-white/40">Your mood</p>
            <div className="flex flex-wrap gap-1.5">
              {moods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className="text-xs px-2.5 py-1 rounded-lg font-inter transition-all"
                  style={{
                    background: mood === m.id ? "rgba(0,229,255,0.2)" : "rgb(var(--ink) / 0.05)",
                    color: mood === m.id ? "#00f5ff" : "rgb(var(--ink) / 0.4)",
                    border: mood === m.id ? "1px solid rgba(0,229,255,0.3)" : "1px solid transparent",
                  }}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Record button */}
          <motion.button
            onClick={recording ? stopRecording : startRecording}
            className="w-full py-3 rounded-xl font-cinzel text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            whileTap={{ scale: 0.98 }}
            style={{
              background: recording ? "rgba(248,113,113,0.15)" : "rgba(0,229,255,0.15)",
              color: recording ? "#f87171" : "#00f5ff",
              border: recording ? "1px solid rgba(248,113,113,0.3)" : "1px solid rgba(0,229,255,0.3)",
            }}
          >
            <Mic className="w-4 h-4" />
            {recording ? "Stop Recording" : "Start Recording"}
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Playback */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              aria-label="Play recording" onClick={playAudio}
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,229,255,0.2)", color: "#00f5ff" }}
            >
              <Play className="w-4 h-4" />
            </motion.button>
            <audio ref={audioRef} onEnded={() => setPlayingAudio(false)} />
            <div className="flex-1 h-1 rounded-full" style={{ background: "rgb(var(--ink) / 0.1)" }} />
            <button onClick={discardAudio} className="text-xs font-inter text-white/40 hover:text-white/60 transition-colors">
              Discard
            </button>
          </div>

          {/* Upload button */}
          <motion.button
            onClick={uploadReflection}
            disabled={uploading}
            className="w-full py-2.5 rounded-xl font-cinzel text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{
              background: "rgba(52,211,153,0.15)",
              color: "#34d399",
              border: "1px solid rgba(52,211,153,0.3)",
            }}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {uploading ? "Saving..." : "Save Reflection"}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}