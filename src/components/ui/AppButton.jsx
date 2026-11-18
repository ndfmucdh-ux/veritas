import { Link } from "react-router-dom";

/** Reusable button: primary uses the accent, secondary is an outline. Renders a Link when `to` is set. */
export default function AppButton({ variant = "primary", to, className = "", children, ...props }) {
  const cls = `${variant === "secondary" ? "btn-secondary" : "btn-primary"} ${className}`;
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>;
  return <button type="button" className={cls} {...props}>{children}</button>;
}