import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useLang } from "@/lib/LanguageContext";

const ORDER = ["light", "dark", "system"];
const ICONS = { light: Sun, dark: Moon, system: Monitor };

export default function ThemeToggle() {
  const { pref, setPref } = useTheme();
  const { tr } = useLang();
  const Icon = ICONS[pref];
  const next = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];

  return (
    <button
      type="button"
      onClick={() => setPref(next)}
      aria-label={`${tr("theme_toggle")}: ${tr(`theme_${pref}`)}`}
      title={tr(`theme_${pref}`)}
      className="w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
    </button>
  );
}