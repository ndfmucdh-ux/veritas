import { useLocation } from "react-router-dom";
import { useLang } from "@/lib/LanguageContext";
import { getSideNavItems } from "@/lib/navigationItems.jsx";
import SideNavItem from "@/components/layout/SideNavItem.jsx";

export default function SideNav() {
  const location = useLocation();
  const { t } = useLang();

  const navItems = getSideNavItems(t);

  return (
    <nav
      className="hidden md:flex fixed left-0 top-[57px] bottom-0 z-40 flex-col items-center py-6 gap-1 w-16"
      style={{
        background: "var(--chrome-surface)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid var(--hairline)",
      }}
    >
      {navItems.map((item) => (
        <SideNavItem key={item.path} {...item} active={location.pathname === item.path} />
      ))}
    </nav>
  );
}