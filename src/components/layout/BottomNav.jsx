import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Search, BookMarked, Heart, Users } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/read", icon: BookOpen, label: "Read" },
  { path: "/study-center", icon: BookMarked, label: "Study" },
  { path: "/prayer-journal", icon: Heart, label: "Prayer" },
  { path: "/community", icon: Users, label: "Community" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
      style={{
        background: "rgba(6,10,20,0.92)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path;
        return (
          <Link key={path} to={path} className="flex-1 flex flex-col items-center justify-center py-3 gap-1">
            <motion.div animate={{ scale: active ? 1.15 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
              <Icon
                style={{
                  width: 30, height: 30,
                  color: active ? "#fbbf24" : "rgba(255,255,255,0.35)",
                }}
              />
            </motion.div>
            <span
              className="text-[10px] font-inter"
              style={{ color: active ? "#fbbf24" : "rgba(255,255,255,0.3)" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}