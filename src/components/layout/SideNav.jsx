import { useLocation, Link } from "react-router-dom";
import { useLang } from "@/lib/LanguageContext";
import { getSideNavItems } from "@/lib/navigationItems.jsx";
import SideNavItem from "@/components/layout/SideNavItem.jsx";
import useSideNavWidth from "@/hooks/useSideNavWidth";

export default function SideNav() {
  const location = useLocation();
  const { t } = useLang();
  const items = getSideNavItems(t);
  const { width, collapsed, setWidth, reset } = useSideNavWidth();

  // Drag the right border to resize; below a threshold it snaps to icons-only.
  const startDrag = (e) => {
    e.preventDefault();
    const onMove = (ev) => setWidth(ev.clientX);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <>
    <nav
      aria-label="Main"
      className={`hidden md:flex fixed left-0 top-[57px] bottom-0 z-40 flex-col py-4 gap-1 overflow-y-auto overflow-x-hidden scrollbar-hide ${collapsed ? "px-2" : "px-3"}`}
      style={{ width, background: "var(--chrome-surface)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRight: "1px solid var(--hairline)" }}
    >
      {[1, 2].map((g) => (
        <div key={g} className={g === 2 ? "mt-2 pt-3 border-t space-y-0.5" : "space-y-0.5"} style={g === 2 ? { borderColor: "var(--hairline)" } : undefined}>
          {items.filter((i) => i.group === g).map((item) => (
            <SideNavItem key={item.path} {...item} collapsed={collapsed} active={location.pathname === item.path} />
          ))}
        </div>
      ))}

      {!collapsed && (
        <Link to="/read?book=Psalms&chapter=119&verse=105" className="mt-auto rounded-2xl p-3.5 block" style={{ background: "var(--fill-2)", border: "1px solid var(--hairline)" }}>
          <p className="font-playfair text-[15px] leading-snug" style={{ color: "rgb(var(--ink) / 0.85)" }}>
            “Your word is a lamp to my feet and a light to my path.”
          </p>
          <p className="font-inter text-xs mt-2 font-medium" style={{ color: "var(--t-purple)" }}>Psalm 119:105</p>
        </Link>
      )}
    </nav>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize menu"
        onPointerDown={startDrag}
        onDoubleClick={reset}
        className="hidden md:block fixed top-[57px] bottom-0 z-40 w-2 -translate-x-1/2 cursor-col-resize touch-none hover:bg-[hsl(var(--primary)/0.35)] active:bg-[hsl(var(--primary)/0.5)] transition-colors"
        style={{ left: width }}
      />
    </>
  );
}