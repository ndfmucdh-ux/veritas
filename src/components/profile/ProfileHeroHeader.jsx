import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, Edit3, Loader2, X } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import PhotoEditorModal from "@/components/profile/PhotoEditorModal";

const DEFAULT_HERO = "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80";
const GOLD = "#d9b77e";

export default function ProfileHeroHeader({ user, avatarUrl, heroUrl, onSaveName, onAvatarFile, onHeroFile }) {
  const { t } = useLang();
  const [editingName, setEditingName] = useState(false);
  const savedName = user?.display_name || user?.full_name || localStorage.getItem("veritas_display_name") || "";
  const isBuilder = user?.email?.toLowerCase() === "pastords@me.com";
  const savedTitle = user ? (user.profile_title || (isBuilder ? "The Builder" : "")) : (localStorage.getItem("veritas_profile_title") || "");
  const [nameInput, setNameInput] = useState(savedName);
  const [titleInput, setTitleInput] = useState(savedTitle);
  const [editor, setEditor] = useState(null); // { kind: "avatar" | "hero", src }
  const avatarInputRef = useRef(null);
  const heroInputRef = useRef(null);

  // Edit buttons stay out of sight. Tapping the cover or the photo reveals just that button;
  // it fades away on its own after a few seconds or when the user taps anywhere else.
  const rootRef = useRef(null);
  const hideTimer = useRef(null);
  const [revealed, setRevealed] = useState(null); // "avatar" | "hero" | null
  const reveal = (kind) => {
    setRevealed(kind);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setRevealed(null), 4000);
  };
  useEffect(() => {
    const away = (e) => { if (!rootRef.current?.contains(e.target)) setRevealed(null); };
    document.addEventListener("pointerdown", away);
    return () => { document.removeEventListener("pointerdown", away); clearTimeout(hideTimer.current); };
  }, []);

  const displayName = savedName || t.s5Believer;

  const startEdit = () => {
    setNameInput(savedName);
    setTitleInput(savedTitle);
    setEditingName(true);
  };

  const handleSaveName = async () => {
    await onSaveName(nameInput, titleInput);
    setEditingName(false);
  };

  const pick = (kind) => (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) setEditor({ kind, src: URL.createObjectURL(file) });
  };

  // Re-open the current picture for adjusting; if the browser blocks reading it, ask for a new file instead.
  const adjustCurrent = async (kind, url, inputRef) => {
    if (!url) return inputRef.current?.click();
    try {
      const blob = await (await fetch(url)).blob();
      setEditor({ kind, src: URL.createObjectURL(blob) });
    } catch {
      inputRef.current?.click();
    }
  };

  const saveEdited = async (file) => {
    if (editor.kind === "avatar") await onAvatarFile(file);
    else await onHeroFile(file);
    setEditor(null);
  };

  return (
    <div ref={rootRef} onClick={() => reveal("hero")}
      className="relative min-h-[19rem] overflow-hidden flex flex-col items-center justify-end pb-6 px-5">
      <img src={heroUrl || DEFAULT_HERO} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0.9) 100%)" }} />

      <AnimatePresence>
        {revealed === "hero" && (
          <motion.button key="cover-edit" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
            onClick={(e) => { e.stopPropagation(); setRevealed(null); adjustCurrent("hero", heroUrl, heroInputRef); }}
            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 min-h-9 rounded-full text-xs font-inter"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}>
            <Camera className="w-3.5 h-3.5" /> {t.s5Cover}
          </motion.button>
        )}
      </AnimatePresence>
      <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={pick("hero")} />
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={pick("avatar")} />

      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }} className="relative z-10">
        <button type="button" onClick={(e) => { e.stopPropagation(); reveal("avatar"); }} aria-label={t.s5EditPhoto}
          className="block w-32 h-32 rounded-full overflow-hidden"
          style={{ border: `3px solid ${GOLD}`, boxShadow: "0 8px 30px rgba(0,0,0,0.55)" }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center font-cinzel text-5xl font-bold" style={{ background: "#1c1c1c", color: GOLD }}>
              {savedName?.[0]?.toUpperCase() || "V"}
            </span>
          )}
        </button>
        <AnimatePresence>
          {revealed === "avatar" && (
            <motion.button key="avatar-edit" type="button" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.18 }}
              onClick={(e) => { e.stopPropagation(); setRevealed(null); adjustCurrent("avatar", avatarUrl, avatarInputRef); }} aria-label={t.s5EditPhoto}
              className="absolute bottom-0 right-0 w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: GOLD, color: "#1a1408", boxShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              <Camera className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="relative z-10 mt-3 w-full max-w-xs text-center" onClick={(e) => e.stopPropagation()}>
        {editingName ? (
          <div className="flex items-center justify-center gap-2">
            <div className="flex-1 min-w-0 space-y-2">
              <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                placeholder="Name" aria-label="Name"
                className="w-full bg-transparent border-b text-center font-cinzel text-xl font-bold focus:outline-none"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)", fontSize: 20 }} autoFocus />
              <input value={titleInput} onChange={(e) => setTitleInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                placeholder="Title (e.g. Pastor, Student)" aria-label="Title" maxLength={60}
                className="w-full bg-transparent border-b text-center font-inter focus:outline-none"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,0.35)", fontSize: 16 }} />
            </div>
            <button onClick={handleSaveName} aria-label={t.s5Save} style={{ color: "#fff" }}><Check className="w-5 h-5" /></button>
            <button onClick={() => setEditingName(false)} aria-label={t.s5Cancel} style={{ color: "rgba(255,255,255,0.7)" }}><X className="w-5 h-5" /></button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <h1 className="font-cinzel text-2xl font-bold truncate" style={{ color: "#fff" }}>{displayName}</h1>
            <button onClick={startEdit} aria-label="Edit name and title" className="p-1 flex-shrink-0">
              <Edit3 className="w-4 h-4" style={{ color: GOLD }} />
            </button>
          </div>
        )}
        {!editingName && savedTitle && (
          <p className="text-sm font-inter truncate mt-0.5" style={{ color: GOLD }}>{savedTitle}</p>
        )}
        <p className="text-xs font-inter truncate mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>{user?.email}</p>
      </div>

      {editor && (
        <div onClick={(e) => e.stopPropagation()}>
        <PhotoEditorModal
          src={editor.src}
          aspect={editor.kind === "avatar" ? 1 : 4 / 3}
          round={editor.kind === "avatar"}
          outWidth={editor.kind === "avatar" ? 640 : 1200}
          fileName={`${editor.kind}.jpg`}
          onCancel={() => setEditor(null)}
          onSave={saveEdited}
        />
        </div>
      )}
    </div>
  );
}