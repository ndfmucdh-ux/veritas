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
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
      style={{
        background: "rgba(6,10,20,0.92)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {navItems.map((item) => (
        <BottomNavItem key={item.path} {...item} active={location.pathname === item.path} />
      ))}
    </nav>
  );
}