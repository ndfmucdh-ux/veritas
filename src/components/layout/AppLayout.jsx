import { useLocation, Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Target, Zap } from "lucide-react";
import BottomNav from "./BottomNav";
import SideNav from "./SideNav";
import FloatingActionButton from "./FloatingActionButton";

export default function AppLayout() {
  const location = useLocation();
  // Hide nav chrome in immersive reading mode
  const isImmersive = location.pathname.startsWith("/read") && location.search.includes("immersive=1");

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop side nav */}
      {!isImmersive && <SideNav />}

      {/* Top header */}
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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(0,245,255,0.25), rgba(0,180,255,0.15))",
                border: "1px solid rgba(0,245,255,0.3)",
                boxShadow: "0 0 14px rgba(0,245,255,0.2)",
              }}
            >
              <span className="font-cinzel font-bold text-sm" style={{ color: "#00f5ff" }}>V</span>
            </motion.div>
            <span className="font-cinzel font-bold text-base tracking-[0.12em] text-white/90">
              VERITAS
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <NavPill to="/plans" icon={Target} label="Plans" />
            <NavPill to="/discover" icon={Star} label="Discover" />
            <NavPill to="/profile" icon={Zap} iconOnly />
          </div>
        </header>
      )}

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      {!isImmersive && <BottomNav />}

      {/* FAB — only on reader */}
      {location.pathname === "/read" && <FloatingActionButton />}
    </div>
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
        <Icon className={iconOnly ? "w-4.5 h-4.5" : "w-3.5 h-3.5"} style={{ width: iconOnly ? 18 : 14, height: iconOnly ? 18 : 14 }} />
        {!iconOnly && <span className="hidden md:inline">{label}</span>}
      </motion.div>
    </Link>
  );
}