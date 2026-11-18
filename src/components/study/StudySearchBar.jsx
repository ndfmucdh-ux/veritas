import { Loader2, Search } from "lucide-react";

export default function StudySearchBar({ query, onQueryChange, onSearch, loading, placeholder }) {
  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
      <input
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onSearch()}
        placeholder={placeholder}
        className="w-full pl-10 pr-12 py-3.5 rounded-xl text-sm font-inter focus:outline-none"
        style={{ background: "var(--fill-2)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)" }}
      />
      <button
        type="button"
        onClick={onSearch}
        disabled={loading || !query.trim()}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-cinzel transition-colors disabled:opacity-40"
        style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff" }}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Go"}
      </button>
    </div>
  );
}