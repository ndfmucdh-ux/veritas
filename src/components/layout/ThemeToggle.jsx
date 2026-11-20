import { useEffect, useState } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useLang } from "@/lib/LanguageContext";
import { getThemeMode, setThemeMode } from "@/lib/theme";
import { savePrefs } from "@/lib/preferencesSync";

const LABELS = {
  en: { light: "Light", dark: "Dark", system: "System", title: "Theme" },
  es: { light: "Claro", dark: "Oscuro", system: "Sistema", title: "Tema" },
  fr: { light: "Clair", dark: "Sombre", system: "Système", title: "Thème" },
  pt: { light: "Claro", dark: "Escuro", system: "Sistema", title: "Tema" },
  de: { light: "Hell", dark: "Dunkel", system: "System", title: "Design" },
};
const ICONS = { light: Sun, dark: Moon, system: Monitor };

export default function ThemeToggle() {
  const { lang } = useLang();
  const labels = LABELS[lang] || LABELS.en;
  const [mode, setMode] = useState(getThemeMode);

  useEffect(() => {
    const sync = (e) => setMode(e.detail);
    window.addEventListener("veritas:theme", sync);
    return () => window.removeEventListener("veritas:theme", sync);
  }, []);

  const Icon = ICONS[mode];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${labels.title}: ${labels[mode]}`}
        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-cyan/70"
        style={{ background: "var(--fill-3)", color: "hsl(var(--muted-foreground))", border: "1px solid var(--hairline)" }}
      >
        <Icon className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        {Object.keys(ICONS).map((id) => {
          const ItemIcon = ICONS[id];
          return (
            <DropdownMenuItem key={id} onSelect={() => { setMode(id); setThemeMode(id); savePrefs({ theme_mode: id }); }} className="gap-2 min-h-10">
              <ItemIcon className="w-4 h-4" />
              <span className="flex-1">{labels[id]}</span>
              {mode === id && <Check className="w-4 h-4 text-cyan" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}