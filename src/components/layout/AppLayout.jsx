import { Suspense } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import RouteFallback from "@/components/layout/RouteFallback";
import { Star, Target } from "lucide-react";
import BottomNav from "./BottomNav.jsx";
import SideNav from "./SideNav.jsx";
import FloatingActionButton from "./FloatingActionButton.jsx";
import VeritasLogo from "@/components/ui/VeritasLogo";
import AssistantButton from "@/components/assistant/AssistantButton";
import HeaderProfileLink from "@/components/layout/HeaderProfileLink.jsx";
import LangToggle from "@/components/layout/LangToggle.jsx";
import ThemeToggle from "@/components/layout/ThemeToggle.jsx";
import HeaderNavPill from "@/components/layout/HeaderNavPill.jsx";
import useCurrentUserDisplay from "@/hooks/useCurrentUserDisplay";
import { useLang } from "@/lib/LanguageContext";

export default function AppLayout() {
  const location = useLocation();
  const { t } = useLang();
  const isImmersive = location.pathname.startsWith("/read") && location.search.includes("immersive=1");
  const { displayName, displayAvatar } = useCurrentUserDisplay();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isImmersive && <SideNav />}

      {!isImmersive && (
        <header className="sticky top-0 z-50 px-4 h-[57px] flex items-center justify-between md:pl-20 border-b border-border bg-[var(--surface-glass)] backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-2.5 min-h-11">
            <VeritasLogo size={32} />
            <span className="font-cinzel font-semibold text-base tracking-[0.12em] text-foreground">VERITAS</span>
          </Link>

          <div className="flex items-center gap-1">
            <LangToggle />
            <ThemeToggle />
            <HeaderNavPill to="/plans" icon={Target} label={t.plans} />
            <HeaderNavPill to="/discover" icon={Star} label={t.discover} />
            <HeaderProfileLink avatarUrl={displayAvatar} displayName={displayName} />
          </div>
        </header>
      )}

      <main className="flex-1 pt-[57px]">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>

      {!isImmersive && <BottomNav />}
      {location.pathname === "/read" && <FloatingActionButton />}
      {!isImmersive && <AssistantButton />}
    </div>
  );
}