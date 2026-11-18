import { Check } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useLang } from "@/lib/LanguageContext";
import { LANGUAGES } from "@/lib/i18n";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={current.label}
        className="px-2.5 py-1.5 rounded-xl text-[10px] font-cinzel font-bold tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-cyan/70"
        style={{ background: "var(--fill-3)", color: "hsl(var(--muted-foreground))", border: "1px solid var(--hairline)" }}
      >
        {lang.toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[9rem]">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem key={l.code} onSelect={() => setLang(l.code)} className="gap-2 min-h-10">
            <span className="flex-1">{l.label}</span>
            {l.code === lang && <Check className="w-4 h-4 text-cyan" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}