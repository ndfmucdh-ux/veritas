import { Link } from "react-router-dom";

export default function SideNavItem({ path, icon: Icon, label, active }) {
  return (
    <Link
      to={path}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="flex items-center gap-3 px-3 min-h-11 rounded-xl transition-colors hover:bg-[var(--fill-2)]"
      style={{ background: active ? "hsl(var(--primary) / 0.16)" : undefined }}
    >
      <Icon style={{ width: 20, height: 20, color: active ? "var(--t-green)" : "rgb(var(--ink) / 0.65)" }} strokeWidth={1.7} />
      <span className="font-cinzel text-[17px] leading-tight truncate" style={{ color: active ? "hsl(var(--foreground))" : "rgb(var(--ink) / 0.8)", fontWeight: active ? 700 : 500 }}>
        {label}
      </span>
    </Link>
  );
}