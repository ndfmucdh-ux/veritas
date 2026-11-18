import { useLang } from "@/lib/LanguageContext";
import { LANGUAGES } from "@/lib/i18n";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  const next = LANGUAGES[(LANGUAGES.findIndex((l) => l.code === lang) + 1) % LANGUAGES.length];
  return (
    <button
      type="button"
      onClick={() => setLang(next.code)}
      aria-label={next.label}
      className="px-2.5 py-1.5 rounded-xl text-[10px] font-cinzel font-bold tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-cyan/70"
      style={{ background: "var(--fill-3)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {lang.toUpperCase()}
    </button>
  );
}