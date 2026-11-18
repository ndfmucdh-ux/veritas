import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function HomeSectionHeader({ label, linkTo, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-[10px] font-inter uppercase tracking-[0.2em]" style={{ color: "rgb(var(--ink) / 0.3)" }}>{label}</p>
      {linkTo && (
        <Link to={linkTo} className="flex items-center gap-1 text-xs font-inter" style={{ color: "#00f5ff" }}>
          {linkLabel} <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}