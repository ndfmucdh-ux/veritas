import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import Toggle from "@/components/ui/Toggle";
import { useLang } from "@/lib/LanguageContext";
import { savePrefs, getMyPrefs } from "@/lib/preferencesSync";

// Opt in or out of the Verse of the Day email. Saved to the account at once.
export default function DailyVerseEmailToggle() {
  const { t } = useLang();
  const [on, setOn] = useState(true);

  useEffect(() => {
    getMyPrefs()
      .then((p) => setOn(p?.votd_email_enabled !== false))
      .catch(() => {});
  }, []);

  const change = () => {
    setOn((v) => { savePrefs({ votd_email_enabled: !v }); return !v; });
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl" style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
      <div className="min-w-0">
        <p className="text-sm font-inter" style={{ color: "rgb(var(--ink) / 0.85)" }}>{t.s9VotdEmail}</p>
        <p className="text-[11px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.55)" }}>{t.s9VotdEmailSub}</p>
      </div>
      <Toggle value={on} onChange={change} label={t.s9VotdEmail} />
    </div>
  );
}