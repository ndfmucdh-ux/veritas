import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, BookOpen, Search, Bookmark, User, Star, Target } from "lucide-react";

const ITEMS = [
  { path: "/",        icon: Home,     label: "Home"    },
  { path: "/read",    icon: BookOpen, label: "Read"    },
  { path: "/search",  icon: Search,   label: "Search"  },
  { path: "/library", icon: Bookmark, label: "Library" },
  { path: "/discover",icon: Star,     label: "Discover"},
  { path: "/plans",   icon: Target,   label: "Plans"   },
  { path: "/profile", icon: User,     label: "Profile" },
];

export default function SideNav() {
  const location = useLocation();

  return (
    <nav
      className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 z-40 flex-col items-center py-6 gap-1"
      style={{
        background: "rgba(6,10,20,0.85)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <Link to="/" className="mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.25), rgba(0,245,255,0.08))", border: "1px solid rgba(0,245,255,0.3)" }}>
          <span className="font-cinzel font-bold text-sm" style={{ color: "#00f5ff" }}>V</span>
        </div>
      </Link>

      {ITEMS.map(({ path, icon: Icon, label }) => {
        const isActive = path === "/"
          ? location.pathname === "/"
          : location.pathname.startsWith(path);

        return (
          <Link key={path} to={path} title={label}>
            <motion.div
              whileHover={{ scale: 1.08, x: 2 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center relative transition-colors"
              style={isActive ? {
                background: "rgba(0,245,255,0.12)",
                boxShadow: "0 0 16px rgba(0,245,255,0.15)",
              } : {}}
            >
              {isActive && (
                <motion.div
                  layoutId="side-nav-active"
                  className="absolute left-0 w-0.5 h-5 rounded-full"
                  style={{ background: "#00f5ff", boxShadow: "0 0 8px rgba(0,245,255,0.9)", left: "-1px" }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className="w-4.5 h-4.5 transition-colors"
                style={{ color: isActive ? "#00f5ff" : "rgba(255,255,255,0.3)", width: 18, height: 18 }}
                strokeWidth={isActive ? 2.2 : 1.7}
              />
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}