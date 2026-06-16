import { Loader2, Search, X } from "lucide-react";

export default function SearchInput({ inputRef, query, onQueryChange, onClear, onSearch, loading, placeholder }) {
  return (
    <div className="relative mb-3">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onSearch()}
        placeholder={placeholder}
        className="w-full glass rounded-xl pl-12 pr-12 py-4 text-sm font-inter placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan/50 transition-all"
      />
      {query && (
        <button type="button" onClick={onClear} className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      )}
      <button
        type="button"
        onClick={() => onSearch()}
        disabled={loading || !query.trim()}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-cyan/20 hover:bg-cyan/30 text-cyan flex items-center justify-center transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
      </button>
    </div>
  );
}