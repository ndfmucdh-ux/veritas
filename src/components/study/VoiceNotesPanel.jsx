import { Mic, Pause, Play } from "lucide-react";

export default function VoiceNotesPanel({ notes, audioRef, playingAudioUrl, onPlayingChange }) {
  if (!notes.length) return null;

  const toggleAudio = (audioUrl) => {
    if (playingAudioUrl === audioUrl) {
      audioRef.current?.pause();
      onPlayingChange(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
    onPlayingChange(audioUrl);
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.12)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Mic className="w-4 h-4" style={{ color: "#00f5ff" }} />
        <p className="font-cinzel text-sm font-semibold text-white">Voice Notes</p>
        <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>{notes.length} recordings</p>
      </div>
      <div className="space-y-2">
        {notes.slice(0, 5).map(note => (
          <div key={note.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <button
              type="button"
              onClick={() => toggleAudio(note.audio_url)}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff" }}
            >
              {playingAudioUrl === note.audio_url ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-cinzel text-xs text-white truncate">{note.verse_ref}</p>
              <p className="text-[10px] font-inter capitalize" style={{ color: "rgba(255,255,255,0.35)" }}>{note.mood} · {new Date(note.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            </div>
          </div>
        ))}
      </div>
      <audio ref={audioRef} onEnded={() => onPlayingChange(null)} className="hidden" />
    </div>
  );
}