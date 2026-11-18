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
      className="fixed left-3 right-3 z-50 flex md:hidden rounded-3xl"
      style={{
        bottom: "calc(12px + env(safe-area-inset-bottom))",
        background: "hsl(var(--surface-4) / 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--hairline)",
        boxShadow: "0 8px 24px rgba(8,11,20,0.28)",
      }}
    >
      {navItems.map((item) => (
        <BottomNavItem key={item.path} {...item} active={location.pathname === item.path} />
      ))}
    </nav>
  );
}