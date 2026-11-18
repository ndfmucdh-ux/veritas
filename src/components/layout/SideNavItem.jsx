import { Link } from "react-router-dom";

export default function SideNavItem({ path, icon: Icon, label, active }) {
  return (
    <Link to={path} title={label} aria-label={label} aria-current={active ? "page" : undefined}>
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 ${
          active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>
    </Link>
  );
}