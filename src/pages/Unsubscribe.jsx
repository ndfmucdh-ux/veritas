import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MailX, AlertCircle } from "lucide-react";
import VeritasLogo from "@/components/ui/VeritasLogo";
import Spinner from "@/components/ui/states/Spinner";
import { useLang } from "@/lib/LanguageContext";
import { accountText } from "@/lib/i18nAccount";

const inPreview = () => window.self !== window.top || /^preview(-sandbox)?--/.test(location.hostname);

export default function Unsubscribe() {
  const { lang } = useLang();
  const a = accountText(lang);
  const [state, setState] = useState("loading"); // loading | done | invalid | error
  const [preview, setPreview] = useState(false);

  const run = async () => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (!token) {
      if (inPreview()) { setPreview(true); setState("done"); } else setState("invalid");
      return;
    }
    setState("loading");
    const res = await fetch("/api/app-emails/unsubscribe", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
    }).catch(() => null);
    if (res?.ok) setState("done");
    else if (res?.status === 400) setState("invalid");
    else setState("error");
  };

  useEffect(() => { run(); }, []);

  const ok = state === "done";
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border p-8 text-center space-y-4">
        <VeritasLogo size={48} className="mx-auto" />
        {state === "loading" ? (
          <div className="flex flex-col items-center gap-3 py-4" style={{ minHeight: 120 }}>
            <Spinner />
            <p className="text-sm text-muted-foreground">{a.uLoading}</p>
          </div>
        ) : (
          <>
            {ok ? <MailX className="w-8 h-8 mx-auto text-primary" /> : <AlertCircle className="w-8 h-8 mx-auto text-destructive" />}
            {preview && <span className="inline-block text-[11px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{a.uPreview}</span>}
            <h1 className="font-cinzel text-2xl font-bold text-foreground">{ok ? a.uTitle : state === "invalid" ? a.uBad : a.error}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{ok ? a.uBody : state === "invalid" ? a.uBadBody : ""}</p>
            {state === "error" && (
              <button onClick={run} className="px-5 min-h-11 rounded-full bg-primary text-primary-foreground text-sm">{a.uRetry}</button>
            )}
            <Link to="/" className="block text-sm underline text-muted-foreground pt-2">{a.uHome}</Link>
          </>
        )}
      </div>
    </main>
  );
}