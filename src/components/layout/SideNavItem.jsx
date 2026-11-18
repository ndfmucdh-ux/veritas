import { Link } from "react-router-dom";

export default function SideNavItem({ path, icon: Icon, label, active, collapsed }) {
  return (
    <Link
      to={path}
      aria-label={label}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={`flex items-center min-h-11 rounded-xl transition-colors hover:bg-[var(--fill-2)] ${collapsed ? "justify-center" : "gap-3 px-3"}`}
      style={{ background: active ? "hsl(var(--primary) / 0.16)" : undefined }}
    >
      <Icon style={{ width: 22, height: 22, flexShrink: 0, color: active ? "var(--t-green)" : "rgb(var(--ink) / 0.65)" }} strokeWidth={1.7} />
      {!collapsed && (
        <span className="font-cinzel text-[17px] leading-tight truncate" style={{ color: active ? "hsl(var(--foreground))" : "rgb(var(--ink) / 0.8)", fontWeight: active ? 700 : 500 }}>
          {label}
        </span>
      )}
    </Link>
  );
}