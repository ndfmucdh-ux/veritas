import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Globe, Lock } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { community } from "@/lib/communityApi";
import { GROUP_CATEGORIES } from "@/components/community/GroupCard";

const field = "w-full px-3 min-h-11 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const lbl = "block text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1";

// Bottom sheet to start a new group.
export default function GroupCreateSheet({ onClose, onCreated }) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("study_group");
  const [privacy, setPrivacy] = useState("public");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (name.trim().length < 3) return;
    setBusy(true);
    setError("");
    try {
      const { id } = await community("groups.create", { name, description, category, privacy });
      await onCreated(id);
    } catch {
      setError(t.cmErr);
      setBusy(false);
    }
  };

  const options = [["public", Globe, t.cmPublic, t.cmPublicSub], ["private", Lock, t.cmPrivate, t.cmPrivateSub]];

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl bg-card border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-cinzel text-2xl font-semibold text-foreground">{t.cmCreate}</h2>
          <button type="button" onClick={onClose} aria-label={t.cancel} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <label className="block"><span className={lbl}>{t.cmGroupName}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={field} style={{ fontSize: 16 }} /></label>
        <label className="block"><span className={lbl}>{t.cmGroupDesc}</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={300} className={`${field} py-2 resize-none`} style={{ fontSize: 16 }} /></label>
        <div>
          <span className={lbl}>{t.cmCategory}</span>
          <div className="flex flex-wrap gap-1.5">
            {GROUP_CATEGORIES.map((c) => (
              <button key={c.id} type="button" onClick={() => setCategory(c.id)} aria-pressed={category === c.id}
                className={`px-3.5 min-h-9 rounded-full text-xs border ${category === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground/80 border-border"}`}>{t[c.key]}</button>
            ))}
          </div>
        </div>
        <div>
          <span className={lbl}>{t.cmPrivacy}</span>
          <div className="grid grid-cols-2 gap-2">
            {options.map(([id, Icon, title, sub]) => (
              <button key={id} type="button" onClick={() => setPrivacy(id)} aria-pressed={privacy === id}
                className={`text-left rounded-xl p-3 border ${privacy === id ? "border-primary bg-primary/10" : "border-border bg-secondary"}`}>
                <Icon className="w-4 h-4 text-primary mb-1" />
                <p className="font-cinzel text-sm font-semibold text-foreground">{title}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{sub}</p>
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <button type="button" onClick={submit} disabled={busy || name.trim().length < 3}
          className="w-full min-h-12 rounded-full bg-primary text-primary-foreground font-cinzel font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} {t.cmCreateBtn}
        </button>
      </div>
    </div>,
    document.body
  );
}