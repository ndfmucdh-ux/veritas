import { Link } from "react-router-dom";

export default function BottomNavItem({ path, icon: Icon, label, active }) {
  return (
    <Link
      to={path}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`flex-1 flex flex-col items-center justify-center py-2 px-2 gap-1 min-h-14 transition-colors duration-200 ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <span className={`h-7 w-12 rounded-full flex items-center justify-center transition-colors duration-200 ${active ? "bg-primary/15" : ""}`}>
        <Icon className="w-[22px] h-[22px]" strokeWidth={1.5} />
      </span>
      <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
    </Link>
  );
}