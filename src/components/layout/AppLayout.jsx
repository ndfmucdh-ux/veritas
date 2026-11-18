import { Suspense } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import RouteFallback from "@/components/layout/RouteFallback";
import { motion } from "framer-motion";
import BottomNav from "./BottomNav.jsx";
import SideNav from "./SideNav.jsx";
import FloatingActionButton from "./FloatingActionButton.jsx";
import VeritasLogo from "@/components/ui/VeritasLogo";
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
            background: "var(--chrome-surface)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <motion.div whileHover={{ scale: 1.05 }} className="rounded-xl">
              <VeritasLogo size={34} />
            </motion.div>
            <span className="font-cinzel font-bold text-xl tracking-[0.1em] text-foreground">
              VERITAS
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <HeaderProfileLink avatarUrl={displayAvatar} displayName={displayName} />
          </div>
        </header>
      )}

      <main className={`flex-1 ${isImmersive ? "" : "md:pl-56"}`}>
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