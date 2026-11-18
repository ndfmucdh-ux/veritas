import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useLang } from "@/lib/LanguageContext";

const OPTIONS = [
  { id: "light", icon: Sun },
  { id: "dark", icon: Moon },
  { id: "system", icon: Monitor },
];

export default function ThemeSelector() {
  const { pref, setPref } = useTheme();
  const { tr } = useLang();

  return (
    <div className="px-1 py-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{tr("theme_title")}</p>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={tr("theme_title")}>
        {OPTIONS.map(({ id, icon: Icon }) => {
          const active = pref === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPref(id)}
              className={`min-h-[44px] rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 border ${
                active ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground border-border hover:border-primary/50"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              {tr(`theme_${id}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}