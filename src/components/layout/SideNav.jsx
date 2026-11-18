import { useLocation, Link } from "react-router-dom";
import { useLang } from "@/lib/LanguageContext";
import { getSideNavItems } from "@/lib/navigationItems.jsx";
import SideNavItem from "@/components/layout/SideNavItem.jsx";

export default function SideNav() {
  const location = useLocation();
  const { t } = useLang();
  const items = getSideNavItems(t);

  return (
    <nav
      aria-label="Main"
      className="hidden md:flex fixed left-0 top-[57px] bottom-0 z-40 flex-col w-56 px-3 py-4 gap-1 overflow-y-auto scrollbar-hide"
      style={{ background: "var(--chrome-surface)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRight: "1px solid var(--hairline)" }}
    >
      {[1, 2].map((g) => (
        <div key={g} className={g === 2 ? "mt-2 pt-3 border-t space-y-0.5" : "space-y-0.5"} style={g === 2 ? { borderColor: "var(--hairline)" } : undefined}>
          {items.filter((i) => i.group === g).map((item) => (
            <SideNavItem key={item.path} {...item} active={location.pathname === item.path} />
          ))}
        </div>
      ))}

      <Link to="/read?book=Psalms&chapter=119&verse=105" className="mt-auto rounded-2xl p-3.5 block" style={{ background: "var(--fill-2)", border: "1px solid var(--hairline)" }}>
        <p className="font-playfair text-[15px] leading-snug" style={{ color: "rgb(var(--ink) / 0.85)" }}>
          “Your word is a lamp to my feet and a light to my path.”
        </p>
        <p className="font-inter text-xs mt-2 font-medium" style={{ color: "var(--t-purple)" }}>Psalm 119:105</p>
      </Link>
    </nav>
  );
}