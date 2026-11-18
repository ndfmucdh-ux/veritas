// Round initials badge for people in friends and groups.
export default function Avatar({ name = "", className = "w-10 h-10 text-sm" }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "V";
  return (
    <span aria-hidden="true" className={`rounded-full flex items-center justify-center flex-shrink-0 font-cinzel font-semibold bg-secondary text-primary border border-border ${className}`}>
      {initials}
    </span>
  );
}