import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { getBottomNavItems, getSideNavItems } from "@/lib/navigationItems.jsx";
import BottomNavItem from "@/components/layout/BottomNavItem.jsx";
import MoreSheet from "@/components/layout/MoreSheet.jsx";

export default function BottomNav() {
  const location = useLocation();
  const { t } = useLang();
  const [moreOpen, setMoreOpen] = useState(false);

  const navItems = getBottomNavItems(t);
  const shown = navItems.map((i) => i.path);
  const moreItems = getSideNavItems(t).filter((i) => !shown.includes(i.path));
  const moreActive = moreItems.some((i) => i.path === location.pathname);

  return (
    <>
      <nav
        className="nav-bottom fixed left-0 right-0 bottom-0 z-50"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          background: "hsl(var(--background) / 0.96)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid var(--hairline)",
        }}
      >
        {navItems.map((item) => (
          <BottomNavItem key={item.path} {...item} active={location.pathname === item.path} />
        ))}
        <BottomNavItem icon={MoreHorizontal} label={t.more || "More"} active={moreActive} onClick={() => setMoreOpen(true)} />
      </nav>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} items={moreItems} pathname={location.pathname} title={t.more || "More"} />
    </>
  );
}