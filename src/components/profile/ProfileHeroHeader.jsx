import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Check, Edit3, Loader2, X } from "lucide-react";

const DEFAULT_HERO = "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80";

export default function ProfileHeroHeader({ user, avatarUrl, heroUrl, onSaveName, onAvatarFile, onHeroFile }) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(sessionStorage.getItem("veritas_display_name") || user?.full_name || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const avatarInputRef = useRef(null);
  const heroInputRef = useRef(null);

  const handleSaveName = async () => {
    await onSaveName(nameInput);
    setEditingName(false);
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    await onAvatarFile(file);
    setUploadingAvatar(false);
  };

  const handleHero = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    await onHeroFile(file);
    setUploadingHero(false);
  };

  return (
    <div className="relative h-52 overflow-hidden">
      <img src={heroUrl || DEFAULT_HERO} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(8,12,24,0.92) 80%, rgb(8,12,24) 100%)" }} />

      <button
        onClick={() => heroInputRef.current?.click()}
        className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-inter"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
      >
        {uploadingHero ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
        Change Cover
      </button>
      <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={handleHero} />

      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 flex items-end gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative flex-shrink-0"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-2xl object-cover"
              style={{ border: "2px solid rgba(251,191,36,0.35)", boxShadow: "0 0 24px rgba(251,191,36,0.12)" }} />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
              style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(251,191,36,0.05))", border: "2px solid rgba(251,191,36,0.35)", boxShadow: "0 0 24px rgba(251,191,36,0.12)" }}
            >
              {user?.full_name?.[0]?.toUpperCase() || "✝"}
            </div>
          )}
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center z-10"
            style={{ background: "rgba(10,15,30,0.95)", border: "1.5px solid rgba(251,191,36,0.35)", boxShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
          >
            {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />}
          </button>
        </motion.div>
        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />

        <div className="flex-1 min-w-0 pb-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveName()}
                className="bg-transparent border-b border-white/40 text-white font-cinzel text-lg font-bold focus:outline-none flex-1 min-w-0"
                autoFocus
              />
              <button onClick={handleSaveName} className="text-white/60 hover:text-white transition-colors"><Check className="w-4 h-4" /></button>
              <button onClick={() => { setNameInput(user?.full_name || ""); setEditingName(false); }} className="text-white/40"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-lg font-bold text-white truncate">{sessionStorage.getItem("veritas_display_name") || user?.full_name || "Believer"}</h1>
              <button onClick={() => setEditingName(true)}>
                <Edit3 className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
              </button>
            </div>
          )}
          <p className="text-xs font-inter truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{user?.email}</p>
        </div>
      </div>
    </div>
  );
}