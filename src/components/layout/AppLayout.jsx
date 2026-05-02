import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, BookOpen, Search, Bookmark, User, 
  Menu, X, Star, Target, Zap
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/read", icon: BookOpen, label: "Read" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/library", icon: Bookmark, label: "Library" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function AppLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Full-screen reading mode hides nav
  const isReadingMode = location.pathname.startsWith("/read/") && location.search.includes("immersive");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      {!isReadingMode && (
        <header className="glass sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-border/50">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-cyan flex items-center justify-center">
              <span className="text-background font-cinzel font-bold text-sm">V</span>
            </div>
            <span className="font-cinzel font-bold text-lg tracking-wider text-foreground">
              VERITAS
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/plans" className="hidden md:flex items-center gap-1.5 text-muted-foreground hover:text-gold transition-colors text-sm">
              <Target className="w-4 h-4" />
              <span>Plans</span>
            </Link>
            <Link to="/discover" className="hidden md:flex items-center gap-1.5 text-muted-foreground hover:text-cyan transition-colors text-sm">
              <Star className="w-4 h-4" />
              <span>Discover</span>
            </Link>
            <Link to="/profile" className="flex items-center gap-1.5 text-muted-foreground hover:text-purple transition-colors">
              <Zap className="w-4 h-4" />
            </Link>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      {!isReadingMode && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border/50">
          <div className="flex items-center justify-around py-2 px-4">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path || 
                (path !== "/" && location.pathname.startsWith(path));
              return (
                <Link
                  key={path}
                  to={path}
                  className="flex flex-col items-center gap-1 px-3 py-1 relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-xl bg-primary/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-cyan" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-xs transition-colors ${
                      isActive ? "text-cyan font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Desktop Side Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 z-40 glass border-r border-border/50 flex-col items-center py-20 gap-6">
        {NAV_ITEMS.map(({ path, icon: NavIcon, label }) => {
          const isActive = location.pathname === path || 
            (path !== "/" && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              title={label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? "bg-cyan/20 text-cyan glow-cyan"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <NavIcon className="w-5 h-5" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}