import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { prefetchRoute } from "@/lib/routeLoaders";
import { Check, Sun, Moon, Monitor, User } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useLang } from "@/lib/LanguageContext";
import { LANGUAGES } from "@/lib/i18n";
import { getThemeMode, setThemeMode } from "@/lib/theme";

const THEMES = [["light", "Light", Sun], ["dark", "Dark", Moon], ["system", "System", Monitor]];

// One avatar button holds profile, language and theme so the top bar stays calm.
export default function HeaderProfileLink({ avatarUrl, displayName }) {
  const { lang, setLang } = useLang();
  const [mode, setMode] = useState(getThemeMode);

  useEffect(() => {
    const sync = (e) => setMode(e.detail);
    window.addEventListener("veritas:theme", sync);
    return () => window.removeEventListener("veritas:theme", sync);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Profile and settings" onPointerEnter={() => prefetchRoute("/profile")} onPointerDown={() => prefetchRoute("/profile")} className="flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName || "Profile"} className="w-11 h-11 rounded-full object-cover" style={{ border: "2px solid var(--t-gold)" }} />
        ) : (
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-cinzel text-xl font-bold" style={{ background: "var(--fill-3)", border: "2px solid var(--t-gold)", color: "var(--t-gold)" }}>
            {displayName?.[0]?.toUpperCase() || "V"}
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[11rem]">
        <DropdownMenuItem asChild className="gap-2 min-h-10"><Link to="/profile"><User className="w-4 h-4" /> Profile</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">Theme</DropdownMenuLabel>
        {THEMES.map(([id, label, Icon]) => (
          <DropdownMenuItem key={id} onSelect={() => setThemeMode(id)} className="gap-2 min-h-10">
            <Icon className="w-4 h-4" /><span className="flex-1">{label}</span>{id === mode && <Check className="w-4 h-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">Language</DropdownMenuLabel>
        {LANGUAGES.map((l) => (
          <DropdownMenuItem key={l.code} onSelect={() => setLang(l.code)} className="gap-2 min-h-10">
            <span className="flex-1">{l.label}</span>{l.code === lang && <Check className="w-4 h-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}