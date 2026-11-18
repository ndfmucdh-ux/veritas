import { useLocation } from "react-router-dom";
import { useLang } from "@/lib/LanguageContext";
import { getBottomNavItems } from "@/lib/navigationItems.jsx";
import BottomNavItem from "@/components/layout/BottomNavItem.jsx";

export default function BottomNav() {
  const location = useLocation();
  const { t } = useLang();
  const navItems = getBottomNavItems(t);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-[var(--surface-glass)] backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {navItems.map((item) => (
        <BottomNavItem key={item.path} {...item} active={location.pathname === item.path} />
      ))}
    </nav>
  );
}