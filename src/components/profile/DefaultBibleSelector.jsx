import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { TRANSLATIONS, getTranslationLang } from "@/lib/bibleData";
import { chooseTranslation } from "@/lib/defaultBible";
import { useLang } from "@/lib/LanguageContext";
import useDefaultTranslation from "@/hooks/useDefaultTranslation";

const LANGUAGES = [
  ["en", "English"], ["es", "Español"], ["pt", "Português"], ["fr", "Français"], ["it", "Italiano"], ["de", "Deutsch"],
];

// Pick the default Bible from every version in every language. Saved to the account immediately.
export default function DefaultBibleSelector() {
  const { lang } = useLang();
  const current = useDefaultTranslation(lang);
  const [group, setGroup] = useState(getTranslationLang(current));
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TRANSLATIONS.filter((t) =>
      q ? `${t.code} ${t.name}`.toLowerCase().includes(q) : t.lang === group);
  }, [group, query]);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Bible language">
        {LANGUAGES.map(([code, label]) => (
          <button key={code} role="tab" aria-selected={group === code && !query} onClick={() => { setGroup(code); setQuery(""); }}
            className="px-3 min-h-9 rounded-xl text-xs font-inter"
            style={{
              background: group === code && !query ? "hsl(var(--primary) / 0.16)" : "var(--fill-1)",
              color: group === code && !query ? "hsl(var(--primary))" : "rgb(var(--ink) / 0.6)",
              border: "1px solid var(--hairline)",
            }}>{label}</button>
        ))}
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgb(var(--ink) / 0.4)" }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search all Bibles"
          aria-label="Search all Bibles"
          className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm font-inter focus:outline-none"
          style={{ fontSize: 16, background: "var(--fill-2)", border: "1px solid var(--hairline)", color: "rgb(var(--ink) / 0.85)" }} />
      </div>
      <div className="max-h-56 overflow-y-auto rounded-xl" style={{ border: "1px solid var(--hairline)" }}>
        {list.map((t) => (
          <button key={t.code} onClick={() => chooseTranslation(t.code)} aria-pressed={current === t.code}
            className="w-full flex items-center gap-3 px-3 min-h-11 text-left"
            style={{ background: current === t.code ? "hsl(var(--primary) / 0.12)" : "transparent", borderBottom: "1px solid var(--hairline)" }}>
            <span className="text-xs font-cinzel font-bold w-16 flex-shrink-0" style={{ color: "hsl(var(--primary))" }}>{t.code}</span>
            <span className="flex-1 min-w-0 truncate text-sm font-inter" style={{ color: "rgb(var(--ink) / 0.8)" }}>{t.name}</span>
            {current === t.code && <Check className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--primary))" }} />}
          </button>
        ))}
        {list.length === 0 && <p className="p-3 text-xs font-inter" style={{ color: "rgb(var(--ink) / 0.5)" }}>No Bibles found</p>}
      </div>
    </div>
  );
}