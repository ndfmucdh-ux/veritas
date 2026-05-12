import { useLocation, Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Target } from "lucide-react";
import BottomNav from "./BottomNav.jsx";
import SideNav from "./SideNav.jsx";
import FloatingActionButton from "./FloatingActionButton.jsx";
import VeritasLogo from "@/components/ui/VeritasLogo";
import { useLang } from "@/lib/LanguageContext";
import AssistantButton from "@/components/assistant/AssistantButton";
import { base44 } from "@/api/base44Client";
import { useState, useEffect } from "react";

export default function AppLayout() {
  const location = useLocation();
  const isImmersive = location.pathname.startsWith("/read") && location.search.includes("immersive=1");
  const [avatarUrl, setAvatarUrl] = useState(() => sessionStorage.getItem("veritas_avatar_url") || null);
  const [displayName, setDisplayName] = useState(() => sessionStorage.getItem("veritas_display_name") || "");

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u) {
        const name = sessionStorage.getItem("veritas_display_name") || u.full_name || "";
        const avatar = sessionStorage.getItem("veritas_avatar_url") || u.avatar_url || null;
        setDisplayName(name);
        setAvatarUrl(avatar);
        if (u.full_name && !sessionStorage.getItem("veritas_display_name")) {
          sessionStorage.setItem("veritas_display_name", u.full_name);
        }
        if (u.avatar_url && !sessionStorage.getItem("veritas_avatar_url")) {
          sessionStorage.setItem("veritas_avatar_url", u.avatar_url);
        }
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {!isImmersive && <SideNav />}

      {!isImmersive && (
        <header
          className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between md:pl-20"
          style={{
            background: "rgba(6,10,20,0.82)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
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
            <NavPill to="/plans" icon={Target} label="Plans" />
            <NavPill to="/discover" icon={Star} label="Discover" />
            <Link to="/profile">
              <motion.div whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.05 }}
                className="ml-1 flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName}
                    className="w-8 h-8 rounded-xl object-cover"
                    style={{ border: "1.5px solid rgba(251,191,36,0.4)", boxShadow: "0 0 10px rgba(251,191,36,0.15)" }} />
                ) : (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center font-cinzel text-sm font-bold"
                    style={{ background: "rgba(251,191,36,0.12)", border: "1.5px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
                    {displayName?.[0]?.toUpperCase() || "V"}
                  </div>
                )}
              </motion.div>
            </Link>
          </div>
        </header>
      )}

      <main className="flex-1 pt-[57px]">
        <Outlet />
      </main>

      {!isImmersive && <BottomNav />}
      {location.pathname === "/read" && <FloatingActionButton />}
      {!isImmersive && <AssistantButton />}
    </div>
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "es" : "en")}
      className="px-2.5 py-1.5 rounded-xl text-[10px] font-cinzel font-bold tracking-widest transition-colors"
      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {lang === "en" ? "ES" : "EN"}
    </button>
  );
}

function NavPill({ to, icon: Icon, label, iconOnly = false }) {
  return (
    <Link to={to}>
      <motion.div
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-inter"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        <Icon style={{ width: iconOnly ? 22 : 16, height: iconOnly ? 22 : 16 }} />
        {!iconOnly && <span className="hidden md:inline">{label}</span>}
      </motion.div>
    </Link>
  );
}