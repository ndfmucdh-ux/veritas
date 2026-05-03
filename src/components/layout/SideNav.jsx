import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Search, BookMarked, Zap, Map, Compass, GraduationCap, Image } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/read", icon: BookOpen, label: "Read" },
  { path: "/study", icon: GraduationCap, label: "Study" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/library", icon: BookMarked, label: "Library" },
  { path: "/plans", icon: Map, label: "Plans" },
  { path: "/discover", icon: Compass, label: "Discover" },
  { path: "/verse-art", icon: Image, label: "Verse Art" },
  { path: "/profile", icon: Zap, label: "Profile" },
];

export default function SideNav() {
  const location = useLocation();

  return (
    <nav
      className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 flex-col items-center py-6 gap-1 w-16"
      style={{
        background: "rgba(6,10,20,0.92)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path;
        return (
          <Link key={path} to={path} title={label}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{
                background: active ? "rgba(251,191,36,0.12)" : "transparent",
                border: active ? "1px solid rgba(251,191,36,0.25)" : "1px solid transparent",
              }}
            >
              <Icon
                style={{
                  width: 22, height: 22,
                  color: active ? "#fbbf24" : "rgba(255,255,255,0.35)",
                }}
              />
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}