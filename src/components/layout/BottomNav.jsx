import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Home, BookOpen, Search, Bookmark, User } from "lucide-react";

const TABS = [
  { path: "/",        icon: Home,     label: "Home"    },
  { path: "/read",    icon: BookOpen, label: "Read"    },
  { path: "/search",  icon: Search,   label: "Search"  },
  { path: "/library", icon: Bookmark, label: "Library" },
  { path: "/profile", icon: User,     label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const shouldReduce = useReducedMotion();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: "rgba(8,12,24,0.88)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Safe area padding */}
      <div className="flex items-center justify-around px-2 pt-2 pb-safe pb-3">
        {TABS.map(({ path, icon: Icon, label }) => {
          const isActive = path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(path);

          return (
            <Link key={path} to={path} className="relative flex flex-col items-center gap-1 px-4 py-1">
              {/* Active pill indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-pill"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full"
                  style={{ background: "#00f5ff", boxShadow: "0 0 10px rgba(0,245,255,0.8)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <motion.div
                animate={isActive && !shouldReduce ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                whileTap={shouldReduce ? {} : { scale: 0.88 }}
              >
                <Icon
                  className="w-5 h-5 transition-colors duration-200"
                  style={{ color: isActive ? "#00f5ff" : "rgba(255,255,255,0.35)" }}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </motion.div>

              <span
                className="text-[10px] font-inter transition-colors duration-200"
                style={{ color: isActive ? "#00f5ff" : "rgba(255,255,255,0.28)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}