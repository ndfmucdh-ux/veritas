import { useLang } from "@/lib/LanguageContext";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "es" : "en")}
      className="px-2.5 py-1.5 rounded-xl text-[10px] font-cinzel font-bold tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-cyan/70"
      style={{ background: "var(--fill-3)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {lang === "en" ? "ES" : "EN"}
    </button>
  );
}