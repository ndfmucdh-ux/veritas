import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Search, BookMarked, Zap, Map, Compass, GraduationCap, Image } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/LanguageContext";

export default function SideNav() {
  const location = useLocation();
  const { t } = useLang();

  const NAV_ITEMS = [
    { path: "/", icon: Home, label: t.home },
    { path: "/read", icon: BookOpen, label: t.read },
    { path: "/study", icon: GraduationCap, label: t.study },
    { path: "/search", icon: Search, label: t.search },
    { path: "/library", icon: BookMarked, label: t.library },
    { path: "/plans", icon: Map, label: t.plans },
    { path: "/discover", icon: Compass, label: t.discover },
    { path: "/verse-art", icon: Image, label: t.verseArt },
    { path: "/profile", icon: Zap, label: t.profile },
  ];

  return (
    <nav
      className="hidden md:flex fixed left-0 top-[57px] bottom-0 z-40 flex-col items-center py-6 gap-1 w-16"
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
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
              style={{
                background: active ? "rgba(251,191,36,0.12)" : "transparent",
                border: active ? "1px solid rgba(251,191,36,0.25)" : "1px solid transparent",
              }}
            >
              <Icon style={{ width: 24, height: 24, color: active ? "#fbbf24" : "rgba(255,255,255,0.35)" }} />
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}