import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import RouteFallback from "@/components/layout/RouteFallback";
import HeaderBrand from "@/components/layout/HeaderBrand.jsx";
import PullToRefresh from "@/components/layout/PullToRefresh.jsx";
import BottomNav from "./BottomNav.jsx";
import SideNav from "./SideNav.jsx";
import FloatingActionButton from "./FloatingActionButton.jsx";
import AssistantButton from "@/components/assistant/AssistantButton";
import HeaderProfileLink from "@/components/layout/HeaderProfileLink.jsx";
import useCurrentUserDisplay from "@/hooks/useCurrentUserDisplay";
import { useLang } from "@/lib/LanguageContext";

export default function AppLayout() {
  const location = useLocation();
  const isImmersive = location.pathname.startsWith("/read") && location.search.includes("immersive=1");
  const { displayName, displayAvatar } = useCurrentUserDisplay();
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-background">
      {!isImmersive && <SideNav />}

      {!isImmersive && (
        <header
          className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between md:px-6"
          style={{
            paddingTop: "calc(0.75rem + env(safe-area-inset-top))",
            background: "var(--chrome-surface)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <HeaderBrand />

          <div className="flex items-center gap-1">
            <HeaderProfileLink avatarUrl={displayAvatar} displayName={displayName} />
          </div>
        </header>
      )}

      <main className={`flex-1 ${isImmersive ? "" : `has-sidenav ${location.pathname.startsWith("/read") ? "is-reader" : ""}`}`}>
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <PullToRefresh />
      {!isImmersive && <BottomNav />}
      {location.pathname === "/read" && <FloatingActionButton />}
      {!isImmersive && <AssistantButton />}
    </div>
  );
}