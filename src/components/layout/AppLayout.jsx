import { Suspense } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import RouteFallback from "@/components/layout/RouteFallback";
import { motion } from "framer-motion";
import { Star, Target } from "lucide-react";
import BottomNav from "./BottomNav.jsx";
import SideNav from "./SideNav.jsx";
import FloatingActionButton from "./FloatingActionButton.jsx";
import VeritasLogo from "@/components/ui/VeritasLogo";
import AssistantButton from "@/components/assistant/AssistantButton";
import HeaderProfileLink from "@/components/layout/HeaderProfileLink.jsx";
import LangToggle from "@/components/layout/LangToggle.jsx";
import HeaderNavPill from "@/components/layout/HeaderNavPill.jsx";
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
          className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between md:pl-20"
          style={{
            background: "var(--chrome-surface)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <motion.div whileHover={{ scale: 1.05 }} style={{ boxShadow: "0 0 18px rgba(255,215,0,0.3)" }} className="rounded-xl">
              <VeritasLogo size={34} />
            </motion.div>
            <span className="font-cinzel font-bold text-base tracking-[0.12em] text-white/90">
              VERITAS
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <LangToggle />
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