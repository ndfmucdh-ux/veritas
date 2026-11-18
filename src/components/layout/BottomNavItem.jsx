import { Link } from "react-router-dom";

const ACTIVE = "var(--t-gold)";
const IDLE = "rgb(var(--ink) / 0.6)";

export default function BottomNavItem({ path, icon: Icon, label, active, onClick }) {
  const color = active ? ACTIVE : IDLE;
  const inner = (
    <>
      <Icon style={{ width: 24, height: 24, color }} strokeWidth={active ? 2 : 1.6} />
      <span className="text-[11px] font-inter text-center leading-tight" style={{ color, fontWeight: active ? 600 : 400 }}>
        {label}
      </span>
    </>
  );
  const cls = "flex-1 min-w-0 flex flex-col items-center justify-center py-2 px-1 gap-1 min-h-16";
  if (path) return <Link to={path} aria-label={label} aria-current={active ? "page" : undefined} className={cls}>{inner}</Link>;
  return <button type="button" onClick={onClick} aria-label={label} aria-haspopup="dialog" className={cls}>{inner}</button>;
}