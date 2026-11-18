import { Link } from "react-router-dom";

export default function HeaderNavPill({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="flex items-center gap-1.5 px-3 min-h-11 rounded-full text-xs font-medium text-muted-foreground hover:text-primary hover:bg-secondary transition-colors duration-200"
    >
      <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
      <span className="hidden md:inline">{label}</span>
    </Link>
  );
}