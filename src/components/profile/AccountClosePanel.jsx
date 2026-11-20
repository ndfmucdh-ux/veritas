import { useEffect, useState } from "react";
import { MailX, Trash2, AlertTriangle, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Spinner from "@/components/ui/states/Spinner";
import { useLang } from "@/lib/LanguageContext";
import { accountText } from "@/lib/i18nAccount";
import { getMyPrefs, savePrefs } from "@/lib/preferencesSync";

// Two actions: stop every email (unsubscribe) and permanently close the account.
export default function AccountClosePanel() {
  const { lang } = useLang();
  const a = accountText(lang);
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailsOff, setEmailsOff] = useState(false);
  const [busy, setBusy] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    base44.auth.me().then((u) => setIsAdmin(u?.role === "admin")).catch(() => {});
    getMyPrefs().then((p) => {
      if (p && p.notifications_enabled === false && p.votd_email_enabled === false) setEmailsOff(true);
    }).catch(() => {});
  }, []);

  const stopEmails = async () => {
    setBusy("emails");
    const prefs = await getMyPrefs().catch(() => null);
    const reminders = { ...(prefs?.reminders || {}), channels: { push: false, email: false } };
    await savePrefs({ notifications_enabled: false, votd_email_enabled: false, reminders });
    setEmailsOff(true);
    setBusy("");
  };

  const closeAccount = async () => {
    setBusy("close");
    setError("");
    const res = await base44.functions.invoke("closeAccount", {}).catch(() => null);
    if (res?.data?.closed) {
      localStorage.clear();
      base44.auth.logout("/");
      return;
    }
    setError(a.error);
    setBusy("");
  };

  return (
    <div className="space-y-3 pt-3">
      <div className="rounded-xl px-4 py-3.5 bg-secondary border border-border">
        <div className="flex items-center gap-2 mb-1.5">
          <MailX className="w-4 h-4 text-primary" />
          <p className="text-sm font-cinzel text-foreground">{a.emailsTitle}</p>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground mb-3">{a.emailsText}</p>
        <button onClick={stopEmails} disabled={emailsOff || busy === "emails"}
          className="w-full min-h-11 rounded-xl text-sm flex items-center justify-center gap-2 bg-primary text-primary-foreground disabled:opacity-60">
          {busy === "emails" ? <Spinner size="sm" color="currentColor" /> : emailsOff ? <Check className="w-4 h-4" /> : null}
          {emailsOff ? a.stopped : a.stopEmails}
        </button>
      </div>

      <div className="rounded-xl px-4 py-3.5 border border-destructive/40 bg-destructive/10">
        <div className="flex items-center gap-2 mb-1.5">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <p className="text-sm font-cinzel text-destructive">{a.closeTitle}</p>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground mb-3">{isAdmin ? a.adminNote : a.closeText}</p>
        {!isAdmin && !confirming && (
          <button onClick={() => setConfirming(true)}
            className="w-full min-h-11 rounded-xl text-sm flex items-center justify-center gap-2 border border-destructive/50 text-destructive">
            <Trash2 className="w-4 h-4" /> {a.closeBtn}
          </button>
        )}
        {!isAdmin && confirming && (
          <div className="space-y-2">
            <label className="block text-xs text-muted-foreground" htmlFor="close-confirm">{a.confirmLabel}</label>
            <input id="close-confirm" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off"
              className="w-full px-3 min-h-11 rounded-xl text-sm bg-secondary border border-border text-foreground focus:outline-none" />
            {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setConfirming(false); setTyped(""); setError(""); }} disabled={busy === "close"}
                className="flex-1 min-h-11 rounded-xl text-sm bg-secondary border border-border text-foreground">{a.cancel}</button>
              <button onClick={closeAccount} disabled={typed.trim() !== a.confirmWord || busy === "close"}
                className="flex-1 min-h-11 rounded-xl text-sm flex items-center justify-center gap-2 bg-destructive text-destructive-foreground disabled:opacity-50">
                {busy === "close" ? <><Spinner size="sm" color="currentColor" /> {a.working}</> : a.confirmBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}